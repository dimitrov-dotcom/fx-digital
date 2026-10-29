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


/* ===== FX COSMIC BLACK HOLE CONTROLLER ===== */
(function () {
  function initCosmicBlackHole() {
    const scene = document.getElementById("fx-cosmos-scene");
    if (!scene || scene.querySelector(".fx-blackhole")) return;

    const hole = document.createElement("button");
    hole.type = "button";
    hole.className = "fx-blackhole";
    hole.setAttribute("aria-label", "Arahkan kursor untuk menyedot Bumi dan Saturnus");
    hole.innerHTML =
      '<span class="fx-bh-ring"></span>' +
      '<span class="fx-bh-ring-inner"></span>' +
      '<span class="fx-bh-core"></span>';

    scene.appendChild(hole);

    let showTimer = null;
    let hideTimer = null;
    let nextTimer = null;
    let active = false;
    let absorbing = false;

    function restorePlanets(planets) {
      planets.forEach(function (planet) {
        planet.classList.remove("fx-bh-absorbing");
        planet.style.removeProperty("--fx-bh-dx");
        planet.style.removeProperty("--fx-bh-dy");
      });
    }

    function hideHole() {
      active = false;
      hole.classList.remove("fx-bh-visible");
      hole.disabled = true;
      scene.classList.remove("fx-bh-light-drain");
    }

    function scheduleNext() {
      clearTimeout(nextTimer);
      nextTimer = setTimeout(showHole, 30000);
    }

    function showHole() {
      if (!scene.isConnected) return;

      const planets = Array.from(
        scene.querySelectorAll(".fx-space-planet")
      );

      if (planets.length < 2) {
        scheduleNext();
        return;
      }

      // Posisi acak di area background, tidak menempel di tepi layar.
      const maxX = Math.max(0, scene.clientWidth - 100);
      const maxY = Math.max(0, scene.clientHeight - 100);
      hole.style.left = Math.round(10 + Math.random() * Math.max(0, maxX - 20)) + "px";
      hole.style.top = Math.round(10 + Math.random() * Math.max(0, maxY - 20)) + "px";
      scene.style.setProperty(
        "--fx-bh-x",
        (parseFloat(hole.style.left) + hole.offsetWidth / 2) + "px"
      );
      scene.style.setProperty(
        "--fx-bh-y",
        (parseFloat(hole.style.top) + hole.offsetHeight / 2) + "px"
      );
      scene.classList.add("fx-bh-light-drain");

      absorbing = false;
      active = true;
      hole.disabled = false;
      hole.classList.remove("fx-bh-visible");
      void hole.offsetWidth;
      hole.classList.add("fx-bh-visible");

      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        hideHole();
        scheduleNext();
      }, 9000);
    }

    hole.addEventListener("mouseenter", function () {
      if (!active || absorbing) return;

      const planets = Array.from(
        scene.querySelectorAll(".fx-space-planet")
      );

      if (planets.length < 2) return;

      absorbing = true;
      hole.disabled = true;
      scene.classList.remove("fx-bh-ufo-return");
      scene.classList.add("fx-bh-ufo-panic");

      const holeRect = hole.getBoundingClientRect();
      const targetX = holeRect.left + holeRect.width / 2;
      const targetY = holeRect.top + holeRect.height / 2;

      planets.forEach(function (planet) {
        const rect = planet.getBoundingClientRect();
        const planetX = rect.left + rect.width / 2;
        const planetY = rect.top + rect.height / 2;

        planet.style.setProperty("--fx-bh-dx", (targetX - planetX) + "px");
        planet.style.setProperty("--fx-bh-dy", (targetY - planetY) + "px");
      });

      requestAnimationFrame(function () {
        planets.forEach(function (planet) {
          planet.classList.add("fx-bh-absorbing");
        });
      });

      // Setelah 7 detik tersedot, tukar posisi Bumi dan Saturnus.
      clearTimeout(showTimer);
      showTimer = setTimeout(function () {
        if (planets.length >= 2) {
          const earth = planets.find(function (planet) {
            return planet.classList.contains("fx-earth-planet");
          });
          const saturn = planets.find(function (planet) {
            return !planet.classList.contains("fx-earth-planet");
          });

          if (earth && saturn) {
            const earthLeft = earth.style.left;
            const earthTop = earth.style.top;
            const saturnLeft = saturn.style.left;
            const saturnTop = saturn.style.top;

            earth.style.left = saturnLeft;
            earth.style.top = saturnTop;
            saturn.style.left = earthLeft;
            saturn.style.top = earthTop;
          }
        }

        // Kedua planet tetap menghilang selama 7 detik.
        showTimer = setTimeout(function () {
          restorePlanets(planets);
          scene.classList.remove("fx-bh-ufo-panic");
          scene.classList.add("fx-bh-ufo-return");

          // Hitung posisi Bumi yang sebenarnya setelah planet muncul.
          const ufo = scene.querySelector(".fx-space-ufo");
          const earth = scene.querySelector(".fx-earth-planet");

          if (ufo && earth) {
            // Hentikan animasi lama yang bisa membuat UFO transparan
            // atau mengarahkan UFO ke posisi yang salah.
            ufo.style.setProperty("animation", "none", "important");
            ufo.style.display = "block";
            ufo.style.opacity = "1";
            ufo.style.visibility = "visible";

            const saturn = Array.from(
              scene.querySelectorAll(".fx-space-planet")
            ).find(function (planet) {
              return !planet.classList.contains("fx-earth-planet");
            });

            if (!saturn) {
              scene.classList.remove("fx-bh-ufo-return");
              return;
            }

            // Hitung ulang lintasan dari Saturnus dan Bumi setelah bertukar.
            const sceneRect = scene.getBoundingClientRect();
            const ufoRect = ufo.getBoundingClientRect();
            const saturnRect = saturn.getBoundingClientRect();
            const earthRect = earth.getBoundingClientRect();

            const startX = saturnRect.left - sceneRect.left +
                           saturnRect.width / 2 - ufoRect.width / 2;
            const startY = saturnRect.top - sceneRect.top +
                           saturnRect.height / 2 - ufoRect.height / 2;
            const endX = earthRect.left - sceneRect.left +
                         earthRect.width / 2 - ufoRect.width / 2;
            const endY = earthRect.top - sceneRect.top +
                         earthRect.height / 2 - ufoRect.height / 2;

            ufo.style.left = startX + "px";
            ufo.style.top = startY + "px";
            ufo.style.transform = "rotate(0deg) scale(1)";

            const startTime = performance.now();
            const duration = 5000;

            function flyToEarth(now) {
              const progress = Math.min(1, (now - startTime) / duration);
              const eased = progress * progress * (3 - 2 * progress);
              const curve = Math.sin(progress * Math.PI) * 65;

              ufo.style.left =
                (startX + (endX - startX) * eased) + "px";
              ufo.style.top =
                (startY + (endY - startY) * eased - curve) + "px";
              ufo.style.opacity = "1";
              ufo.style.visibility = "visible";
              ufo.style.transform =
                "rotate(" + (Math.sin(progress * Math.PI * 2) * 12) +
                "deg) scale(" + (1 - progress * 0.45) + ")";

              if (progress < 1) {
                requestAnimationFrame(flyToEarth);
              } else {
                scene.classList.remove("fx-bh-ufo-return");

                // UFO tiba di Bumi dan bersiap mengulangi lintasan.
                ufo.style.left = endX + "px";
                ufo.style.top = endY + "px";
                ufo.style.transform = "scale(.55)";
                ufo.style.opacity = "1";
                ufo.style.visibility = "visible";
                ufo.style.display = "block";

                function repeatSaturnToEarth() {
                  if (!scene.isConnected || !ufo.isConnected) return;

                  // Tunda penerbangan normal selama Black Hole aktif.
                  if (scene.classList.contains("fx-bh-ufo-panic")) {
                    setTimeout(repeatSaturnToEarth, 1000);
                    return;
                  }

                  const currentEarth = scene.querySelector(".fx-earth-planet");
                  const currentSaturn = Array.from(
                    scene.querySelectorAll(".fx-space-planet")
                  ).find(function (planet) {
                    return !planet.classList.contains("fx-earth-planet");
                  });

                  if (!currentEarth || !currentSaturn) {
                    setTimeout(repeatSaturnToEarth, 1000);
                    return;
                  }

                  const rectScene = scene.getBoundingClientRect();
                  const rectSaturn = currentSaturn.getBoundingClientRect();
                  const rectEarth = currentEarth.getBoundingClientRect();

                  const sx = rectSaturn.left - rectScene.left +
                             rectSaturn.width / 2 - ufo.offsetWidth / 2;
                  const sy = rectSaturn.top - rectScene.top +
                             rectSaturn.height / 2 - ufo.offsetHeight / 2;
                  const ex = rectEarth.left - rectScene.left +
                             rectEarth.width / 2 - ufo.offsetWidth / 2;
                  const ey = rectEarth.top - rectScene.top +
                             rectEarth.height / 2 - ufo.offsetHeight / 2;

                  ufo.style.setProperty("animation", "none", "important");
                  ufo.style.left = sx + "px";
                  ufo.style.top = sy + "px";
                  ufo.style.opacity = "1";
                  ufo.style.visibility = "visible";
                  ufo.style.display = "block";

                  const tripStart = performance.now();
                  const tripDuration = 5000;

                  function travel(now) {
                    if (!scene.isConnected || !ufo.isConnected) return;

                    if (scene.classList.contains("fx-bh-ufo-panic")) {
                      setTimeout(repeatSaturnToEarth, 1000);
                      return;
                    }

                    const t = Math.min(1, (now - tripStart) / tripDuration);
                    const easedT = t * t * (3 - 2 * t);
                    const arc = Math.sin(t * Math.PI) * 65;

                    ufo.style.left = (sx + (ex - sx) * easedT) + "px";
                    ufo.style.top = (sy + (ey - sy) * easedT - arc) + "px";
                    ufo.style.opacity = "1";
                    ufo.style.visibility = "visible";
                    ufo.style.transform =
                      "rotate(" + (Math.sin(t * Math.PI * 2) * 12) +
                      "deg) scale(" + (0.8 - t * 0.25) + ")";

                    if (t < 1) {
                      requestAnimationFrame(travel);
                    } else {
                      ufo.style.left = ex + "px";
                      ufo.style.top = ey + "px";
                      ufo.style.transform = "scale(.55)";
                      setTimeout(repeatSaturnToEarth, 1800);
                    }
                  }

                  requestAnimationFrame(travel);
                }

                setTimeout(repeatSaturnToEarth, 1800);
              }
            }

            requestAnimationFrame(flyToEarth);
          } else {
            scene.classList.remove("fx-bh-ufo-return");
          }

          hideHole();
          scheduleNext();
        }, 7000);
      }, 7000);
    });

    // Kemunculan pertama dipercepat untuk pengujian.
    nextTimer = setTimeout(showHole, 50000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCosmicBlackHole, { once: true });
  } else {
    initCosmicBlackHole();
  }
})();
