(() => {
  "use strict";

  if (window.__FX_FUTURE_INITIALIZED__) return;
  window.__FX_FUTURE_INITIALIZED__ = true;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* Glass effect for existing cards */
  document.querySelectorAll(
    ".card, .contact-card, .service-card, .feature-card, " +
    ".project-card, .fx-enhancement-card, .fx-modern-card"
  ).forEach(element => {
    element.classList.add("fx-future-glass");
  });

  if (reduceMotion) return;


  /* Portal transition for normal internal page links */
  const portal = document.createElement("div");
  portal.id = "fx-future-portal";
  portal.setAttribute("aria-hidden", "true");
  portal.innerHTML = '<div class="fx-portal-ring"></div>';
  document.body.appendChild(portal);

  let navigating = false;

  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");

    if (!link || navigating) return;
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;

    const rawHref = link.getAttribute("href");
    if (!rawHref || rawHref.startsWith("#")) return;
    if (/^(mailto:|tel:|javascript:)/i.test(rawHref)) return;

    let destination;

    try {
      destination = new URL(rawHref, window.location.href);
    } catch (_) {
      return;
    }

    if (!/^https?:$/.test(destination.protocol)) return;
    if (destination.origin !== window.location.origin) return;

    const current = new URL(window.location.href);
    if (destination.href === current.href) return;

    event.preventDefault();
    navigating = true;
    portal.classList.add("fx-portal-active");

    window.setTimeout(() => {
      window.location.href = destination.href;
    }, 300);
  });

  /* FX FUTURE SCROLL UPGRADE */
  if (!document.getElementById("fx-scroll-progress")) {
    const progress = document.createElement("div");
    progress.id = "fx-scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);

    let scrollFrame = 0;

    function updateScrollUI() {
      scrollFrame = 0;

      const root = document.documentElement;
      const maxScroll = root.scrollHeight - window.innerHeight;
      const percent = maxScroll > 0
        ? Math.min(100, Math.max(0, window.scrollY / maxScroll * 100))
        : 0;

      progress.style.width = percent + "%";

      const button = document.getElementById("fx-back-to-top");
      if (button) {
        button.classList.toggle("fx-top-visible", window.scrollY > 350);
      }
    }

    function scheduleScrollUI() {
      if (!scrollFrame) {
        scrollFrame = requestAnimationFrame(updateScrollUI);
      }
    }

    window.addEventListener("scroll", scheduleScrollUI, { passive: true });
    window.addEventListener("resize", scheduleScrollUI, { passive: true });

    const backTop = document.createElement("button");
    backTop.id = "fx-back-to-top";
    backTop.type = "button";
    backTop.textContent = "↑";
    backTop.setAttribute("aria-label", "Kembali ke atas");
    backTop.title = "Kembali ke atas";

    backTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });

    document.body.appendChild(backTop);
    updateScrollUI();
  }

})();
