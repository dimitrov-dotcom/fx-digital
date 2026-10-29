(() => {
  "use strict";

  if (window.__FX_BRAND_MOTION__) return;
  window.__FX_BRAND_MOTION__ = true;


  function removeOldCopyrightFooter() {
    const elements = Array.from(
      document.body.querySelectorAll("body *")
    );

    const matches = elements.filter(element => {
      if (element.closest(".fx-brand-footer")) return false;

      const text = (element.innerText || element.textContent || "")
        .replace(/\s+/g, " ")
        .trim();

      return (
        text.includes("© 2026 FX Digital") &&
        text.includes("Layanan online")
      );
    });

    /*
     * Hapus elemen terkecil yang memuat kedua teks footer lama.
     * Footer Developed by Fattah tidak disentuh.
     */
    matches.sort((a, b) => {
      const textA = (a.innerText || a.textContent || "").length;
      const textB = (b.innerText || b.textContent || "").length;
      return textA - textB;
    });

    if (matches.length) {
      matches[0].remove();
    }

    /*
     * Bersihkan sisa deskripsi atau copyright jika terpisah.
     */
    document.querySelectorAll("body *").forEach(element => {
      if (element.closest(".fx-brand-footer")) return;
      if (element.children.length > 0) return;

      const text = (element.innerText || element.textContent || "")
        .replace(/\s+/g, " ")
        .trim();

      if (
        text.includes("© 2026 FX Digital") ||
        text.includes("FX Digital beroperasi secara online.")
      ) {
        element.remove();
      }
    });
  }

  function setupFXBrand() {
    removeOldCopyrightFooter();
    /*
     * Target only elements that look like a logo or brand.
     * Avoid animating every image on the website.
     */
    const selectors = [
      ".site-logo",
      ".navbar-brand",
      ".brand-logo",
      ".logo",
      ".logo img",
      "img[alt*='FX DIGITAL' i]",
      "img[alt*='FX Digital' i]",
      "[class*='logo'] img",
      "header a[href='./index.html']",
      "header a[href='index.html']"
    ];

    const found = new Set();

    document.querySelectorAll(selectors.join(",")).forEach(element => {
      if (element.closest(".fx-brand-footer")) return;
      found.add(element);
    });

    found.forEach(element => {
      element.classList.add("fx-brand-logo-motion");
    });

    /*
     * Remove the old copyright block even if it uses div or section.
     */
    const allElements = Array.from(document.body.querySelectorAll("*"));
    const copyrightBlock = allElements.find(element => {
      const text = (element.innerText || element.textContent || "")
        .replace(/\s+/g, " ")
        .trim();

      return text.includes("© 2026 FX Digital") &&
             text.includes("Layanan online");
    });

    if (copyrightBlock && copyrightBlock !== document.body) {
      copyrightBlock.remove();
    } else {
      /*
       * Fallback: remove the copyright line and its description separately.
       */
      const candidates = Array.from(
        document.body.querySelectorAll("p, div, span, small")
      );

      candidates.forEach(element => {
        if (element.closest(".fx-brand-footer")) return;

        const text = (element.innerText || element.textContent || "")
          .replace(/\s+/g, " ")
          .trim();

        if (
          text.includes("© 2026 FX Digital") &&
          text.length < 180
        ) {
          element.remove();
        } else if (
          text.includes("FX Digital beroperasi secara online.") &&
          text.length < 300
        ) {
          element.remove();
        }
      });
    }

    /*
     * Add one credit footer per page.
     * Keep it inside body and avoid creating duplicates.
     */
    if (!document.querySelector(".fx-brand-footer")) {
      const footer = document.createElement("footer");
      footer.className = "fx-brand-footer";
      footer.innerHTML =
        '<div class="fx-brand-footer-text">' +
          'DEVELOPED BY ' +
          '<span class="fx-brand-footer-name">FATTAH</span>' +
        '</div>';

      document.body.appendChild(footer);
    }
  }


  const fxFooterObserver = new MutationObserver(() => {
    removeOldCopyrightFooter();
  });

  function startFXFooterCleanup() {
    if (document.body) {
      fxFooterObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      removeOldCopyrightFooter();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startFXFooterCleanup, {
      once: true
    });
  } else {
    startFXFooterCleanup();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupFXBrand, { once: true });
  } else {
    setupFXBrand();
  }
})();

