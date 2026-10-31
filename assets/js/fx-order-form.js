(() => {
  function initOrderForm() {
    const form = document.querySelector("#fx-order-form");
    const calcCategory = document.querySelector("#fx-calc-category");
    const calcService = document.querySelector("#fx-calc-service");
    const calcPackage = document.querySelector("#fx-calc-package");
    const calcQuantity = document.querySelector("#fx-calc-quantity");
    const calcResult = document.querySelector("#fx-calc-result");

    if (!form || !calcCategory || !calcService) return;

    const category = form.querySelector("#fx-order-category");
    const service = form.querySelector("#fx-order-service");
    const packageSelect = form.querySelector("#fx-order-package");
    const quantity = form.querySelector("#fx-order-quantity");
    const quantityField = form.querySelector("#fx-order-quantity-field");

    function syncServices() {
      calcCategory.value = category.value;
      calcCategory.dispatchEvent(new Event("change"));

      service.replaceChildren();

      [...calcService.options].forEach(option => {
        service.add(new Option(option.textContent, option.value));
      });

      updateQuantityVisibility();
    }

    function updateQuantityVisibility() {
      calcService.value = service.value;
      calcService.dispatchEvent(new Event("change"));

      const selectedText =
        service.options[service.selectedIndex]?.textContent || "";

      const needsQuantity =
        selectedText === "Jasa Pengetikan" ||
        selectedText === "Instalasi Software Windows" ||
        selectedText === "Instalasi Software Linux";

      quantityField.hidden = !needsQuantity;
    }

    category.addEventListener("change", syncServices);
    service.addEventListener("change", updateQuantityVisibility);

    form.addEventListener("submit", event => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      calcCategory.value = category.value;
      calcCategory.dispatchEvent(new Event("change"));

      calcService.value = service.value;
      calcPackage.value = packageSelect.value;
      calcQuantity.value = quantity.value || 1;

      calcService.dispatchEvent(new Event("change"));
      calcPackage.dispatchEvent(new Event("change"));
      calcQuantity.dispatchEvent(new Event("input"));

      const name = form.querySelector("#fx-order-name").value.trim();
      const whatsapp = form.querySelector("#fx-order-whatsapp").value.trim();
      const notes = form.querySelector("#fx-order-notes").value.trim();

      const selectedText =
        service.options[service.selectedIndex]?.textContent || "";

      const needsQuantity =
        selectedText === "Jasa Pengetikan" ||
        selectedText === "Instalasi Software Windows" ||
        selectedText === "Instalasi Software Linux";

      const total = calcResult.textContent;

      const message = [
        "HALO FX DIGITAL, SAYA INGIN MELAKUKAN PEMESANAN.",
        "",
        `Nama: ${name}`,
        `WhatsApp: ${whatsapp}`,
        `Kategori: ${category.value}`,
        `Layanan: ${service.value}`,
        `Paket: ${packageSelect.value}`,
        ...(needsQuantity ? [`Jumlah: ${quantity.value}`] : []),
        `Estimasi harga: ${total}`,
        `Catatan: ${notes || "-"}`,
        "",
        "Mohon konfirmasi pesanan dan harga final. Terima kasih."
      ].join("\n");

      const phone = window.FX_CONFIG?.whatsapp || "6285168764882";
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
      );
    });

    syncServices();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOrderForm);
  } else {
    initOrderForm();
  }
})();
