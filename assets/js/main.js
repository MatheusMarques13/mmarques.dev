/* =====================================================================
   mmarques.dev — modo mynd — interactions
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

  /* -------------------------- Reveal on scroll -------------------------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
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
})();
