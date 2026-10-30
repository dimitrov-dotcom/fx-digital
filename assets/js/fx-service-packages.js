(() => {
  function initPackages() {
    const phone = window.FX_CONFIG?.whatsapp || "6285168764882";

    const overlay = document.createElement("div");
    overlay.className = "fx-modal-overlay";
    overlay.hidden = true;

    overlay.innerHTML = `
      <section class="fx-package-modal"
               role="dialog"
               aria-modal="true"
               aria-labelledby="fx-modal-title">

        <button class="fx-modal-close" type="button" aria-label="Tutup">×</button>

        <div class="fx-modal-heading">
          <span>💎 FX DIGITAL SERVICE</span>
          <h2 id="fx-modal-title">Pilih Paket Layanan</h2>
          <p>Sesuaikan pilihan paket dengan kebutuhan Anda.</p>
        </div>

        <div class="fx-modal-packages"></div>
      </section>
    `;

    document.body.appendChild(overlay);

    const closeModal = () => {
      overlay.hidden = true;
      document.body.classList.remove("fx-modal-open");
    };

    overlay.querySelector(".fx-modal-close")
      .addEventListener("click", closeModal);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !overlay.hidden) closeModal();
    });

    document.querySelectorAll("article.card").forEach((card) => {
      if (card.querySelector(".fx-package-area")) return;

      const priceElement = card.querySelector(".fx-service-price");
      const titleElement = card.querySelector("h3");

      if (!priceElement || !titleElement) return;

      const match = priceElement.textContent.match(/Rp\s*([\d.]+)/i);
      if (!match) return;

      const basePrice = Number(match[1].replace(/\./g, ""));
      if (!basePrice) return;

      const unitMatch = priceElement.textContent.match(/(\/[a-zA-Z]+)/);
      const unit = unitMatch ? unitMatch[1] : "";
      const title = titleElement.textContent.trim();

      const area = document.createElement("div");
      area.className = "fx-package-area";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "fx-package-toggle";
      button.innerHTML = `
        <span>💰 Lihat Pilihan Paket</span>
        <span>＋</span>
      `;

      button.addEventListener("click", () => {
        const packagesContainer = overlay.querySelector(".fx-modal-packages");
        packagesContainer.replaceChildren();

        const packages = [
          {
            name: "Basic",
            multiplier: 1,
            description: "Paket dasar sesuai cakupan layanan."
          },
          {
            name: "Standard",
            multiplier: 1.5,
            description: "Paket dengan cakupan dan pengerjaan lebih lengkap."
          },
          {
            name: "Premium",
            multiplier: 2,
            description: "Paket dengan cakupan pengerjaan lebih luas."
          }
        ];

        packages.forEach((pkg) => {
          const price = Math.round(basePrice * pkg.multiplier);
          const formatted = "Rp" + price.toLocaleString("id-ID") + unit;

          const item = document.createElement("article");
          item.className = "fx-modal-package " + pkg.name.toLowerCase();

          const heading = document.createElement("h3");
          heading.textContent = pkg.name;

          const amount = document.createElement("strong");
          amount.textContent = formatted;

          const description = document.createElement("p");
          description.textContent = pkg.description;

          const link = document.createElement("a");
          link.className = "fx-package-order";
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "Pesan Paket Ini";

          const message =
            `Halo FX Digital, saya tertarik dengan layanan ${title}, paket ${pkg.name}, estimasi harga ${formatted}. Saya ingin konsultasi lebih lanjut.`;

          link.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

          item.append(heading, amount, description, link);
          packagesContainer.appendChild(item);
        });

        overlay.querySelector("#fx-modal-title").textContent = title;
        overlay.hidden = false;
        document.body.classList.add("fx-modal-open");
        overlay.querySelector(".fx-modal-close").focus();
      });

      area.appendChild(button);
      priceElement.replaceWith(area);
      card.appendChild(area);
      card.classList.add("fx-has-packages");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPackages);
  } else {
    initPackages();
  }
})();
