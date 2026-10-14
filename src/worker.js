/**
 * Hilitos Bebé — Cloudflare Worker
 *
 *  - "/"            → página "Muy pronto" (public/index.html)
 *  - "/preview/*"   → sitio completo (public/preview/), sin indexar en Google
 *  - "/api/instagram" → últimas publicaciones de @hilitosbebe para la galería
 *  - cron semanal   → renueva el token de Instagram (dura 60 días)
 *
 * Para lanzar el sitio, cambia SITE_LIVE a "true" en wrangler.jsonc:
 * el contenido de /preview pasa a servirse desde la raíz.
 */

const PREVIEW = "/preview";
const FEED_CACHE_SECONDS = 30 * 60;
const FEED_LIMIT = 24;
const IG_FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/api/instagram") {
      return instagramFeed(request, env, ctx);
    }

    if (env.SITE_LIVE === "true") {
      return serveLive(request, url, env);
    }

    const res = await env.ASSETS.fetch(request);
    if (url.pathname === PREVIEW || url.pathname.startsWith(PREVIEW + "/")) {
      return withHeaders(res, { "X-Robots-Tag": "noindex, nofollow" });
    }
    return res;
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(refreshInstagramToken(env));
  },
};

/* ------------------------------------------------------------------ */
/* Lanzamiento: sirve /preview/* desde la raíz                         */
/* ------------------------------------------------------------------ */

async function serveLive(request, url, env) {
  if (url.pathname === PREVIEW || url.pathname.startsWith(PREVIEW + "/")) {
    url.pathname = url.pathname.slice(PREVIEW.length) || "/";
    return Response.redirect(url.toString(), 301);
  }

  const assetUrl = new URL(url);
  assetUrl.pathname = PREVIEW + url.pathname;
  let res = await env.ASSETS.fetch(new Request(assetUrl, request));
  // Archivos compartidos de la raíz (favicon, etc.)
  if (res.status === 404) res = await env.ASSETS.fetch(request);

  // Las redirecciones de barra final apuntan a /preview/...: las corregimos.
  const location = res.headers.get("Location");
  if (location && location.startsWith(PREVIEW)) {
    return withHeaders(res, { Location: location.slice(PREVIEW.length) || "/" });
  }
  return res;
}

function withHeaders(res, headers) {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(headers)) out.headers.set(k, v);
  return out;
}

/* ------------------------------------------------------------------ */
/* Instagram                                                           */
/* ------------------------------------------------------------------ */

async function instagramFeed(request, env, ctx) {
  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/instagram", request.url).toString());
  const cached = await cache.match(cacheKey);
  if (cached) return withHeaders(cached, { "Cache-Control": "public, max-age=300" });

  let payload;
  try {
    const posts = await fetchPosts(env);
    payload = posts ? { configured: true, posts } : { configured: false, posts: [] };
    if (posts?.length && env.IG_KV) {
      ctx.waitUntil(env.IG_KV.put("ig_feed_last", JSON.stringify(posts)));
    }
  } catch (err) {
    console.error("Instagram feed error:", err.message);
    const last = env.IG_KV && (await env.IG_KV.get("ig_feed_last", "json"));
    payload = { configured: true, stale: true, posts: last || [] };
  }

  // El navegador guarda 5 min; el borde de Cloudflare, 30 min.
  const body = JSON.stringify(payload);
  const edgeTtl = payload.stale ? 60 : FEED_CACHE_SECONDS;
  const json = { "Content-Type": "application/json; charset=utf-8" };
  ctx.waitUntil(
    cache.put(cacheKey, new Response(body, { headers: { ...json, "Cache-Control": `public, max-age=${edgeTtl}` } }))
  );
  return new Response(body, {
    headers: { ...json, "Cache-Control": `public, max-age=${Math.min(edgeTtl, 300)}` },
  });
}

/** Devuelve null si Instagram aún no está configurado. */
async function fetchPosts(env) {
  // Opción A: API oficial de Instagram (token de cuenta profesional).
  // Probamos el token renovado (KV) y, si falla, el secreto original.
  const tokens = await getTokens(env);
  for (const [i, token] of tokens.entries()) {
    const api = new URL("https://graph.instagram.com/me/media");
    api.searchParams.set("fields", IG_FIELDS);
    api.searchParams.set("limit", String(FEED_LIMIT));
    api.searchParams.set("access_token", token);
    const res = await fetch(api);
    if (!res.ok) {
      if (i < tokens.length - 1) continue;
      throw new Error(`Instagram API ${res.status}: ${await res.text()}`);
    }
    const { data = [] } = await res.json();
    return data.map((p) => ({
      id: p.id,
      type: p.media_type,
      image: p.media_type === "VIDEO" ? p.thumbnail_url : p.media_url,
      permalink: p.permalink,
      caption: p.caption || "",
      timestamp: p.timestamp,
    }));
  }

  // Opción B: feed JSON de un servicio como Behold.so (ellos renuevan el token).
  if (env.INSTAGRAM_FEED_URL) {
    const res = await fetch(env.INSTAGRAM_FEED_URL);
    if (!res.ok) throw new Error(`Feed ${res.status}`);
    const json = await res.json();
    const list = Array.isArray(json) ? json : json.posts || [];
    return list.slice(0, FEED_LIMIT).map((p) => ({
      id: p.id,
      type: p.mediaType,
      image: p.sizes?.large?.mediaUrl || (p.mediaType === "VIDEO" ? p.thumbnailUrl : p.mediaUrl),
      permalink: p.permalink,
      caption: p.caption || "",
      timestamp: p.timestamp,
    }));
  }

  return null;
}

async function getTokens(env) {
  const stored = env.IG_KV && (await env.IG_KV.get("ig_token"));
  return [...new Set([stored, env.INSTAGRAM_TOKEN].filter(Boolean))];
}

async function refreshInstagramToken(env) {
  const [token] = await getTokens(env);
  if (!token) return;
  const api = new URL("https://graph.instagram.com/refresh_access_token");
  api.searchParams.set("grant_type", "ig_refresh_token");
  api.searchParams.set("access_token", token);
  const res = await fetch(api);
  if (!res.ok) {
    console.error("Token refresh failed:", res.status, await res.text());
    return;
  }
  const { access_token } = await res.json();
  if (access_token && env.IG_KV) await env.IG_KV.put("ig_token", access_token);
}
