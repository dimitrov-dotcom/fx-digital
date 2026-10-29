document.addEventListener("DOMContentLoaded", () => {
  const config = window.FX_CONFIG;

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".navlinks");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-wa]").forEach(button => {
    const message = button.dataset.message ||
      "Halo FX Digital, saya ingin bertanya tentang layanan.";

    button.href =
      `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;

    button.target = "_blank";
    button.rel = "noopener noreferrer";
  });

  document.querySelectorAll("[data-email]").forEach(link => {
    link.href = `mailto:${config.email}`;
  });

  document.querySelectorAll("[data-service-area]").forEach(element => {
    element.textContent = config.serviceArea;
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  const form = document.querySelector("#contact-form");

  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();

      const data = new FormData(form);
      const message = [
        "Halo FX Digital!",
        `Nama: ${data.get("name")}`,
        `Layanan: ${data.get("service")}`,
        `Detail: ${data.get("detail")}`
      ].join("\n");

      window.open(
        `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener"
      );
    });
  }

  const currentPage = location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll("[data-nav]").forEach(link => {
    if (link.dataset.nav === currentPage) {
      link.classList.add("active");
    }
  });
});

/* ===== MENU SAMPING FX DIGITAL ===== */
(function () {
  function initFXSideMenu() {
    if (document.querySelector(".fx-menu-button")) return;

    const pages = [
      { icon: "🏠", name: "Beranda", url: "index.html" },
      { icon: "🌐", name: "FX Web", url: "fx-web.html" },
      { icon: "📝", name: "FX Docs", url: "fx-docs.html" },
      { icon: "🛠️", name: "FX Tech", url: "fx-tech.html" },
      { icon: "🎮", name: "FX Gaming", url: "fx-gaming.html" },
      { icon: "📞", name: "Kontak", url: "kontak.html" }
    ];

    const button = document.createElement("button");
    button.className = "fx-menu-button";
    button.type = "button";
    button.setAttribute("aria-label", "Buka menu layanan");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "fx-side-menu");
    button.innerHTML = "⋮";

    const overlay = document.createElement("div");
    overlay.className = "fx-menu-overlay";

    const menu = document.createElement("aside");
    menu.className = "fx-side-menu";
    menu.id = "fx-side-menu";
    menu.setAttribute("aria-label", "Menu layanan FX Digital");

    menu.innerHTML = `
      <div class="fx-menu-header">
        <div class="fx-menu-brand">FX DIGITAL</div>
        <button class="fx-menu-close" type="button" aria-label="Tutup menu">×</button>
      </div>
      <div class="fx-menu-label">Semua Layanan</div>
      <nav class="fx-menu-links" aria-label="Navigasi layanan">
        ${pages.map(page => `
          <a href="${page.url}">
            <span class="fx-menu-icon">${page.icon}</span>
            <span>${page.name}</span>
          </a>
        `).join("")}
      </nav>
      <div class="fx-menu-contact">
        <p>Butuh bantuan atau ingin memesan layanan?</p>
        <a href="https://wa.me/6285168764882" target="_blank" rel="noopener noreferrer">
          Mulai Chat Yuk 💬
        </a>
      </div>
    `;

    document.body.append(button, overlay, menu);

    function openMenu() {
      menu.classList.add("open");
      overlay.classList.add("open");
      button.style.display = "none";
      button.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      menu.querySelector(".fx-menu-close").focus();
    }

    function closeMenu() {
      menu.classList.remove("open");
      overlay.classList.remove("open");
      button.style.display = "";
      button.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      button.focus();
    }

    button.addEventListener("click", openMenu);
    menu.querySelector(".fx-menu-close").addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        menu.classList.remove("open");
        overlay.classList.remove("open");
        button.style.display = "";
        button.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        closeMenu();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFXSideMenu);
  } else {
    initFXSideMenu();
  }
})();

/* ===== SEMBUNYIKAN NAVBAR SAAT SCROLL TURUN ===== */
(function () {
  const selectors = [
    "header",
    ".navbar",
    "nav.navbar",
    ".site-header",
    ".main-header"
  ];

  let navbars = [];
  let lastScrollY = window.scrollY;
  let ticking = false;

  function findNavbars() {
    navbars = [...new Set(
      selectors.flatMap(selector =>
        [...document.querySelectorAll(selector)]
      )
    )].filter(el =>
      !el.closest(".fx-side-menu") &&
      !el.classList.contains("fx-menu-button")
    );
  }

  function updateNavbar() {
    const currentY = window.scrollY;
    const difference = currentY - lastScrollY;

    if (currentY < 80) {
      navbars.forEach(nav => nav.classList.remove("fx-navbar-hidden"));
    } else if (difference > 5) {
      navbars.forEach(nav => nav.classList.add("fx-navbar-hidden"));
    } else if (difference < -5) {
      navbars.forEach(nav => nav.classList.remove("fx-navbar-hidden"));
    }

    lastScrollY = currentY;
    ticking = false;
  }

  findNavbars();

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", findNavbars);
})();

/* ===== FX DIGITAL: TOMBOL MENGIKUTI ARAH SCROLL NAVBAR ===== */
(function () {
  function initFXMenuScroll() {
    const button = document.querySelector(".fx-menu-button");
    const menu = document.querySelector(".fx-side-menu");

    if (!button || !menu || button.dataset.scrollEffectReady) return;
    button.dataset.scrollEffectReady = "true";

    let lastY = window.scrollY;

    function updateButton() {
      const y = window.scrollY;
      const difference = y - lastY;

      // Tombol selalu tampil dekat bagian paling atas halaman.
      if (y < 80) {
        button.classList.remove("fx-menu-scroll-hidden");
      } else if (difference > 5) {
        // Scroll ke bawah: sembunyikan tombol.
        button.classList.add("fx-menu-scroll-hidden");
      } else if (difference < -5) {
        // Scroll ke atas: tampilkan kembali.
        button.classList.remove("fx-menu-scroll-hidden");
      }

      lastY = y;
    }

    window.addEventListener("scroll", updateButton, { passive: true });

    // Sembunyikan tombol saat menu samping terbuka.
    const observer = new MutationObserver(() => {
      if (menu.classList.contains("open")) {
        button.classList.add("fx-menu-scroll-hidden");
      } else {
        button.classList.remove("fx-menu-scroll-hidden");
      }
    });

    observer.observe(menu, {
      attributes: true,
      attributeFilter: ["class"]
    });

    // Pastikan status awal sesuai keadaan menu.
    if (menu.classList.contains("open")) {
      button.classList.add("fx-menu-scroll-hidden");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFXMenuScroll);
  } else {
    initFXMenuScroll();
  }
})();
