// Galería — se alimenta de /api/instagram (últimas publicaciones de @hilitosbebe)

(function () {
  const track = document.querySelector(".line-track");
  const scroller = document.querySelector(".line-scroller");
  const wall = document.querySelector(".wall");
  const chipsBox = document.querySelector(".chips");
  const viewer = document.querySelector(".viewer");
  const IG_URL = "https://www.instagram.com/hilitosbebe/";

  const TAPES = ["rgba(169,217,210,.8)", "rgba(243,220,213,.9)", "rgba(194,164,107,.45)", "rgba(220,239,235,.95)"];
  const CATEGORIES = [
    { id: "cuna", label: "Para la cuna", re: /cuna|s[áa]bana|protector|chich[oó]n|cobij|edred[oó]n|almohad|lencer/i },
    { id: "ropa", label: "Moda infantil", re: /vestid|conjunt|ropa|body|jesusit|braga|batica|enterizo|camis|short|falda|moda/i },
    { id: "personal", label: "Personalizados", re: /bordad|nombre|personaliz|inicial|monogram/i },
    { id: "deco", label: "Decoración", re: /medall[oó]n|decora|coj[ií]n|cuadro|habitaci[oó]n|cuarto|guirnald/i },
    { id: "fiesta", label: "Fiesta", re: /fiesta|party|glam|cumple|bautizo|celebra/i },
  ];

  let posts = [];
  let current = 0;

  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" }) : "";

  // Primera línea del texto, sin hashtags ni menciones
  const title = (caption) => {
    const line = (caption || "").split("\n").find((l) => l.replace(/[#@]\S+/g, "").trim()) || "";
    const clean = line.replace(/[#@]\S+/g, "").trim();
    return clean.length > 42 ? clean.slice(0, 40).trim() + "…" : clean || "Hecho a mano";
  };

  const rand = (min, max) => Math.random() * (max - min) + min;

  const el = (tag, attrs = {}, children = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "style") Object.assign(n.style, v);
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    }
    children.forEach((c) => c && n.appendChild(c));
    return n;
  };

  const PLAY_SVG =
    '<svg viewBox="0 0 10 12" aria-hidden="true"><path d="M0 0l10 6-10 6z" fill="currentColor"/></svg>';

  function polaroid(p, i) {
    const img = el("img", { src: p.image, alt: title(p.caption), loading: i < 4 ? "eager" : "lazy" });
    const box = el("div", { class: "polaroid__img" }, [img]);
    if (p.type === "VIDEO") {
      const play = el("span", { class: "play" });
      play.innerHTML = PLAY_SVG;
      box.appendChild(play);
    }
    return el("div", { class: "polaroid" }, [
      box,
      el("div", { class: "polaroid__cap", text: title(p.caption) }),
      el("div", { class: "polaroid__date", text: fmtDate(p.timestamp) }),
    ]);
  }

  /* ---------- Tendedero ---------- */

  function hangItems(nodes) {
    track.querySelectorAll(".hang").forEach((n) => n.remove());
    nodes.forEach((node, i) => {
      node.style.setProperty("--sway", rand(4, 7).toFixed(2) + "s");
      node.style.setProperty("--delay", (-rand(0, 5)).toFixed(2) + "s");
      node.style.setProperty("--tilt", rand(1.2, 2.8).toFixed(2) + "deg");
      track.appendChild(node);
    });
    requestAnimationFrame(drawRope);
  }

  // Cuerda con varias curvas suaves; cada prenda cuelga justo sobre ella
  function drawRope() {
    const width = track.scrollWidth;
    const span = 520;
    const sag = 34;
    const top = 30;
    const yAt = (x) => {
      const t = (x % span) / span;
      return top + sag * 4 * t * (1 - t);
    };
    let d = `M0 ${top}`;
    for (let x = 0; x < width; x += span) {
      d += ` Q${x + span / 2} ${top + sag * 2} ${x + span} ${top}`;
    }
    const svg = track.querySelector(".line-rope");
    svg.setAttribute("viewBox", `0 0 ${width} 120`);
    svg.style.width = width + "px";
    svg.querySelector("path").setAttribute("d", d);
    track.querySelectorAll(".hang").forEach((h) => {
      const cx = h.offsetLeft + h.offsetWidth / 2;
      h.style.setProperty("--drop", Math.round(yAt(cx) + 6) + "px");
    });
  }

  function renderLine(list) {
    const nodes = list.slice(0, 10).map((p, i) => {
      const b = el("button", { class: "hang", type: "button", "aria-label": "Ver: " + title(p.caption) }, [
        el("span", { class: "pin", "aria-hidden": "true" }),
        polaroid(p, i),
      ]);
      b.addEventListener("click", () => open(posts.indexOf(p)));
      return b;
    });
    hangItems(nodes);
  }

  // Sin feed todavía: prendas ilustradas en el tendedero
  function renderIllustratedLine() {
    const tpl = document.getElementById("garments");
    const nodes = [...tpl.content.children].map((g) => {
      const wrap = el("a", { class: "hang", href: IG_URL, target: "_blank", rel: "noopener" }, [
        el("span", { class: "pin", "aria-hidden": "true" }),
      ]);
      wrap.appendChild(g.cloneNode(true));
      return wrap;
    });
    hangItems(nodes);
  }

  // Arrastrar el tendedero con el ratón
  let drag = null;
  scroller.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    drag = { x: e.clientX, left: scroller.scrollLeft, moved: false };
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) {
      drag.moved = true;
      scroller.classList.add("dragging");
    }
    scroller.scrollLeft = drag.left - dx;
  });
  window.addEventListener("pointerup", () => {
    setTimeout(() => (drag = null), 0);
    scroller.classList.remove("dragging");
  });
  scroller.addEventListener(
    "click",
    (e) => {
      if (drag && drag.moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  /* ---------- Muro ---------- */

  function renderWall(list) {
    wall.innerHTML = "";
    list.forEach((p, i) => {
      const tile = el("button", { class: "tile", type: "button", "data-cats": cats(p).join(" ") }, [
        el("span", { class: "tape", "aria-hidden": "true" }),
        polaroid(p, i),
      ]);
      tile.style.setProperty("--rot", rand(-3.5, 3.5).toFixed(2) + "deg");
      tile.style.setProperty("--tape-rot", rand(-6, 6).toFixed(1) + "deg");
      tile.style.setProperty("--tape", TAPES[i % TAPES.length]);
      tile.addEventListener("click", () => open(posts.indexOf(p)));
      wall.appendChild(tile);
    });
  }

  const cats = (p) => CATEGORIES.filter((c) => c.re.test(p.caption || "")).map((c) => c.id);

  function renderChips() {
    const present = CATEGORIES.filter((c) => posts.some((p) => c.re.test(p.caption || "")));
    if (!present.length) return;
    const all = [{ id: "all", label: "Todo" }, ...present];
    chipsBox.innerHTML = "";
    all.forEach((c, i) => {
      const chip = el("button", { class: "chip", type: "button", "aria-pressed": String(i === 0), text: c.label });
      chip.addEventListener("click", () => {
        chipsBox.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", "false"));
        chip.setAttribute("aria-pressed", "true");
        wall.querySelectorAll(".tile").forEach((t) => {
          const show = c.id === "all" || t.dataset.cats.split(" ").includes(c.id);
          t.classList.toggle("is-hidden", !show);
        });
      });
      chipsBox.appendChild(chip);
    });
  }

  document.querySelector(".shuffle")?.addEventListener("click", () => {
    if (!posts.length) return;
    wall.classList.add("shuffling");
    setTimeout(() => {
      const tiles = [...wall.children];
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
      tiles.forEach((t) => {
        t.style.setProperty("--rot", rand(-3.5, 3.5).toFixed(2) + "deg");
        wall.appendChild(t);
      });
      wall.classList.remove("shuffling");
    }, 380);
  });

  /* ---------- Visor ---------- */

  function open(i) {
    if (!viewer || i < 0) return;
    current = (i + posts.length) % posts.length;
    const p = posts[current];
    viewer.querySelector(".viewer__img img").src = p.image;
    viewer.querySelector(".viewer__img img").alt = title(p.caption);
    viewer.querySelector(".viewer__date").textContent = fmtDate(p.timestamp);
    viewer.querySelector(".viewer__title").textContent = title(p.caption);
    viewer.querySelector(".viewer__caption").textContent = p.caption || "";
    viewer.querySelector(".viewer__link").href = p.permalink || IG_URL;
    if (!viewer.open) viewer.showModal();
  }
  viewer?.querySelector(".viewer__close").addEventListener("click", () => viewer.close());
  viewer?.querySelector(".viewer__nav--prev").addEventListener("click", () => open(current - 1));
  viewer?.querySelector(".viewer__nav--next").addEventListener("click", () => open(current + 1));
  viewer?.addEventListener("click", (e) => {
    if (e.target === viewer) viewer.close();
  });
  document.addEventListener("keydown", (e) => {
    if (!viewer?.open) return;
    if (e.key === "ArrowLeft") open(current - 1);
    if (e.key === "ArrowRight") open(current + 1);
  });

  /* ---------- Carga ---------- */

  function showEmpty() {
    renderIllustratedLine();
    wall.innerHTML = "";
    document.querySelector(".wall-tools")?.remove();
    document.querySelector(".wall-empty").hidden = false;
  }

  fetch("/api/instagram")
    .then((r) => (r.ok ? r.json() : { posts: [] }))
    .then((data) => {
      posts = (data.posts || []).filter((p) => p.image);
      if (!posts.length) return showEmpty();
      renderLine(posts);
      renderWall(posts);
      renderChips();
    })
    .catch(showEmpty);

  window.addEventListener("resize", () => requestAnimationFrame(drawRope));
})();
