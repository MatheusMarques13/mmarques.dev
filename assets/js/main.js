/* =====================================================================
   mmarques.dev — "mynd" mode — interactions
   ===================================================================== */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------- Navbar ----------------------------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --------------------------- Mobile menu --------------------------- */
  const burger = $("#burger");
  const menu = $("#mobile-menu");
  const toggleMenu = (open) => {
    const willOpen = open ?? !menu.classList.contains("open");
    menu.classList.toggle("open", willOpen);
    burger.classList.toggle("open", willOpen);
    burger.setAttribute("aria-expanded", String(willOpen));
  };
  burger.addEventListener("click", () => toggleMenu());
  $$("a", menu).forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ------------------------ Language toggle ------------------------ */
  const i18nNodes = $$("[data-en]");
  const setLang = (lang) => {
    lang = lang === "pt" ? "pt" : "en";
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.body.dataset.lang = lang;
    i18nNodes.forEach((el) => {
      const val = el.dataset[lang];
      if (val != null) el.textContent = val;
    });
    $$("[data-lang-btn]").forEach((b) =>
      b.classList.toggle("active", b.dataset.langBtn === lang)
    );
    try { localStorage.setItem("mm-lang", lang); } catch (e) {}
  };
  $$("[data-lang-btn]").forEach((b) =>
    b.addEventListener("click", () => setLang(b.dataset.langBtn))
  );
  let savedLang = "en";
  try { savedLang = localStorage.getItem("mm-lang") || "en"; } catch (e) {}
  if (savedLang === "pt") setLang("pt");

  /* ------------------------- Project filters ------------------------- */
  const works = $$(".work");
  $$("#work-filters .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$("#work-filters .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      works.forEach((w) => {
        const show = f === "all" || (w.dataset.cat || "").split(" ").includes(f);
        w.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* -------------------------- Skill filters -------------------------- */
  const skills = $$(".skill");
  $$("#skill-filters .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$("#skill-filters .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.skillfilter;
      skills.forEach((s) => {
        const show = f === "all" || s.dataset.skillcat === f;
        s.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* --------------------- Reveal + bar animation --------------------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    $$(".reveal").forEach((el) => io.observe(el));

    const barIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const bar = entry.target;
          bar.style.width = (bar.dataset.val || 0) + "%";
          barIo.unobserve(bar);
        });
      },
      { threshold: 0.4 }
    );
    $$(".skill-bar i").forEach((b) => barIo.observe(b));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
    $$(".skill-bar i").forEach((b) => (b.style.width = (b.dataset.val || 0) + "%"));
  }

  /* ----------------------- Active nav on scroll ----------------------- */
  const sections = ["works", "about", "skills", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = $$(".nav-links a");
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ------------------ Connected-nodes background ------------------ */
  const canvas = $("#bg-canvas");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, nodes, raf;
    const COLORS = ["#f3a9c5", "#a6c8f2", "#c6b6ef", "#93d4ab"];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round((w * h) / 26000);
      const count = Math.max(28, Math.min(72, target));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.8,
        c: COLORS[(Math.random() * COLORS.length) | 0],
      }));
    };

    const LINK = 132;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < -20) a.x = w + 20; else if (a.x > w + 20) a.x = -20;
        if (a.y < -20) a.y = h + 20; else if (a.y > h + 20) a.y = -20;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK) {
            ctx.globalAlpha = (1 - dist / LINK) * 0.45;
            ctx.strokeStyle = a.c;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = n.c;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
    });

    resize();
    draw();
  }
})();
