(() => {
  "use strict";

  if (window.__FX_CINEMATIC_INITIALIZED__) return;
  window.__FX_CINEMATIC_INITIALIZED__ = true;

  const path = window.location.pathname.replace(/\/+$/, "");
  const isHome = path === "" || path === "/index.html";

  if (!isHome) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  try {
    if (window.sessionStorage.getItem("fxIntroSeen") === "1") return;
  } catch (_) {}

  const intro = document.createElement("div");
  intro.id = "fx-cinematic-intro";
  intro.setAttribute("role", "status");
  intro.setAttribute("aria-label", "FX Digital");

  intro.innerHTML = `
    <div class="fx-intro-content">
      <div class="fx-intro-mark" aria-hidden="true">FX</div>
      <h1 class="fx-intro-title">FX DIGITAL</h1>
      <p class="fx-intro-subtitle">Technology · Creativity · Future</p>
      <div class="fx-intro-line" aria-hidden="true"></div>
      <button type="button" id="fx-intro-skip"
        style="margin-top:28px;padding:10px 18px;border:1px solid rgba(103,232,249,.45);border-radius:999px;background:rgba(15,23,42,.8);color:#e2e8f0;cursor:pointer">
        Lewati intro
      </button>
    </div>
  `;

  document.body.appendChild(intro);

  let finished = false;

  function finishIntro() {
    if (finished) return;
    finished = true;

    try { window.sessionStorage.setItem("fxIntroSeen", "1"); } catch (_) {}

    intro.classList.add("fx-intro-out");
    window.setTimeout(() => intro.remove(), 900);
  }

  document.getElementById("fx-intro-skip").addEventListener("click", finishIntro);
  window.setTimeout(finishIntro, 2200);
})();
