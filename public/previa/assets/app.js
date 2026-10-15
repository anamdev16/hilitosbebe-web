// Propuesta B — utilidades comunes: carrito, búsqueda, WhatsApp, encabezado.

(function () {
  const HB = window.HB;
  const script = document.currentScript;
  HB.base = script ? script.src.replace(/assets\/app\.js.*$/, "") : "/previa/";

  /* ---------- Formatos ---------- */

  HB.usd = (n) => "$" + Number(n).toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  HB.bs = (n) =>
    "Bs " + (n * HB.config.tasa).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  HB.tasaTxt = () => HB.config.tasa.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  HB.esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  HB.norm = (s) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  HB.ph = (icon, tone, label = "", cls = "") =>
    `<div class="ph ${cls}" style="--tone:${HB.tones[tone] || tone || HB.tones.arena}" data-label="${HB.esc(label)}">` +
    `<svg viewBox="0 0 64 64" aria-hidden="true">${HB.icons[icon] || HB.icons.regalo}</svg></div>`;

  HB.productUrl = (p) => `${HB.base}producto/${p.slug}/`;
  HB.catUrl = (slug) => `${HB.base}colecciones/${slug}/`;

  /* ---------- WhatsApp (brief 12.1) ---------- */

  HB.wa = (msg) => `https://wa.me/${HB.config.whatsapp}?text=${encodeURIComponent(msg)}`;
  HB.waProduct = (p, size, color) =>
    HB.wa(
      `Hola, me interesa ${p.name} (${location.origin}${HB.productUrl(p)}).` +
        (size || color ? ` Vi que es talla ${size || "—"} y color ${color || "—"}.` : "") +
        " ¿Está disponible?"
    );

  /* ---------- Almacenamiento seguro ---------- */

  const store = {
    get(key, fallback) {
      try {
        const v = JSON.parse(localStorage.getItem(key));
        return v ?? fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    },
  };
  HB.store = store;

  /* ---------- Carrito (persiste 30 días, RF-29) ---------- */

  const CART_KEY = "hb_previa_cart";
  const THIRTY_DAYS = 30 * 24 * 3600 * 1000;

  HB.cart = {
    lines() {
      const data = store.get(CART_KEY, null);
      if (!data || Date.now() - data.t > THIRTY_DAYS) return [];
      return data.lines || [];
    },
    save(lines) {
      store.set(CART_KEY, { t: Date.now(), lines });
      HB.updateBadges();
    },
    add(line) {
      const lines = HB.cart.lines();
      const key = JSON.stringify({ ...line, qty: 0 });
      const same = lines.find((l) => JSON.stringify({ ...l, qty: 0 }) === key);
      if (same) same.qty += line.qty;
      else lines.push(line);
      HB.cart.save(lines);
    },
    count() {
      return HB.cart.lines().reduce((n, l) => n + l.qty, 0);
    },
    total() {
      return HB.cart.lines().reduce((n, l) => n + l.unit * l.qty, 0);
    },
  };

  HB.updateBadges = () => {
    const n = HB.cart.count();
    document.querySelectorAll("[data-cart-count]").forEach((b) => {
      b.textContent = n;
      b.dataset.count = n;
    });
  };

  /* ---------- Aviso ---------- */

  HB.toast = (msg, href, linkText) => {
    let t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.innerHTML = HB.esc(msg) + (href ? ` <a href="${href}">${HB.esc(linkText)}</a>` : "");
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 3800);
  };

  /* ---------- Tarjeta de producto ---------- */

  HB.priceLabel = (p) => (p.quote && !p.price ? "Precio a consultar" : (p.from ? "desde " : "") + HB.usd(p.price));

  HB.card = (p) => {
    const tags = [];
    if (p.personalizable) tags.push('<span class="tag">Personalizable</span>');
    if (p.tags.includes("nuevo")) tags.push('<span class="tag tag--salvia">Nuevo</span>');
    if (p.tags.includes("regalo")) tags.push('<span class="tag tag--ocre">Regalo</span>');
    if (p.stock === "encargo") tags.push('<span class="tag tag--ocre">Por encargo</span>');
    const flag = p.tags.includes("mas-vendido") ? '<span class="flag">Más vendido</span>' : "";
    return `<article class="pcard">${flag}
      <a href="${HB.productUrl(p)}">${HB.ph(p.icon, p.tone, "foto de ejemplo")}
        <h3>${HB.esc(p.name)}</h3>
        <p class="price">${HB.priceLabel(p)} ${p.price ? `<small>· ${HB.bs(p.price)}</small>` : ""}</p>
      </a>
      <div class="tags">${tags.join("")}</div>
      <a class="btn wa-quick" href="${HB.waProduct(p)}" target="_blank" rel="noopener" data-wa="tarjeta">Pedir por WhatsApp</a>
    </article>`;
  };

  /* ---------- Búsqueda con tolerancia a errores (RF-05) ---------- */

  const lev = (a, b) => {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  };

  HB.search = (q) => {
    const terms = HB.norm(q).split(/\s+/).filter((t) => t.length > 1);
    if (!terms.length) return [];
    return HB.products
      .map((p) => {
        const hay = HB.norm(
          [p.name, p.short, HB.byCat(p.cat).name, HB.fabrics[p.fabric]?.name, ...p.colors.map((c) => HB.colors[c].name), p.personalizable ? "bordado personalizado nombre" : ""].join(" ")
        );
        const words = hay.split(/[^a-z0-9]+/);
        let score = 0;
        for (const t of terms) {
          if (hay.includes(t)) score += 3;
          else if (t.length >= 4 && words.some((w) => w.length >= 3 && lev(t, w.slice(0, t.length + 1)) <= 1)) score += 1;
          else return null;
        }
        return { p, score: score + p.sold / 1000 };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.p);
  };

  function setupSearch() {
    const box = document.querySelector(".search");
    if (!box) return;
    const input = box.querySelector("input");
    const res = box.querySelector(".search-res");
    const open = () => {
      box.classList.add("open");
      setTimeout(() => input.focus(), 30);
      render();
    };
    const close = () => box.classList.remove("open");
    const render = () => {
      const q = input.value.trim();
      const list = q ? HB.search(q) : [...HB.products].sort((a, b) => b.sold - a.sold).slice(0, 5);
      const head = q ? "" : '<p class="label" style="margin:14px 8px 4px">Lo más pedido</p>';
      res.innerHTML =
        head +
        (list.length
          ? list
              .slice(0, 8)
              .map(
                (p) =>
                  `<a href="${HB.productUrl(p)}">${HB.ph(p.icon, p.tone)}<span>${HB.esc(p.name)}<br><small class="muted">${HB.esc(
                    HB.byCat(p.cat).name
                  )}</small></span><span class="small">${HB.priceLabel(p)}</span></a>`
              )
              .join("")
          : `<div class="empty" style="margin-top:14px"><p>No encontramos “${HB.esc(q)}”.</p>
             <a class="btn btn--rosa" href="${HB.wa("Hola, estoy buscando: " + q)}" target="_blank" rel="noopener">Preguntar por WhatsApp</a></div>`);
    };
    input.addEventListener("input", render);
    document.querySelectorAll("[data-open-search]").forEach((b) => b.addEventListener("click", open));
    box.addEventListener("click", (e) => e.target === box && close());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        open();
      }
    });
  }

  /* ---------- Encabezado ---------- */

  function setupHeader() {
    document.querySelectorAll(".dd > button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const dd = btn.parentElement;
        const open = dd.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
    });
    document.addEventListener("click", () =>
      document.querySelectorAll(".dd.open").forEach((d) => {
        d.classList.remove("open");
        d.querySelector("button").setAttribute("aria-expanded", "false");
      })
    );
    const drawer = document.querySelector(".drawer");
    document.querySelectorAll("[data-open-menu]").forEach((b) =>
      b.addEventListener("click", () => {
        drawer.classList.add("open");
        b.setAttribute("aria-expanded", "true");
      })
    );
    drawer?.addEventListener("click", (e) => {
      if (e.target === drawer || e.target.closest("[data-close-menu]")) drawer.classList.remove("open");
    });
  }

  /* ---------- Inicio: rotación del hero (2–3 campañas) ---------- */

  function setupHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    const slides = JSON.parse(hero.dataset.hero);
    const dots = hero.querySelector(".dots");
    let i = 0;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      const s = slides[i];
      hero.querySelector("[data-k=label]").textContent = s.label;
      hero.querySelector("[data-k=title]").textContent = s.title;
      hero.querySelector("[data-k=text]").textContent = s.text;
      const a = hero.querySelector("[data-k=cta]");
      a.textContent = s.cta;
      a.href = HB.base + s.href;
      hero.querySelector("[data-k=photo]").innerHTML = HB.ph(s.icon, s.tone, "foto hero · " + s.photo);
      dots.querySelectorAll("button").forEach((d, k) => d.setAttribute("aria-current", String(k === i)));
    };
    dots.innerHTML = slides.map((s, k) => `<button type="button" aria-label="Campaña ${k + 1}"></button>`).join("");
    dots.querySelectorAll("button").forEach((d, k) => d.addEventListener("click", () => (show(k), restart())));
    let timer;
    const restart = () => {
      clearInterval(timer);
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => show(i + 1), 7000);
    };
    show(0);
    restart();
  }

  /* ---------- Bloques que se llenan con el catálogo ---------- */

  function fillBlocks() {
    document.querySelectorAll("[data-products]").forEach((el) => {
      const [kind, value, limit] = el.dataset.products.split(":");
      let list = HB.products;
      if (kind === "tag") list = list.filter((p) => p.tags.includes(value));
      if (kind === "cat") list = list.filter((p) => p.cat === value);
      if (kind === "top") list = [...list].filter((p) => p.price).sort((a, b) => b.sold - a.sold);
      el.innerHTML = list.slice(0, Number(limit) || 8).map(HB.card).join("");
    });
    document.querySelectorAll("[data-ig]").forEach((el) => {
      fetch("/api/instagram")
        .then((r) => (r.ok ? r.json() : { posts: [] }))
        .then(({ posts = [] }) => {
          const list = posts.filter((p) => p.image).slice(0, 8);
          if (!list.length) return;
          el.innerHTML = list
            .map(
              (p) =>
                `<a href="${HB.esc(p.permalink)}" target="_blank" rel="noopener"><img src="${HB.esc(p.image)}" alt="${HB.esc(
                  (p.caption || "Publicación de Hilitos Bebé").slice(0, 100)
                )}" loading="lazy"></a>`
            )
            .join("");
        })
        .catch(() => {});
    });
    document.querySelectorAll("[data-tasa]").forEach((el) => {
      el.textContent = `Bs ${HB.tasaTxt()} por USD · ${HB.config.tasaFecha}`;
    });
  }

  /* ---------- Formularios que terminan en WhatsApp ---------- */

  function setupWaForms() {
    document.querySelectorAll("form[data-wa-form]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        let ok = true;
        form.querySelectorAll("[required]").forEach((f) => {
          const bad = !f.value.trim() || (f.type === "tel" && f.value.replace(/\D/g, "").length < 10);
          f.closest(".field")?.classList.toggle("invalid", bad);
          const err = f.closest(".field")?.querySelector(".err");
          if (err) err.textContent = bad ? (f.type === "tel" ? "Escribe un número de WhatsApp válido." : "Este campo es obligatorio.") : "";
          if (bad && ok) {
            f.focus();
            ok = false;
          }
        });
        if (!ok) return;
        const data = Object.fromEntries(new FormData(form));
        const msg = form.dataset.waForm.replace(/\{(\w+)\}/g, (_, k) => data[k] || "—");
        window.open(HB.wa(msg), "_blank", "noopener");
        const done = form.querySelector("[data-done]");
        if (done) done.hidden = false;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupHeader();
    setupSearch();
    setupHero();
    fillBlocks();
    setupWaForms();
    HB.updateBadges();
  });
})();
