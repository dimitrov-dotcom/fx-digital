(function () {
  "use strict";

  const WA_NUMBER = "6285168764882";
  const EMAIL = "fxdigital99@gmail.com";

  const services = [
    {
      icon: "🌐",
      name: "FX Web",
      desc: "Website bisnis, landing page promosi, profil usaha, portofolio, dan bantuan publikasi website.",
      page: "fx-web.html"
    },
    {
      icon: "📝",
      name: "FX Docs",
      desc: "Pengetikan, perapian dokumen, Word, PDF, presentasi, laporan, proposal, serta bimbingan tugas.",
      page: "fx-docs.html"
    },
    {
      icon: "🛠️",
      name: "FX Tech",
      desc: "Bantuan software, konfigurasi Linux dan Windows, troubleshooting aplikasi, serta panduan komputer.",
      page: "fx-tech.html"
    },
    {
      icon: "🎮",
      name: "FX Gaming",
      desc: "Bantuan konfigurasi game, pengaturan kontroler, kompatibilitas, dan troubleshooting konsol.",
      page: "fx-gaming.html"
    }
  ];

  function makeWhatsAppMessage(service, detail, deadline) {
    return [
      "Halo FX Digital, saya ingin bertanya tentang layanan.",
      "",
      "Layanan: " + service,
      "Kebutuhan: " + detail,
      "Target waktu: " + (deadline || "Belum ditentukan"),
      "",
      "Mohon informasi harga dan proses pengerjaannya."
    ].join("\n");
  }

  function addSection(id, title, intro, cards) {
    if (document.getElementById(id)) return;

    const section = document.createElement("section");
    section.id = id;
    section.className = "fx-enhancement-section";

    section.innerHTML = `
      <h2>${title}</h2>
      <p class="fx-enhancement-intro">${intro}</p>
      <div class="fx-enhancement-grid">
        ${cards.map(card => `
          <article class="fx-enhancement-card fx-reveal">
            <div class="fx-enhancement-icon" aria-hidden="true">${card.icon}</div>
            <h3>${card.title}</h3>
            <p>${card.description}</p>
            ${card.link ? `<a class="fx-order-button" href="${card.link}">${card.linkText || "Kenali Layanan Ini ✨"}</a>` : ""}
          </article>
        `).join("")}
      </div>
    `;

    const footer = document.querySelector("footer");
    if (footer) {
      footer.parentNode.insertBefore(section, footer);
    } else {
      document.body.appendChild(section);
    }
  }


  function addFAQ() {
    if (document.getElementById("fx-faq")) return;

    const section = document.createElement("section");
    section.id = "fx-faq";
    section.className = "fx-enhancement-section";

    const questions = [
      ["Gimana cara mulai pesan?", "Pilih layanan yang kamu butuhkan, klik tombol WhatsApp, lalu ceritakan kebutuhan dan target waktumu. Tim kami akan membantu membahas langkah selanjutnya."],
      ["Berapa biaya layanannya?", "Biaya menyesuaikan jenis dan tingkat kesulitan pekerjaan. Ceritakan kebutuhanmu untuk mendapatkan penawaran sebelum pengerjaan dimulai."],
      ["Bisa dilayani secara online?", "Bisa! Kamu dapat mendiskusikan kebutuhan dan mengirim berkas secara online melalui saluran komunikasi yang disepakati."],
      ["Bagaimana alur pengerjaannya?", "Kita mulai dengan membahas kebutuhan, menyepakati ruang lingkup dan biaya, lalu kamu mengirim materi yang diperlukan. Pengerjaan berjalan sesuai kesepakatan."],
      ["Bisa revisi hasilnya?", "Bisa dibicarakan sebelum mulai, termasuk jumlah revisi dan jenis perubahan yang tercakup dalam biaya."],
      ["Apakah tugas sekolah bisa dipesan?", "Kami dapat membantu penjelasan materi, bimbingan, contoh, pengetikan, dan koreksi dengan tetap mengikuti aturan akademik yang berlaku."]
    ];

    section.innerHTML = `
      <h2>Penasaran? Cek Jawabannya! 💡</h2>
      <p class="fx-enhancement-intro">Informasi singkat sebelum kamu memesan layanan FX Digital.</p>
      ${questions.map(q => `
        <details class="fx-faq-item fx-reveal">
          <summary>${q[0]}</summary>
          <div class="fx-faq-answer">${q[1]}</div>
        </details>
      `).join("")}
    `;

    const footer = document.querySelector("footer");
    if (footer) footer.parentNode.insertBefore(section, footer);
    else document.body.appendChild(section);
  }

  function addOrderDialog() {
    if (document.getElementById("fx-order-dialog")) return;

    const dialog = document.createElement("dialog");
    dialog.id = "fx-order-dialog";
    dialog.className = "fx-order-dialog";

    dialog.innerHTML = `
      <h2>Pesan Layanan</h2>
      <p>Ceritakan kebutuhanmu di bawah ini. Pesan akan disiapkan di WhatsApp agar bisa kamu periksa sebelum dikirim.</p>
      <form class="fx-order-form" id="fx-order-form">
        <label>Nama
          <input name="nama" autocomplete="name" maxlength="80" placeholder="Nama kamu" required>
        </label>
        <label>Pilih layanan
          <select name="layanan" required>
            <option value="">Pilih layanan</option>
            <option>FX Web</option>
            <option>FX Docs</option>
            <option>FX Tech</option>
            <option>FX Gaming</option>
            <option>Layanan lainnya</option>
          </select>
        </label>
        <label>Detail kebutuhan
          <textarea name="detail" rows="4" maxlength="1500" placeholder="Jelaskan kebutuhanmu..." required></textarea>
        </label>
        <label>Target waktu (opsional)
          <input name="deadline" maxlength="100" placeholder="Contoh: minggu depan">
        </label>
        <div class="fx-order-actions">
          <button class="fx-order-button" type="submit">Lanjut Chat WhatsApp ↗</button>
          <button class="fx-order-close" type="button" data-fx-close>Tutup</button>
        </div>
      </form>
    `;

    document.body.appendChild(dialog);

    dialog.querySelector("[data-fx-close]").addEventListener("click", () => dialog.close());

    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });

    dialog.querySelector("form").addEventListener("submit", event => {
      event.preventDefault();

      const form = new FormData(event.currentTarget);
      const name = String(form.get("nama") || "").trim();
      const service = String(form.get("layanan") || "").trim();
      const detail = String(form.get("detail") || "").trim();
      const deadline = String(form.get("deadline") || "").trim();

      if (!name || !service || !detail) return;

      const message = [
        "Halo FX Digital, saya ingin memesan layanan.",
        "",
        "Nama: " + name,
        "Layanan: " + service,
        "Detail: " + detail,
        "Target waktu: " + (deadline || "Belum ditentukan"),
        "",
        "Mohon informasi harga dan proses selanjutnya."
      ].join("\n");

      window.open(
        "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(message),
        "_blank",
        "noopener,noreferrer"
      );
      dialog.close();
    });
  }

  function addFloatingWhatsApp() {
    if (document.querySelector(".fx-wa-floating")) return;

    const link = document.createElement("a");
    link.className = "fx-wa-floating";
    link.href = "https://wa.me/" + WA_NUMBER + "?text=" +
      encodeURIComponent("Halo FX Digital, saya ingin bertanya tentang layanan.");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Chat FX Digital via WhatsApp");
    link.innerHTML = "<svg viewBox='0 0 24 24' width='30' height='30' aria-hidden='true' fill='currentColor'><path d='M20.52 3.48A11.86 11.86 0 0 0 12.05 0C5.47 0 .12 5.35.12 11.93c0 2.1.55 4.16 1.6 5.98L0 24l6.24-1.64a11.9 11.9 0 0 0 5.8 1.48h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.18-3.46-8.43ZM12.05 21.8a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-3.7.97.99-3.61-.23-.37a9.86 9.86 0 0 1-1.52-5.26c0-5.46 4.45-9.91 9.92-9.91a9.84 9.84 0 0 1 7.01 2.91 9.85 9.85 0 0 1 2.9 7.02c0 5.46-4.45 9.91-9.91 9.91Z'/></svg>";
link.setAttribute("aria-label", "Chat melalui WhatsApp");
link.setAttribute("title", "Chat melalui WhatsApp");

    document.body.appendChild(link);
  }

  function addOrderButtons() {
    document.querySelectorAll(
      ".fx-order-trigger, [data-fx-order]"
    ).forEach(button => {
      if (button.dataset.fxBound) return;
      button.dataset.fxBound = "true";
      button.addEventListener("click", event => {
        event.preventDefault();
        const dialog = document.getElementById("fx-order-dialog");
        if (dialog && typeof dialog.showModal === "function") dialog.showModal();
        else if (dialog) dialog.setAttribute("open", "");
      });
    });

    const contactButtons = document.querySelectorAll(
      "a[href*='wa.me'], a[href*='api.whatsapp.com']"
    );

    contactButtons.forEach(link => {
      if (!link.getAttribute("aria-label")) {
        link.setAttribute("aria-label", "Hubungi melalui WhatsApp");
      }
    });
  }

  function addScrollReveal() {
    const items = document.querySelectorAll(
      ".card, .service-card, .feature-card, .fx-enhancement-card, .fx-faq-item"
    );

    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(item => item.classList.add("fx-visible"));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fx-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(item => {
      item.classList.add("fx-reveal");
      observer.observe(item);
    });
  }

  function addSEO() {
    const file = location.pathname.split("/").pop() || "index.html";
    const seo = {
      "index.html": ["FX Digital | Solusi Digital Praktis dan Kreatif", "Butuh solusi website, dokumen, teknologi, atau gaming? Temukan layanan yang cocok bersama FX Digital."],
      "fx-web.html": ["FX Web | Jasa Website", "Informasi layanan website bisnis, landing page, dan profil usaha dari FX Digital."],
      "fx-docs.html": ["FX Docs | Jasa Dokumen", "Bantuan pengetikan, perapian dokumen, presentasi, dan bimbingan tugas dari FX Digital."],
      "fx-tech.html": ["FX Tech | Bantuan Teknologi", "Bantuan software, konfigurasi komputer, Linux, Windows, dan troubleshooting dari FX Digital."],
      "fx-gaming.html": ["FX Gaming | Bantuan Gaming", "Bantuan konfigurasi game, kontroler, dan troubleshooting perangkat gaming."],
      "kontak.html": ["Kontak FX Digital | Yuk, Ngobrol Bareng Kami", "Punya kebutuhan digital? Chat FX Digital via WhatsApp atau email dan diskusikan solusi yang sesuai."]
    };

    const data = seo[file] || seo["index.html"];
    if (!document.querySelector('meta[name="description"]')) {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = data[1];
      document.head.appendChild(meta);
    }

    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = "#0b1120";
      document.head.appendChild(meta);
    }

    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1";
      document.head.appendChild(meta);
    }

    if (!document.title || document.title.trim() === "") {
      document.title = data[0];
    }
  }

  function addFooterNote() {
    const footer = document.querySelector("footer");
    if (!footer || footer.querySelector(".fx-footer-note")) return;

    const note = document.createElement("p");
    note.className = "fx-footer-note";
    note.textContent = "FX Digital beroperasi secara online. Harga, ruang lingkup pekerjaan, dan waktu pengerjaan dikonfirmasi sebelum pesanan dimulai.";

    footer.appendChild(note);
  }

  function init() {
    addSEO();
    addFAQ();
    addOrderDialog();
    addFloatingWhatsApp();
    addOrderButtons();
    addFooterNote();
    addScrollReveal();

    const orderLinks = document.querySelectorAll(
      "a[href*='wa.me'], a[href*='api.whatsapp.com']"
    );
    orderLinks.forEach(link => link.setAttribute("rel", "noopener noreferrer"));

    // Formulir pemesanan dapat dibuka dari tombol dengan class fx-order-trigger
    // atau atribut data-fx-order.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
