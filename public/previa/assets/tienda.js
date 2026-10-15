// Propuesta B — categoría con filtros y ficha de producto. Los pedidos se cierran por WhatsApp.

(function () {
  const HB = window.HB;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const WA_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.86 9.86 0 0 0 12.04 2Zm4.52 11.99c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z"/></svg>';
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
        return true;
      });
      const s = sortSel.value;
      list = [...list].sort((a, b) =>
        s === "nuevo" ? (a.date ?? 99) - (b.date ?? 99) : s === "az" ? a.name.localeCompare(b.name, "es") : b.sold - a.sold
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
          <p><span class="stock ${p.stock === "encargo" ? "stock--encargo" : ""}">${
            p.stock === "encargo" ? `Por encargo · confección ${fabric.days}` : "Disponible · confección " + fabric.days
          }</span></p>

          ${
            p.sizes.length
              ? `<div class="opt"><div class="opt-head"><span class="label">Talla</span>
                 <a class="link small" href="${HB.base}guia-de-tallas/">¿No sabes qué talla? Ver guía</a></div>
                 <div class="chips" data-sizes>${p.sizes
                   .map((s) => `<button type="button" class="chip" aria-pressed="${s === state.size}" data-v="${s}">${s}</button>`)
                   .join("")}</div></div>`
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
                .map((e) => `<button type="button" class="chip" aria-pressed="${e.id === state.style}" data-v="${e.id}">${e.name}</button>`)
                .join("")}</div></div>
              <div data-personal-fields hidden>
                <div class="fields-2" style="margin-top:14px">
                  <div class="field"><label for="bname">Nombre o iniciales para el bordado</label>
                    <input id="bname" maxlength="14" autocomplete="off" placeholder="Ej.: Amanda">
                    <span class="hint" data-bcount>0/14 · solo letras y espacios</span><span class="err" data-berr></span></div>
                  <div class="field"><label for="bdate">Fecha del evento o de entrega deseada</label>
                    <input id="bdate" type="date"><span class="hint">Mínimo 15 días: confección + bordado.</span><span class="err" data-derr></span></div>
                </div>
                <p class="hint">¿Tienes una foto de referencia? Envíala en el chat de WhatsApp.</p>
              </div>
              <div class="warn">${WARN_SVG}<span><strong>Las piezas personalizadas no tienen cambio</strong>, porque se hacen a la medida de tu bebé. Solo las cambiamos si tienen una falla de confección.</span></div>
            </div>`
              : ""
          }

          <div class="opt row" style="align-items:center;gap:14px">
            <span class="label">Cantidad</span>
            <div class="qty" aria-label="Cantidad"><button type="button" data-q="-1" aria-label="Menos">−</button><output data-qty>1</output><button type="button" data-q="1" aria-label="Más">+</button></div>
          </div>

          <div class="buy">
            <a class="btn btn--rosa" data-wa-btn target="_blank" rel="noopener">${WA_SVG} Pedir por WhatsApp</a>
            <a class="btn" href="${HB.base}armador-de-ajuar/">Armar mi ajuar</a>
          </div>
          <p class="small muted" style="margin-top:10px">Te respondemos con el precio, la disponibilidad y el tiempo de entrega.</p>

          <div class="acc" style="margin-top:22px">
            <details open><summary>Entrega</summary><div><ul>
              <li>Confección: ${fabric.days}${p.personalizable ? " · Bordado: 3 a 5 días hábiles adicionales" : ""}.</li>
              <li>Retiro en la tienda: ${HB.esc(HB.config.direccion)}.</li>
              <li>Envíos a toda Venezuela (Zoom, MRW, Tealca) y al exterior.</li>
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
              <li><strong>¿Puedo cambiar el color del bordado?</strong> Sí, cuéntanos en el chat de WhatsApp.</li>
              <li><strong>¿Llega a tiempo para mi fecha?</strong> Si nos dices la fecha del evento, te confirmamos antes de confeccionar.</li>
              <li><strong>¿Cómo pago?</strong> Pago móvil, transferencia, Zelle, USDT o en la tienda. Te damos los datos al confirmar.</li></ul></div></details>
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

    const bname = () => ($("#bname", root)?.value || "").trim();
    const dateInput = $("#bdate", root);

    // Mensaje de WhatsApp con todo lo elegido (brief 12.1)
    function refresh() {
      $("[data-qty]", root).textContent = state.qty;
      const style = HB.embroidery.find((e) => e.id === state.style);
      const parts = [
        state.size && `Talla: ${state.size}`,
        `Color: ${HB.colors[state.color].name}`,
        state.style !== "ninguno" && `Bordado: ${style.name}${bname() ? ` “${bname()}”` : ""}`,
        dateInput?.value && state.style !== "ninguno" && `Fecha deseada: ${dateInput.value.split("-").reverse().join("/")}`,
        `Cantidad: ${state.qty}`,
      ].filter(Boolean);
      $("[data-wa-btn]", root).href = HB.wa(
        `Hola, me interesa ${p.name} (${location.origin}${location.pathname}).\n${parts.join("\n")}\n¿Me envían precio y disponibilidad?`
      );
    }

    const bindChips = (sel, key, after) =>
      $$(`${sel} .chip`, root).forEach((c) =>
        c.addEventListener("click", () => {
          state[key] = c.dataset.v;
          $$(`${sel} .chip`, root).forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
          after && after();
          refresh();
        })
      );
    bindChips("[data-sizes]", "size");
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
    if (dateInput) dateInput.min = minDate;
    $("#bname", root)?.addEventListener("input", (e) => {
      const v = e.target.value;
      $("[data-bcount]", root).textContent = `${v.length}/14 · solo letras y espacios`;
      $("[data-berr]", root).textContent = NAME_OK.test(v) ? "" : "Usa solo letras y espacios (sin números ni emojis).";
      refresh();
    });
    dateInput?.addEventListener("change", () => {
      $("[data-derr]", root).textContent =
        dateInput.value && dateInput.value < minDate ? "Necesitamos al menos 15 días para confeccionar y bordar." : "";
      refresh();
    });

    $("[data-wa-btn]", root).addEventListener("click", (e) => {
      if (state.style === "ninguno") return;
      const v = bname();
      let msg = "";
      if (!v) msg = "Escribe el nombre o las iniciales, o elige “Sin bordado”.";
      else if (!NAME_OK.test(v)) msg = "Usa solo letras y espacios.";
      if (msg) {
        e.preventDefault();
        $("[data-berr]", root).textContent = msg;
        $("#bname", root).focus();
      }
    });

    // Productos relacionados ("Completa el look")
    const rel = $("[data-related]");
    if (rel) {
      const list = HB.products.filter((x) => x.slug !== p.slug && (x.cat === p.cat || x.tags.includes("mas-vendido"))).slice(0, 4);
      rel.innerHTML = list.map(HB.card).join("");
    }

    refresh();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const c = $("[data-category]");
    if (c) category(c);
    const p = $("[data-product]");
    if (p) product(p);
  });
})();
