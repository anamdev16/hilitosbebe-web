// Propuesta B — categoría con filtros, ficha de producto, carrito y checkout.

(function () {
  const HB = window.HB;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const WARN_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17v.5"/></svg>';

  /* ================= Categoría (brief 5.3) ================= */

  function category(root) {
    const slug = root.dataset.category;
    const params = new URLSearchParams(location.search);
    let base = slug === "todo" ? HB.products : HB.products.filter((p) => p.cat === slug);
    const preTag = params.get("tag");

    const sizes = HB.sizes.filter((s) => base.some((p) => p.sizes.includes(s)));
    const colors = Object.keys(HB.colors).filter((c) => base.some((p) => p.colors.includes(c)));
    const groups = [
      slug === "todo" && { key: "cat", title: "Categoría", opts: HB.categories.map((c) => [c.slug, c.short]) },
      sizes.length && { key: "size", title: "Talla", opts: sizes.map((s) => [s, s]) },
      colors.length > 1 && { key: "color", title: "Color", opts: colors.map((c) => [c, HB.colors[c].name]) },
      { key: "bordado", title: "Personalización", opts: [["si", "Con bordado"], ["no", "Sin bordado"]] },
      { key: "precio", title: "Precio", opts: [["0-30", "Hasta $30"], ["30-60", "$30 – $60"], ["60-9999", "Más de $60"]] },
      { key: "stock", title: "Disponibilidad", opts: [["stock", "En stock"], ["encargo", "Por encargo"]] },
      { key: "tag", title: "Destacados", opts: [["mas-vendido", "Más vendido"], ["nuevo", "Nuevo"], ["regalo", "Regalo"], ["combo", "Combos"]] },
    ].filter(Boolean);

    const form = $(".filters", root);
    form.innerHTML =
      `<div class="sec-head" style="margin-bottom:12px"><span class="label">Filtros</span>
       <button type="button" class="link" data-clear style="background:none;border:0;cursor:pointer">Limpiar</button></div>` +
      groups
        .map(
          (g) => `<fieldset><legend class="label">${g.title}</legend>${g.opts
            .map(
              ([v, t]) =>
                `<label class="check"><input type="checkbox" name="${g.key}" value="${v}" ${
                  (g.key === "tag" && v === preTag) || (g.key === "bordado" && v === "si" && preTag === "personalizable") ? "checked" : ""
                }> ${t}</label>`
            )
            .join("")}</fieldset>`
        )
        .join("") +
      `<button type="button" class="btn btn--rosa btn--block filters-btn" data-close-filters>Ver productos</button>`;

    const grid = $("[data-grid]", root);
    const count = $("[data-count]", root);
    const sortSel = $("select[name=sort]", root);

    function apply() {
      const sel = {};
      $$("input:checked", form).forEach((i) => (sel[i.name] = [...(sel[i.name] || []), i.value]));
      let list = base.filter((p) => {
        if (sel.cat && !sel.cat.includes(p.cat)) return false;
        if (sel.size && !p.sizes.some((s) => sel.size.includes(s))) return false;
        if (sel.color && !p.colors.some((c) => sel.color.includes(c))) return false;
        if (sel.bordado && !sel.bordado.includes(p.personalizable ? "si" : "no")) return false;
        if (sel.stock && !sel.stock.includes(p.stock)) return false;
        if (sel.tag && !p.tags.some((t) => sel.tag.includes(t))) return false;
        if (sel.precio && !sel.precio.some((r) => { const [a, b] = r.split("-").map(Number); return p.price >= a && p.price < b; })) return false;
        return true;
      });
      const s = sortSel.value;
      list = [...list].sort((a, b) =>
        s === "nuevo" ? (a.date ?? 99) - (b.date ?? 99) : s === "asc" ? a.price - b.price : s === "desc" ? b.price - a.price : b.sold - a.sold
      );
      count.textContent = `${list.length} ${list.length === 1 ? "producto" : "productos"}`;
      $("[data-close-filters]", form).textContent = `Ver ${list.length} productos`;
      grid.innerHTML = list.length
        ? list.map(HB.card).join("")
        : `<div class="empty" style="grid-column:1/-1"><p>No hay piezas con esos filtros.</p>
           <a class="btn btn--rosa" href="${HB.wa("Hola, busco una pieza que no encuentro en la web.")}" target="_blank" rel="noopener">Pregúntanos por WhatsApp</a></div>`;
    }

    form.addEventListener("change", apply);
    sortSel.addEventListener("change", apply);
    $("[data-clear]", form).addEventListener("click", () => {
      $$("input", form).forEach((i) => (i.checked = false));
      apply();
    });
    $("[data-open-filters]", root)?.addEventListener("click", () => form.classList.add("open"));
    $("[data-close-filters]", form).addEventListener("click", () => form.classList.remove("open"));
    apply();
  }

  /* ================= Ficha de producto (brief 5.5) ================= */

  const SHOTS = [
    ["producto completo", 0],
    ["detalle del bordado", 1],
    ["textura de la tela", 2],
    ["en uso con bebé", 3],
    ["escala", 4],
    ["empaque de regalo", 5],
  ];
  const TONES = ["rosa", "arena", "salvia", "lino", "cielo", "ocre"];

  function product(root) {
    const p = HB.bySlug(root.dataset.product);
    if (!p) return;
    const cat = HB.byCat(p.cat);
    const fabric = HB.fabrics[p.fabric];
    const state = { size: p.sizes.length === 1 ? p.sizes[0] : "", color: p.colors[0], style: "ninguno", qty: 1 };
    const shotTones = SHOTS.map((_, i) => (i === 0 ? p.tone : TONES[(TONES.indexOf(p.tone) + i) % TONES.length]));
    const isQuoteOnly = p.quote && !p.price;

    root.innerHTML = `
      <div class="product">
        <div class="gallery">
          <div class="thumbs">${SHOTS.map(
            ([l], i) => `<button type="button" aria-label="Foto: ${l}" aria-current="${i === 0}" data-shot="${i}">${HB.ph(p.icon, shotTones[i])}</button>`
          ).join("")}</div>
          <div data-main>${HB.ph(p.icon, p.tone, "1/6 · " + SHOTS[0][0])}</div>
        </div>

        <div>
          <span class="label label--rosa">${HB.esc(cat.name)}</span>
          <h1 style="margin-top:6px">${HB.esc(p.name)}</h1>
          <p class="muted">${HB.esc(p.short)}</p>
          ${
            isQuoteOnly
              ? `<p class="p-price">Precio a consultar</p><p class="p-bs">Te enviamos una cotización en 24–48 h hábiles.</p>`
              : `<p class="p-price" data-price></p><p class="p-bs" data-bs></p>`
          }
          <p><span class="stock ${p.stock === "encargo" ? "stock--encargo" : ""}">${
            p.stock === "encargo" ? `Por encargo · confección ${fabric.days}` : "En stock · listo para enviar"
          }</span></p>

          ${
            p.sizes.length
              ? `<div class="opt"><div class="opt-head"><span class="label">Talla</span>
                 <a class="link small" href="${HB.base}guia-de-tallas/" data-size-guide>¿No sabes qué talla? Ver guía</a></div>
                 <div class="chips" data-sizes>${p.sizes
                   .map((s) => `<button type="button" class="chip" aria-pressed="${s === state.size}" data-v="${s}">${s}</button>`)
                   .join("")}</div><p class="err" data-size-err></p></div>`
              : ""
          }

          <div class="opt"><div class="opt-head"><span class="label">Color / tema</span><span class="small muted" data-color-name>${
            HB.colors[state.color].name
          }</span></div>
            <div class="chips" data-colors>${p.colors
              .map(
                (c) =>
                  `<button type="button" class="chip swatch" aria-pressed="${c === state.color}" data-v="${c}"><i style="--c:${HB.colors[c].hex}"></i>${HB.colors[c].name}</button>`
              )
              .join("")}</div></div>

          ${
            p.personalizable
              ? `<div class="personal">
              <span class="label label--rosa">Personalización (opcional)</span>
              <div class="opt" style="margin-top:12px"><div class="chips" data-styles>${HB.embroidery
                .map(
                  (e) =>
                    `<button type="button" class="chip" aria-pressed="${e.id === state.style}" data-v="${e.id}">${e.name}${e.extra ? ` <small>+${HB.usd(e.extra)}</small>` : ""}</button>`
                )
                .join("")}</div></div>
              <div data-personal-fields hidden>
                <div class="fields-2" style="margin-top:14px">
                  <div class="field"><label for="bname">Nombre o iniciales para el bordado</label>
                    <input id="bname" maxlength="14" autocomplete="off" placeholder="Ej.: Amanda">
                    <span class="hint" data-bcount>0/14 · solo letras y espacios</span><span class="err" data-berr></span></div>
                  <div class="field"><label for="bdate">Fecha del evento o de entrega deseada</label>
                    <input id="bdate" type="date"><span class="hint">Mínimo 15 días: confección + bordado.</span><span class="err" data-derr></span></div>
                </div>
                <div class="field"><label for="bref">Sube una referencia del bordado (opcional, hasta 3)</label>
                  <input id="bref" type="file" accept="image/*" multiple><span class="hint" data-refs></span></div>
              </div>
              <div class="warn">${WARN_SVG}<span><strong>Las piezas personalizadas no tienen cambio</strong>, porque se hacen a la medida de tu bebé. Solo las cambiamos si tienen una falla de confección.</span></div>
            </div>`
              : ""
          }

          <div class="opt row" style="align-items:center;justify-content:space-between">
            <div class="qty" aria-label="Cantidad"><button type="button" data-q="-1" aria-label="Menos">−</button><output data-qty>1</output><button type="button" data-q="1" aria-label="Más">+</button></div>
          </div>

          <div class="buy">
            ${
              isQuoteOnly
                ? `<a class="btn btn--rosa" data-quote target="_blank" rel="noopener">Solicitar cotización</a>`
                : `<button type="button" class="btn btn--rosa" data-add>Agregar al carrito</button>`
            }
            <a class="btn" data-wa-btn target="_blank" rel="noopener">Pedir por WhatsApp</a>
          </div>
          ${
            isQuoteOnly
              ? ""
              : `<p class="small" style="margin-top:12px"><a class="link" data-quote target="_blank" rel="noopener">Lo quiero cotizar primero</a> · o <a class="link" href="${HB.base}armador-de-ajuar/">arma tu ajuar paso a paso</a></p>`
          }

          <div class="acc" style="margin-top:22px">
            <details open><summary>Entrega</summary><div><ul>
              <li>Confección: ${fabric.days}${p.personalizable ? " · Bordado: 3 a 5 días hábiles adicionales" : ""}.</li>
              <li>Retiro sin costo en la tienda: ${HB.esc(HB.config.direccion)}.</li>
              <li>Envíos a toda Venezuela (Zoom, MRW, Tealca) y al exterior con cotización por WhatsApp.</li>
              <li><a class="link" href="${HB.base}envios-y-entregas/">Ver envíos y tiempos</a></li></ul></div></details>
            <details><summary>Cuidados y materiales</summary><div><ul>
              <li>Tela: ${fabric.name}. Composición exacta <span class="pending">por confirmar</span></li>
              <li>Lavar a mano o en ciclo delicado, con agua fría y jabón neutro.</li>
              <li>Planchar por el revés, sin pasar directo sobre el bordado.</li>
              <li><a class="link" href="${HB.base}guia-de-tallas/#cuidados">Ver cuidado de telas</a></li></ul></div></details>
            ${p.includes ? `<details open><summary>Lo que incluye</summary><div><ul>${p.includes.map((i) => `<li>${HB.esc(i)}</li>`).join("")}</ul></div></details>` : ""}
            ${
              p.sizes.length
                ? `<details><summary>Guía de tallas resumida</summary><div><div class="table-wrap"><table>
                  <thead><tr><th>Talla</th><th>Peso</th><th>Estatura</th></tr></thead><tbody>
                  ${[["RN", "hasta 3,5 kg", "hasta 50 cm"], ["0 m", "3,5–5 kg", "50–56 cm"], ["3 m", "5–6,5 kg", "56–62 cm"], ["6 m", "6,5–8 kg", "62–68 cm"], ["9 m", "8–9 kg", "68–74 cm"], ["12 m", "9–10 kg", "74–80 cm"]]
                    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
                    .join("")}</tbody></table></div>
                  <p class="small" style="margin-top:8px">Si tu bebé está entre dos tallas, pide la mayor: los primeros meses crecen rápido.</p></div></details>`
                : ""
            }
            <details><summary>Preguntas frecuentes</summary><div><ul>
              <li><strong>¿Puedo cambiar el color del bordado?</strong> Sí, cuéntanos en el campo de referencia o por WhatsApp.</li>
              <li><strong>¿Llega a tiempo para mi fecha?</strong> Si eliges la fecha del evento, te confirmamos antes de confeccionar.</li>
              <li><strong>¿Puedo pagar en dólares?</strong> Sí: Zelle, USDT o en tienda. En bolívares, a la tasa BCV del día.</li></ul></div></details>
          </div>
        </div>
      </div>`;

    // Galería
    $$("[data-shot]", root).forEach((b) =>
      b.addEventListener("click", () => {
        const i = Number(b.dataset.shot);
        $("[data-main]", root).innerHTML = HB.ph(p.icon, shotTones[i], `${i + 1}/6 · ${SHOTS[i][0]}`);
        $$("[data-shot]", root).forEach((x) => x.setAttribute("aria-current", String(x === b)));
      })
    );

    const extra = () => HB.embroidery.find((e) => e.id === state.style).extra;
    const unit = () => p.price + extra();

    function refresh() {
      if (!isQuoteOnly) {
        $("[data-price]", root).textContent = (p.from && state.style === "ninguno" ? "desde " : "") + HB.usd(unit() * state.qty);
        $("[data-bs]", root).innerHTML = `Precio referencial: ${HB.bs(unit() * state.qty)} · tasa BCV ${HB.tasaTxt()} del ${HB.config.tasaFecha}${
          extra() ? ` · incluye bordado +${HB.usd(extra())}` : ""
        }`;
      }
      $("[data-qty]", root).textContent = state.qty;
      const details = [state.size && `talla ${state.size}`, `color ${HB.colors[state.color].name}`, state.style !== "ninguno" && `bordado ${HB.embroidery.find((e) => e.id === state.style).name}${bname() ? ` “${bname()}”` : ""}`]
        .filter(Boolean)
        .join(", ");
      $("[data-wa-btn]", root).href = HB.wa(`Hola, me interesa ${p.name} (${location.href}). Lo quiero en ${details}. ¿Está disponible?`);
      $$("[data-quote]", root).forEach((a) => (a.href = HB.wa(`Hola, quiero cotizar ${p.name} (${location.href}): ${details}. Cantidad: ${state.qty}.`)));
    }
    const bname = () => ($("#bname", root)?.value || "").trim();

    const bindChips = (sel, key, after) =>
      $$(`${sel} .chip`, root).forEach((c) =>
        c.addEventListener("click", () => {
          state[key] = c.dataset.v;
          $$(`${sel} .chip`, root).forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
          after && after();
          refresh();
        })
      );
    bindChips("[data-sizes]", "size", () => ($("[data-size-err]", root).textContent = ""));
    bindChips("[data-colors]", "color", () => ($("[data-color-name]", root).textContent = HB.colors[state.color].name));
    bindChips("[data-styles]", "style", () => ($("[data-personal-fields]", root).hidden = state.style === "ninguno"));

    $$("[data-q]", root).forEach((b) =>
      b.addEventListener("click", () => {
        state.qty = Math.max(1, Math.min(20, state.qty + Number(b.dataset.q)));
        refresh();
      })
    );

    // Validación del bordado (RF-17) y de la fecha (RF-15)
    const NAME_OK = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ .]*$/;
    const minDate = new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10);
    const dateInput = $("#bdate", root);
    if (dateInput) dateInput.min = minDate;
    $("#bname", root)?.addEventListener("input", (e) => {
      const v = e.target.value;
      $("[data-bcount]", root).textContent = `${v.length}/14 · solo letras y espacios`;
      $("[data-berr]", root).textContent = NAME_OK.test(v) ? "" : "Usa solo letras y espacios (sin números ni emojis).";
      refresh();
    });
    $("#bref", root)?.addEventListener("change", (e) => {
      const files = [...e.target.files];
      $("[data-refs]", root).textContent = files.length > 3 ? "Máximo 3 imágenes: se usarán las 3 primeras." : files.map((f) => f.name).join(", ");
    });

    function validate() {
      let ok = true;
      if (p.sizes.length && !state.size) {
        $("[data-size-err]", root).textContent = "Elige una talla.";
        ok = false;
      }
      if (state.style !== "ninguno") {
        const v = bname();
        if (!v || !NAME_OK.test(v)) {
          $("[data-berr]", root).textContent = v ? "Usa solo letras y espacios." : "Escribe el nombre o las iniciales.";
          ok = false;
        }
        if (dateInput.value && dateInput.value < minDate) {
          $("[data-derr]", root).textContent = "Necesitamos al menos 15 días para confeccionar y bordar.";
          ok = false;
        } else $("[data-derr]", root).textContent = "";
      }
      if (!ok) root.querySelector(".err:not(:empty)")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return ok;
    }

    $("[data-add]", root)?.addEventListener("click", () => {
      if (!validate()) return;
      HB.cart.add({
        slug: p.slug,
        size: state.size,
        color: state.color,
        style: state.style,
        text: state.style === "ninguno" ? "" : bname(),
        date: state.style === "ninguno" ? "" : dateInput?.value || "",
        unit: unit(),
        qty: state.qty,
      });
      HB.toast(`${p.name} se agregó al carrito.`, `${HB.base}carrito/`, "Ver carrito");
    });

    // Productos relacionados ("Completa el look")
    const rel = $("[data-related]");
    if (rel) {
      const list = HB.products.filter((x) => x.slug !== p.slug && (x.cat === p.cat || x.tags.includes("mas-vendido"))).slice(0, 4);
      rel.innerHTML = list.map(HB.card).join("");
    }

    // Datos estructurados de producto (SEO, brief 13.3)
    if (p.price) {
      const ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: p.short,
        brand: { "@type": "Brand", name: "Hilitos Bebé" },
        offers: { "@type": "Offer", priceCurrency: "USD", price: p.price, availability: p.stock === "stock" ? "https://schema.org/InStock" : "https://schema.org/PreOrder" },
      });
      document.head.appendChild(ld);
    }
    refresh();
  }

  /* ================= Carrito y checkout (brief 5.19–5.21) ================= */

  const PAY = {
    pagomovil: { name: "Pago móvil", cur: "bs", manual: true, fields: ["Banco", "Teléfono", "Cédula / RIF", "Titular"] },
    transferencia: { name: "Transferencia en Bs", cur: "bs", manual: true, fields: ["Banco", "Nº de cuenta", "Cédula / RIF", "Titular"] },
    zelle: { name: "Zelle / USD", cur: "usd", manual: true, fields: ["Correo Zelle", "Titular"] },
    usdt: { name: "USDT · Binance Pay", cur: "usd", manual: true, fields: ["Binance Pay ID o wallet", "Red"] },
    tarjeta: { name: "Tarjeta (pasarela local)", cur: "bs", manual: false, note: "Se cobra con la pasarela local que se elija en la versión final (validación automática)." },
    cashea: { name: "Cashea · cuotas sin interés", cur: "bs", manual: false, note: "Disponible en la fase 3 del proyecto." },
  };

  function cart(root) {
    const listEl = $("[data-lines]", root);
    const sum = $("[data-summary]", root);
    const form = $("form[data-checkout]", root);

    function lineHtml(l, i) {
      const p = HB.bySlug(l.slug);
      if (!p) return "";
      const style = HB.embroidery.find((e) => e.id === l.style);
      return `<div class="line">
        <a href="${HB.productUrl(p)}">${HB.ph(p.icon, p.tone)}</a>
        <div><h3>${HB.esc(p.name)}</h3>
          <p class="meta">${[l.size && "Talla " + l.size, HB.colors[l.color]?.name].filter(Boolean).join(" · ")}</p>
          ${l.style !== "ninguno" ? `<p class="meta">Bordado: ${HB.esc(style.name)} “${HB.esc(l.text)}”${l.date ? ` · para el ${l.date.split("-").reverse().join("/")}` : ""}</p>` : ""}
          <div class="row" style="align-items:center;margin-top:8px">
            <div class="qty"><button type="button" data-i="${i}" data-d="-1" aria-label="Menos">−</button><output>${l.qty}</output><button type="button" data-i="${i}" data-d="1" aria-label="Más">+</button></div>
            <button type="button" class="rm" data-rm="${i}">Eliminar</button>
          </div></div>
        <div style="text-align:right"><strong>${HB.usd(l.unit * l.qty)}</strong><br><span class="small muted">${HB.bs(l.unit * l.qty)}</span></div>
      </div>`;
    }

    function render() {
      const lines = HB.cart.lines();
      if (!lines.length) {
        root.innerHTML = `<div class="empty"><h2>Tu carrito está vacío</h2><p class="muted">Explora las colecciones o arma tu ajuar paso a paso.</p>
          <div class="row" style="justify-content:center"><a class="btn btn--rosa" href="${HB.base}colecciones/">Ver colecciones</a><a class="btn" href="${HB.base}armador-de-ajuar/">Armar mi ajuar</a></div></div>`;
        return;
      }
      listEl.innerHTML = lines.map(lineHtml).join("");
      const hasPersonal = lines.some((l) => l.style !== "ninguno");
      $("[data-personal-note]", root).hidden = !hasPersonal;
      $("[data-encargo-note]", root).hidden = !lines.some((l) => HB.bySlug(l.slug)?.stock === "encargo" || l.style !== "ninguno");
      renderSummary();
    }

    function delivery() {
      return form.querySelector("input[name=entrega]:checked")?.value || "retiro";
    }

    function renderSummary() {
      const total = HB.cart.total();
      const env = delivery();
      sum.innerHTML = `<span class="label">Tu pedido</span>
        <ul>${HB.cart
          .lines()
          .map((l) => `<li><span>${l.qty} × ${HB.esc(HB.bySlug(l.slug)?.name || "")}</span><span>${HB.usd(l.unit * l.qty)}</span></li>`)
          .join("")}</ul>
        <div class="row" style="justify-content:space-between"><span class="muted">Subtotal</span><span>${HB.usd(total)}</span></div>
        <div class="row" style="justify-content:space-between"><span class="muted">Envío</span><span>${
          env === "retiro" ? "Gratis (retiro en tienda)" : env === "nacional" ? "Según zona y peso" : "A cotizar por WhatsApp"
        }</span></div>
        <div class="total"><span>Total</span><span>${HB.usd(total)}</span></div>
        <p class="small muted">${HB.bs(total)} · tasa BCV del ${HB.config.tasaFecha}</p>`;
      const payBox = $("[data-paybox]", root);
      const m = form.querySelector("input[name=pago]:checked")?.value;
      if (!m) {
        payBox.hidden = true;
        return;
      }
      const pm = PAY[m];
      payBox.hidden = false;
      payBox.innerHTML = pm.manual
        ? `<strong>Cómo pagar con ${pm.name}</strong>
           <dl>${pm.fields.map((f) => `<dt>${f}</dt><dd><span class="pending">la marca lo completa</span></dd>`).join("")}
             <dt>Monto exacto</dt><dd><strong>${pm.cur === "bs" ? HB.bs(total) : HB.usd(total)}</strong>${
               pm.cur === "bs" ? ` <span class="small muted">(tasa ${HB.tasaTxt()} del ${HB.config.tasaFecha})</span>` : ""
             }</dd>
             <dt>Plazo</dt><dd>24 horas para enviar el comprobante</dd></dl>
           <div class="field"><label for="comp">Sube tu comprobante (foto o PDF)</label><input id="comp" type="file" accept="image/*,application/pdf"></div>
           <p class="small muted" style="margin:0">Validamos tu pago en horas hábiles y te avisamos por correo y WhatsApp.</p>`
        : `<strong>${pm.name}</strong><p class="small" style="margin:6px 0 0">${pm.note}</p>`;
    }

    root.addEventListener("click", (e) => {
      const lines = HB.cart.lines();
      if (e.target.dataset.d) {
        const l = lines[Number(e.target.dataset.i)];
        l.qty = Math.max(1, Math.min(20, l.qty + Number(e.target.dataset.d)));
        HB.cart.save(lines);
        render();
      }
      if (e.target.dataset.rm !== undefined) {
        lines.splice(Number(e.target.dataset.rm), 1);
        HB.cart.save(lines);
        render();
      }
      if (e.target.matches("[data-coupon]")) {
        $("[data-coupon-msg]", root).textContent = "Los cupones se configuran desde el panel en la versión final.";
      }
    });

    form.addEventListener("change", (e) => {
      if (e.target.name === "entrega") {
        $$("[data-entrega]", form).forEach((b) => (b.hidden = b.dataset.entrega !== e.target.value));
      }
      if (e.target.name === "regalo") $("[data-dedicatoria]", form).hidden = !e.target.checked;
      renderSummary();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      $$("[required]", form).forEach((f) => {
        if (f.closest("[hidden]")) return;
        const v = f.value.trim();
        let msg = "";
        if (!v) msg = "Este campo es obligatorio.";
        else if (f.type === "tel" && v.replace(/\D/g, "").length < 10) msg = "Escribe un número válido, con código de área.";
        else if (f.type === "email" && !/^\S+@\S+\.\S+$/.test(v)) msg = "Revisa el correo.";
        f.closest(".field").classList.toggle("invalid", !!msg);
        f.closest(".field").querySelector(".err").textContent = msg;
        if (msg && ok) {
          f.focus();
          ok = false;
        }
      });
      const pago = form.querySelector("input[name=pago]:checked");
      $("[data-pago-err]", form).textContent = pago ? "" : "Elige un método de pago.";
      if (!pago) ok = false;
      if (!ok) return;

      const d = Object.fromEntries(new FormData(form));
      const total = HB.cart.total();
      const lines = HB.cart
        .lines()
        .map((l) => {
          const p = HB.bySlug(l.slug);
          const st = HB.embroidery.find((x) => x.id === l.style);
          return `• ${l.qty} × ${p.name} — ${[l.size && "talla " + l.size, HB.colors[l.color].name, l.style !== "ninguno" && `bordado ${st.name} “${l.text}”`].filter(Boolean).join(", ")} — ${HB.usd(l.unit * l.qty)}`;
        })
        .join("\n");
      const entrega =
        d.entrega === "retiro" ? "Retiro en tienda" : d.entrega === "nacional" ? `Envío nacional a ${d.ciudad} (${d.operador})` : `Envío internacional a ${d.destino}`;
      const msg =
        `Hola, quiero hacer este pedido:\n${lines}\n\nTotal: ${HB.usd(total)} (${HB.bs(total)})\n` +
        `Entrega: ${entrega}\nPago: ${PAY[d.pago].name}\n` +
        (d.regalo ? `Es un regalo. Dedicatoria: “${d.dedicatoria || "—"}”\n` : "") +
        `\nA nombre de: ${d.nombre} · ${d.telefono} · ${d.correo}`;
      window.open(HB.wa(msg), "_blank", "noopener");
      $("[data-confirm]", root).hidden = false;
      $("[data-confirm]", root).scrollIntoView({ behavior: "smooth" });
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const c = $("[data-category]");
    if (c) category(c);
    const p = $("[data-product]");
    if (p) product(p);
    const k = $("[data-cart]");
    if (k) cart(k);
  });
})();
