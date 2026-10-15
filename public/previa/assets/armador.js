// Propuesta B — Armador de ajuar y kit de clínica en 5 pasos (brief 5.6, RF-21 a RF-25).

(function () {
  const HB = window.HB;
  const KEY = "hb_previa_armador";
  const STEPS = ["Tipo de ajuar", "Piezas", "Colores y telas", "Bordado", "Resumen"];
  const PALETTE = ["neutro", "arena", "rosa", "azul", "blanco"];
  const NAME_OK = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ .]+$/;
  const CHECK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';

  let s = {
    step: 0,
    type: "",
    due: "",
    pieces: {},
    color: "neutro",
    fabric: "pima",
    style: "ninguno",
    text: "",
  };

  // Retomar: primero el enlace guardado (#a=...), luego el navegador.
  try {
    const m = location.hash.match(/a=([^&]+)/);
    if (m) s = { ...s, ...JSON.parse(decodeURIComponent(escape(atob(m[1])))) };
    else s = { ...s, ...(HB.store.get(KEY, {}) || {}) };
  } catch {}

  const root = document.querySelector("[data-armador]");
  if (!root) return;
  const panel = root.querySelector("[data-panel]");
  const summary = root.querySelector("[data-summary]");
  const stepper = root.querySelector(".stepper");
  const mobileSum = document.querySelector(".mobile-sum");

  const set = () => s.type && HB.builder[s.type];
  const selected = () => (set() ? set().pieces.filter((p) => s.pieces[p.id] > 0) : []);
  const style = () => HB.embroidery.find((e) => e.id === s.style);
  const piecesTotal = () => selected().reduce((n, p) => n + p.price * s.pieces[p.id], 0);
  const embroideryTotal = () => (s.style === "ninguno" ? 0 : style().extra * selected().length);
  const total = () => piecesTotal() + embroideryTotal();

  function save() {
    HB.store.set(KEY, s);
  }

  function pickType(t) {
    s.type = t;
    s.pieces = {};
    HB.builder[t].pieces.forEach((p) => {
      if (p.req) s.pieces[p.id] = p.qty || 1;
    });
  }

  function recommend() {
    if (!s.due) return "";
    const weeks = (new Date(s.due) - Date.now()) / (7 * 864e5);
    if (weeks < 0) return "";
    return weeks <= 6 ? "clinica" : "ajuar";
  }

  /* ---------- Pasos ---------- */

  const views = [
    // 1. Tipo
    () => {
      const rec = recommend();
      return `<h2>¿Qué quieres armar?</h2><p class="muted">Elige una opción o deja que te ayudemos según tu fecha de parto.</p>
      <div class="choice-grid">${["ajuar", "clinica", "cuna"]
        .map((t) => {
          const b = HB.builder[t];
          const icon = t === "ajuar" ? "body" : t === "clinica" ? "estuche" : "cuna";
          return `<button type="button" class="choice ${s.type === t ? "on" : ""}" data-type="${t}">${HB.ph(icon, t === "cuna" ? "salvia" : "rosa")}
            <span><strong>${b.name}</strong><small>${b.desc}</small></span><span class="box">${s.type === t ? CHECK : ""}</span></button>`;
        })
        .join("")}</div>
      <div class="card" style="margin-top:14px">
        <strong>Ayúdame a elegir</strong>
        <div class="field" style="margin-top:10px"><label for="due">Fecha probable de parto</label><input id="due" type="date" value="${s.due}"></div>
        ${
          rec
            ? `<p class="note">Te recomendamos empezar por el <strong>${HB.builder[rec].name.toLowerCase()}</strong>${
                rec === "clinica" ? ": tu fecha está cerca y es lo primero que necesitarás." : ": tienes tiempo para preparar todo su ajuar con calma."
              } <button type="button" class="link" style="background:none;border:0;cursor:pointer;padding:0" data-type="${rec}">Usar esta recomendación →</button></p>`
            : ""
        }
      </div>`;
    },
    // 2. Piezas
    () => `<h2>Elige las piezas de tu ${set().name.toLowerCase()}</h2>
      <p class="muted">Marca lo que quieres y ajusta la cantidad. Las piezas imprescindibles ya vienen marcadas.</p>
      <div class="choice-grid">${set()
        .pieces.map((p) => {
          const q = s.pieces[p.id] || 0;
          return `<div class="piece ${q ? "on" : ""}">${HB.ph(p.icon, q ? "rosa" : "lino")}
          <div><div class="piece-top"><label><input type="checkbox" data-piece="${p.id}" ${q ? "checked" : ""} ${p.req ? "disabled" : ""}>
            <span>${p.name}<br><small class="muted">${p.note}${p.req ? " · imprescindible" : ""}</small></span></label><span class="small">${HB.usd(p.price)}</span></div>
            <div class="qty" ${q ? "" : 'style="visibility:hidden"'}><button type="button" data-pq="${p.id}" data-d="-1" aria-label="Menos">−</button><output>${q || 1}</output><button type="button" data-pq="${p.id}" data-d="1" aria-label="Más">+</button></div>
          </div></div>`;
        })
        .join("")}</div>`,
    // 3. Colores y telas
    () => `<h2>Colores y tela</h2>
      <div class="opt"><span class="label">Paleta</span><div class="chips" style="margin-top:8px">${PALETTE.map(
        (c) => `<button type="button" class="chip swatch" aria-pressed="${s.color === c}" data-color="${c}"><i style="--c:${HB.colors[c].hex}"></i>${HB.colors[c].name}</button>`
      ).join("")}</div></div>
      <div class="opt"><span class="label">Tela</span><div class="choice-grid" style="margin-top:8px">${Object.entries(HB.fabrics)
        .map(
          ([k, f]) => `<button type="button" class="choice ${s.fabric === k ? "on" : ""}" data-fabric="${k}" style="grid-template-columns:1fr auto">
            <span><strong>${f.name}</strong><small>Confección: ${f.days}</small></span><span class="box">${s.fabric === k ? CHECK : ""}</span></button>`
        )
        .join("")}</div></div>`,
    // 4. Bordado
    () => `<h2>Bordado</h2><p class="muted">El bordado se aplica a cada pieza elegida (${selected().length}). Tarda 3 a 5 días hábiles adicionales.</p>
      <div class="chips">${HB.embroidery
        .map((e) => `<button type="button" class="chip" aria-pressed="${s.style === e.id}" data-style="${e.id}">${e.name}${e.extra ? ` <small>+${HB.usd(e.extra)}/pieza</small>` : ""}</button>`)
        .join("")}</div>
      ${
        s.style === "ninguno"
          ? ""
          : `<div class="fields-2" style="margin-top:16px">
          <div class="field"><label for="btext">Nombre o iniciales</label><input id="btext" maxlength="14" value="${HB.esc(s.text)}" placeholder="Ej.: Amanda" autocomplete="off">
            <span class="hint">Máximo 14 caracteres, solo letras y espacios.</span><span class="err" data-err></span></div>
          <div class="field"><label for="bref">Referencia (opcional)</label><input id="bref" type="file" accept="image/*"><span class="hint">Una foto de un bordado que te guste.</span></div>
        </div>
        <div class="warn">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17v.5"/></svg>'}<span>Las piezas bordadas no tienen cambio, salvo falla de confección.</span></div>`
      }`,
    // 5. Resumen
    () => {
      const f = HB.fabrics[s.fabric];
      return `<h2>Tu ${set().name.toLowerCase()}, listo</h2>
      <div class="grid-2" style="align-items:start">
        ${HB.ph(s.type === "cuna" ? "cuna" : s.type === "clinica" ? "estuche" : "body", "rosa", "vista previa del ajuar", "ph--sq")}
        <div>
          <dl class="kv" style="grid-template-columns:auto 1fr">
            <dt>Piezas</dt><dd>${selected().length} (${selected().reduce((n, p) => n + s.pieces[p.id], 0)} unidades)</dd>
            <dt>Paleta</dt><dd>${HB.colors[s.color].name}</dd>
            <dt>Tela</dt><dd>${f.name}</dd>
            <dt>Bordado</dt><dd>${s.style === "ninguno" ? "Sin bordado" : `${style().name} “${HB.esc(s.text)}”`}</dd>
            <dt>Confección</dt><dd>${f.days}${s.style === "ninguno" ? "" : " + 3 a 5 de bordado"}</dd>
          </dl>
          <p class="note" style="margin-top:16px">El bordado y el envío se confirman al finalizar. Si el total supera <span class="pending">monto por definir</span>, podrás pagarlo en dos partes.</p>
        </div>
      </div>
      <div class="grid-3" style="margin-top:20px">
        <a class="btn btn--rosa" data-out="cotizar" target="_blank" rel="noopener">Solicitar cotización</a>
        <a class="btn" data-out="wa" target="_blank" rel="noopener">Enviar por WhatsApp</a>
        <button type="button" class="btn" data-out="guardar">Guardar y seguir después</button>
      </div>`;
    },
  ];

  function canAdvance() {
    if (s.step === 0 && !s.type) return "Elige qué quieres armar.";
    if (s.step === 1 && !selected().length) return "Elige al menos una pieza.";
    if (s.step === 3 && s.style !== "ninguno" && !NAME_OK.test(s.text.trim())) return "Escribe el nombre o las iniciales (solo letras).";
    return "";
  }

  function message(kind) {
    const lines = selected()
      .map((p) => `• ${s.pieces[p.id]} × ${p.name} — ${HB.usd(p.price * s.pieces[p.id])}`)
      .join("\n");
    return (
      (kind === "cotizar" ? `Hola, quiero cotizar este ${set().name.toLowerCase()}:\n` : `Hola, armé este ${set().name.toLowerCase()}:\n`) +
      `${lines}\n\nPaleta: ${HB.colors[s.color].name}\nTela: ${HB.fabrics[s.fabric].name}\n` +
      `Bordado: ${s.style === "ninguno" ? "sin bordado" : `${style().name} “${s.text.trim()}” (+${HB.usd(embroideryTotal())})`}\n` +
      (s.due ? `Fecha probable de parto: ${s.due.split("-").reverse().join("/")}\n` : "") +
      `\nSubtotal estimado: ${HB.usd(total())} (${HB.bs(total())}). ¿Me confirman?`
    );
  }

  /* ---------- Render ---------- */

  function render(focus) {
    stepper.innerHTML = STEPS.map(
      (t, i) => `<li class="${i < s.step ? "done" : i === s.step ? "now" : ""}" ${i === s.step ? 'aria-current="step"' : ""}><b>${i + 1}</b>${t}</li>`
    ).join("");
    panel.innerHTML =
      `<span class="label label--rosa">Paso ${s.step + 1} de 5</span>` +
      views[s.step]() +
      `<p class="err" data-step-err style="margin-top:12px"></p>
       <div class="nav-steps">
         <button type="button" class="btn" data-back ${s.step === 0 ? "disabled" : ""}>Atrás</button>
         ${s.step < 4 ? `<button type="button" class="btn btn--rosa" data-next>Continuar</button>` : ""}
       </div>`;
    if (s.step === 4) {
      panel.querySelector("[data-out=cotizar]").href = HB.wa(message("cotizar"));
      panel.querySelector("[data-out=wa]").href = HB.wa(message("wa"));
    }
    renderSummary();
    save();
    if (focus) panel.querySelector("h2")?.focus?.();
  }

  function renderSummary() {
    const list = selected();
    const html = `<span class="label">Tu ajuar</span>
      ${HB.ph(s.type === "cuna" ? "cuna" : s.type === "clinica" ? "estuche" : "body", list.length ? "rosa" : "lino", "vista previa", "ph--wide")}
      <ul>${
        list.length
          ? list.map((p) => `<li><span>${s.pieces[p.id]} × ${p.name}</span><span>${HB.usd(p.price * s.pieces[p.id])}</span></li>`).join("") +
            (embroideryTotal() ? `<li><span>Bordado ${style().name.toLowerCase()} × ${list.length}</span><span>${HB.usd(embroideryTotal())}</span></li>` : "")
          : '<li><span class="muted">Aún no has elegido piezas.</span></li>'
      }</ul>
      <div class="total"><span>Subtotal estimado</span><span>${HB.usd(total())}</span></div>
      <p class="small muted">${HB.bs(total())} · el bordado y el envío se confirman al finalizar.</p>`;
    summary.innerHTML = html;
    if (mobileSum) mobileSum.querySelector("[data-msum]").textContent = HB.usd(total());
  }

  /* ---------- Eventos ---------- */

  root.addEventListener("click", (e) => {
    const t = e.target.closest("button, a");
    if (!t) return;
    if (t.dataset.type) {
      pickType(t.dataset.type);
      render();
    }
    if (t.dataset.pq) {
      const id = t.dataset.pq;
      s.pieces[id] = Math.max(1, Math.min(12, (s.pieces[id] || 1) + Number(t.dataset.d)));
      render();
    }
    if (t.dataset.color) {
      s.color = t.dataset.color;
      render();
    }
    if (t.dataset.fabric) {
      s.fabric = t.dataset.fabric;
      render();
    }
    if (t.dataset.style) {
      s.style = t.dataset.style;
      render();
    }
    if (t.matches("[data-next]")) {
      const err = canAdvance();
      if (err) {
        panel.querySelector("[data-step-err]").textContent = err;
        return;
      }
      s.step++;
      render(true);
      root.scrollIntoView({ behavior: "smooth" });
    }
    if (t.matches("[data-back]")) {
      s.step = Math.max(0, s.step - 1);
      render(true);
    }
    if (t.dataset.out === "guardar") {
      save();
      const link = `${location.origin}${location.pathname}#a=${btoa(unescape(encodeURIComponent(JSON.stringify(s))))}`;
      navigator.clipboard?.writeText(link).then(
        () => HB.toast("Guardado. Copiamos un enlace para retomarlo desde cualquier teléfono."),
        () => HB.toast("Guardado en este navegador.")
      );
      if (!navigator.clipboard) HB.toast("Guardado en este navegador.");
    }
  });

  root.addEventListener("change", (e) => {
    if (e.target.dataset.piece) {
      const id = e.target.dataset.piece;
      if (e.target.checked) s.pieces[id] = s.pieces[id] || 1;
      else delete s.pieces[id];
      render();
    }
    if (e.target.id === "due") {
      s.due = e.target.value;
      render();
    }
  });

  root.addEventListener("input", (e) => {
    if (e.target.id === "btext") {
      s.text = e.target.value;
      const err = panel.querySelector("[data-err]");
      err.textContent = s.text && !NAME_OK.test(s.text) ? "Usa solo letras y espacios (sin números ni emojis)." : "";
      save();
    }
  });

  mobileSum?.querySelector("[data-mnext]")?.addEventListener("click", () => {
    if (s.step < 4) panel.querySelector("[data-next]").click();
    else panel.scrollIntoView({ behavior: "smooth" });
  });

  if (!set()) {
    s.type = "";
    s.step = 0;
  }
  render();
})();
