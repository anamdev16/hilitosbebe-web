# Hilitos Bebé — hilitosbebe.com

Website for **Hilitos Bebé**, handmade baby bedding, décor and children's clothing in Caracas, Venezuela ([@hilitosbebe](https://www.instagram.com/hilitosbebe/)). The site is in Spanish.

| URL | What it shows |
| --- | --- |
| `hilitosbebe.com` | "Muy pronto" (coming soon) page |
| `hilitosbebe.com/preview/` | The full site: Inicio, Nosotros, Galería, Cómo comprar, Contacto. Search engines are told not to index it. |
| `hilitosbebe.com/api/instagram` | Latest Instagram posts as JSON, used by the gallery |

Every push to `main` (or `master`) deploys to Cloudflare through GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

## How it works

- One **Cloudflare Worker** ([`src/worker.js`](src/worker.js)) serves the static files in [`public/`](public/) and owns the `hilitosbebe.com` and `www.hilitosbebe.com` custom domains (`www` redirects to the apex).
- `public/index.html` is the coming-soon page. `public/preview/` is the full site.
- The **gallery** fetches `/api/instagram`. The Worker calls the Instagram API, caches the result for 30 minutes and keeps a last-known-good copy in KV. New posts show up within about 30 minutes, with no redeploy.
- A **weekly cron** refreshes the Instagram token, which otherwise expires after 60 days.
- Until Instagram is connected, the gallery shows illustrated garments and a link to the Instagram profile.

## One-time setup

### 1. Let GitHub deploy to Cloudflare

1. In Cloudflare, go to **My Profile → API Tokens → Create Token** and use the **Edit Cloudflare Workers** template. Under *Zone Resources* choose `hilitosbebe.com`. Also add the permission **Zone → DNS → Edit** so the custom domain can be created.
2. Copy your **Account ID**. It's on the right-hand side of the Cloudflare dashboard's overview page.
3. Save both values as GitHub secrets. Each command asks you to paste the value:

   ```bash
   gh secret set CLOUDFLARE_API_TOKEN -R anamdev16/hilitosbebe-web
   gh secret set CLOUDFLARE_ACCOUNT_ID -R anamdev16/hilitosbebe-web
   ```

4. In Cloudflare **DNS** for `hilitosbebe.com`, delete any existing `A`, `AAAA` or `CNAME` records for `hilitosbebe.com` and `www` (for example registrar parking records). Otherwise the Worker can't take over the domain.
5. Re-run the workflow under **Actions → Deploy a Cloudflare → Run workflow**, or push any commit to `main`.

The first deploy also creates the `IG_KV` storage automatically.

### 2. Connect Instagram (gallery)

Choose one option.

**Option A: official Instagram API (free; requires a Meta developer app)**

1. The @hilitosbebe account must be a **Business** or **Creator** account. Check in Instagram under Settings → Account type.
2. At [developers.facebook.com](https://developers.facebook.com/), create an app and add the **Instagram** product ("API setup with Instagram login").
3. Under *Generate access tokens*, add the @hilitosbebe account and generate a token. That is a long-lived token, valid for 60 days. The Worker renews it weekly.
4. Save it as a Worker secret:

   ```bash
   npx wrangler secret put INSTAGRAM_TOKEN
   ```

**Option B: Behold.so (no developer app, about 5 minutes)**

1. Create a free account at [behold.so](https://behold.so), connect @hilitosbebe and create a **JSON feed**.
2. Copy the feed URL, which looks like `https://feeds.behold.so/...`, and save it:

   ```bash
   npx wrangler secret put INSTAGRAM_FEED_URL
   ```

Behold renews the token for you. Its free plan refreshes the feed less often than Option A.

To confirm it works, open `https://hilitosbebe.com/api/instagram`. It should return `"configured": true` and a list of posts.

## Launching the full site

In [`wrangler.jsonc`](wrangler.jsonc), change `"SITE_LIVE": "false"` to `"true"` and push to `main`. After that:

- `/` and the other pages serve the full site, so `/galeria/`, `/nosotros/` and so on work.
- Old `/preview/...` links redirect permanently to the same page without `/preview`.
- The `noindex` header is removed, so Google can index the site.

To return to the coming-soon page, set it back to `"false"`.

## Local development

```bash
npm install
npm run dev        # http://localhost:8787 and http://localhost:8787/preview/
```

To test the gallery locally, create a `.dev.vars` file containing `INSTAGRAM_TOKEN=...` or `INSTAGRAM_FEED_URL=...`. The file is gitignored.

## Content to review with the owner

Some copy was written as a placeholder and should be confirmed before launch:

- **Nosotros**: the story, mission, vision and values.
- **Contacto**: store hours. Right now the page says to ask on WhatsApp.
- **Cómo comprar**: shipping, payment methods and delivery times. These are written generically and ask customers to confirm on WhatsApp. The size guide uses general reference measurements.
- **Inicio**: the "55K+ familias nos siguen" figure is the Instagram follower count as of October 2026.
- Real photos: the hero uses an illustration. Product photos can be swapped in at `public/preview/assets/` once available.

## Project structure

```
public/
  index.html            coming-soon page (hilitosbebe.com)
  404.html, robots.txt, favicon.svg
  preview/              full site (hilitosbebe.com/preview/)
    index.html          Inicio
    nosotros/           Nuestra historia, misión, visión, valores
    galeria/            Instagram gallery: clothesline + polaroid wall
    pedidos/            Cómo comprar, guía de tallas, cuidados, FAQ
    contacto/           Address, map, WhatsApp, Instagram
    assets/             styles.css, main.js, gallery.css, gallery.js
src/worker.js           routing, Instagram API, token refresh
wrangler.jsonc          Cloudflare config (domains, KV, cron, SITE_LIVE)
```
