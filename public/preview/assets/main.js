// Hilitos Bebé — comportamiento común a todas las páginas

(function () {
  // Menú móvil
  const btn = document.querySelector(".menu-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".nav a").forEach((a) =>
      a.addEventListener("click", () => document.body.classList.remove("menu-open"))
    );
  }

  // Aparición suave al hacer scroll
  let pending = [...document.querySelectorAll(".reveal")];
  let ticking = false;
  const reveal = () => {
    ticking = false;
    const limit = window.innerHeight - 40;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top > limit) return true;
      el.classList.add("is-in");
      return false;
    });
    if (!pending.length) window.removeEventListener("scroll", onScroll);
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(reveal);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  reveal();

  // Año en el pie de página
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Tira de Instagram en la portada
  const strip = document.querySelector("[data-ig-strip]");
  if (strip) {
    fetch("/api/instagram")
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then(({ posts = [] }) => {
        const list = posts.filter((p) => p.image).slice(0, 6);
        if (!list.length) return;
        strip.innerHTML = "";
        list.forEach((p) => {
          const a = document.createElement("a");
          a.href = p.permalink;
          a.target = "_blank";
          a.rel = "noopener";
          const img = document.createElement("img");
          img.src = p.image;
          img.alt = (p.caption || "Publicación de Hilitos Bebé").slice(0, 120);
          img.loading = "lazy";
          a.appendChild(img);
          strip.appendChild(a);
        });
      })
      .catch(() => {});
  }
})();