/* FX DIGITAL: COSMIC BACKGROUND */
(function () {
  function initFxCosmos() {
    if (!document.body || document.getElementById('fx-cosmos-scene')) return;

    const scene = document.createElement('div');
    scene.id = 'fx-cosmos-scene';
    scene.setAttribute('aria-hidden', 'true');

    // Bintang-bintang kecil
    for (let i = 0; i < 85; i++) {
      const star = document.createElement('i');
      star.className = 'fx-space-star';
      const size = Math.random() * 2 + 1;
      star.style.cssText =
        'left:' + (Math.random() * 100) + '%;' +
        'top:' + (Math.random() * 100) + '%;' +
        'width:' + size + 'px;height:' + size + 'px;' +
        '--twinkle:' + (2 + Math.random() * 4) + 's;' +
        'animation-delay:-' + (Math.random() * 5) + 's;';
      scene.appendChild(star);
    }

    // Bumi berputar di kiri dan planet bercincin di kanan
    [
      { left: '7%', top: '24%', size: 52, earth: true, glow: 'rgba(55,145,255,.55)', speed: '28s' },
      { left: '82%', top: '63%', size: 112, color: '#8547a8', glow: 'rgba(180,75,255,.3)', speed: '34s' }
    ].forEach(function (p, i) {
      const planet = document.createElement('div');
      planet.className = 'fx-space-planet' + (p.earth ? ' fx-earth-planet' : '');
      planet.style.cssText =
        'left:' + p.left + ';top:' + p.top + ';' +
        'width:' + p.size + 'px;height:' + p.size + 'px;' +
        (p.earth
          ? '--planet-glow:' + p.glow + ';--orbit:' + p.speed + ';'
          : 'background:radial-gradient(circle at 30% 28%,' + p.color + ',#111326 72%);' +
            '--planet-glow:' + p.glow + ';--orbit:' + p.speed + ';');

      if (p.earth) {
        ['fx-earth-surface', 'fx-earth-clouds', 'fx-earth-atmosphere'].forEach(function (name) {
          const layer = document.createElement('span');
          layer.className = name;
          planet.appendChild(layer);
        });
      }

      if (p.earth) {
        const orbit = document.createElement('span');
        orbit.className = 'fx-moon-orbit';

        const moon = document.createElement('span');
        moon.className = 'fx-moon';
        orbit.appendChild(moon);
        planet.appendChild(orbit);
      }

      if (i === 1) {
        const ring = document.createElement('span');
        ring.className = 'fx-planet-ring';
        planet.appendChild(ring);
      }
      scene.appendChild(planet);
    });

    // Meteor utama dinonaktifkan; gunakan spawner dengan jeda panjang.


    // UFO terbang dari Saturnus menuju Bumi
    const ufo = document.createElement('div');
    ufo.className = 'fx-space-ufo';
    ufo.setAttribute('aria-hidden', 'true');
    ufo.innerHTML =
      '<span class="fx-ufo-dome"></span>' +
      '<span class="fx-ufo-body"></span>' +
      '<span class="fx-ufo-lights"></span>' +
      '<span class="fx-ufo-beam"></span>';
    scene.appendChild(ufo);

    document.body.prepend(scene);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFxCosmos, { once: true });
  } else {
    initFxCosmos();
  }
})();


/* FX_METEOR_RANDOM_SPAWNER */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function launchMeteor() {
    const scene = document.querySelector("#fx-cosmos-scene");
    if (!scene || !scene.isConnected) return;

    const amount = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < amount; i++) {
      const meteor = document.createElement("span");
      meteor.className = "fx-space-meteor";
      meteor.setAttribute("aria-hidden", "true");

      const angle = 20 + Math.random() * 45;
      const distance = 12 + Math.random() * 20;
      const dx = Math.cos(angle * Math.PI / 180) * distance;
      const dy = Math.sin(angle * Math.PI / 180) * distance;

      meteor.style.setProperty("--dx", dx + "vw");
      meteor.style.setProperty("--dy", dy + "vh");
      meteor.style.left = (5 + Math.random() * 90) + "%";
      meteor.style.top = (5 + Math.random() * 40) + "%";
      meteor.style.animationDuration = (1.4 + Math.random() * 0.8) + "s";

      scene.appendChild(meteor);

      meteor.addEventListener("animationend", function () {
        meteor.remove();
      }, { once: true });
    }
  }

  launchMeteor();
  window.setInterval(launchMeteor, 3000);
})();
