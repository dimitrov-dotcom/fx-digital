(() => {
  const services = {
    "FX Web": [
      ["Landing Page", 300000],
      ["Website Profil Bisnis", 500000],
      ["Undangan Digital", 250000],
      ["Website Portofolio", 350000],
      ["Toko Online", 400000],
      ["Desain UI/UX", 150000],
      ["Perbaikan dan Perawatan Website", 50000],
      ["Website Responsif", 100000]
    ],
    "FX Docs": [
      ["Bantuan Tugas Sekolah", 25000],
      ["Pembuatan Makalah", 50000],
      ["Jasa Pengetikan", 3000, "halaman"],
      ["PowerPoint & Presentasi", 35000],
      ["Rangkuman Materi", 20000],
      ["Laporan & Proposal", 35000],
      ["Format Word & PDF", 25000],
      ["Koreksi & Perapian", 15000],
      ["Bantuan Materi & Latihan", 15000]
    ],
    "FX Tech": [
      ["Instalasi Software Windows", 20000, "aplikasi"],
      ["Instalasi Software Linux", 25000, "aplikasi"],
      ["Instalasi Game Laptop dan PC", 25000],
      ["Pengecekan Kerusakan Software", 25000],
      ["Pengecekan Kerusakan Hardware", 25000],
      ["Optimasi Laptop dan PC", 35000],
      ["Instalasi Ulang Windows atau Linux", 100000],
      ["Instalasi Driver dan Perangkat", 25000]
    ],
    "FX Gaming": [
      ["Instalasi atau Konfigurasi HEN", 50000],
      ["Pengisian dan Pemindahan Game", 20000],
      ["Instalasi Game Konsol", 25000],
      ["Pengelolaan Penyimpanan Konsol", 15000],
      ["Pengecekan Masalah Game", 25000],
      ["Pengecekan Konsol", 35000],
      ["Pembaruan dan Konfigurasi Konsol", 25000],
      ["Pemeriksaan Penyimpanan Eksternal", 15000]
    ]
  };

  const packages = {
    Basic: 1,
    Standard: 1.5,
    Premium: 2
  };

  const STORAGE_KEY = "fxDigitalOrders";

  const rupiah = value =>
    "Rp" + Math.round(value).toLocaleString("id-ID");

  function getOrders() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveOrders(orders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }

  function createOrderCode() {
    const date = new Date();
    const datePart = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("");

    const randomPart = Math.random().toString(36)
      .substring(2, 6).toUpperCase();

    return `FXD-${datePart}-${randomPart}`;
  }

  function initCalculator() {
    const form = document.querySelector("#fx-order-form");
    if (!form) return;

    const category = form.querySelector("#fx-calc-category");
    const service = form.querySelector("#fx-calc-service");
    const packageSelect = form.querySelector("#fx-calc-package");
    const quantity = form.querySelector("#fx-calc-quantity");
    const quantityField = form.querySelector("#fx-calc-quantity-field");
    const quantityLabel = form.querySelector("#fx-calc-quantity-label");

    const baseOutput = form.querySelector("#fx-calc-base");
    const packageOutput = form.querySelector("#fx-calc-package-price");
    const totalOutput = form.querySelector("#fx-calc-result");

    let currentTotal = 0;
    let currentService = null;

    function update() {
      currentService = services[category.value]?.find(
        item => item[0] === service.value
      );

      if (!currentService) return;

      const base = currentService[1];
      const unit = currentService[2] || "";
      const multiplier = packages[packageSelect.value] || 1;
      const count = Math.max(
        1,
        Math.min(1000, Math.floor(Number(quantity.value) || 1))
      );

      quantity.value = count;
      quantityField.hidden = !unit;
      quantityLabel.textContent = unit ? `Jumlah (${unit})` : "Jumlah";

      const packagePrice = base * multiplier;
      currentTotal = packagePrice * count;

      baseOutput.textContent = rupiah(base) + (unit ? " / " + unit : "");
      packageOutput.textContent =
        rupiah(packagePrice) + (unit ? " / " + unit : "");
      totalOutput.textContent = rupiah(currentTotal);
    }

    function fillServices() {
      service.replaceChildren();

      (services[category.value] || []).forEach(item => {
        service.add(new Option(item[0], item[0]));
      });

      update();
    }

    category.addEventListener("change", fillServices);
    service.addEventListener("change", update);
    packageSelect.addEventListener("change", update);
    quantity.addEventListener("input", update);

    form.addEventListener("submit", async event => {
      event.preventDefault();

      if (!form.reportValidity()) return;
      update();

      if (!currentService) {
        alert("Silakan pilih layanan terlebih dahulu.");
        return;
      }

      const name = form.querySelector("#fx-order-name").value.trim();
      const whatsapp = form.querySelector("#fx-order-whatsapp").value.trim();
      const notes = form.querySelector("#fx-order-notes").value.trim();
      const count = Math.max(1, Math.min(1000, Math.floor(Number(quantity.value) || 1)));

      const submitButton = form.querySelector('[type="submit"]');
      const originalText = submitButton ? submitButton.textContent : "";

      // Buka jendela terlebih dahulu agar tidak diblokir browser
      // setelah proses request API selesai.
      const whatsappWindow = window.open("about:blank", "_blank");

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Mengirim Pesanan...";
      }

      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            whatsapp,
            category: category.value,
            service: currentService[0],
            package: packageSelect.value,
            quantity: count,
            notes
          })
        });

        const data = await response.json().catch(() => ({}));

        if (
          !response.ok ||
          !data.success ||
          !data.order?.code ||
          !/^[a-f0-9]{64}$/i.test(data.order?.trackingToken || "")
        ) {
          throw new Error(data.error || "Pesanan gagal dikirim atau tautan tracking tidak tersedia.");
        }

        const order = data.order;
        const trackingUrl = new URL("/", window.location.origin);
        trackingUrl.hash = `track=${order.trackingToken}`;
        const trackingLink = trackingUrl.toString();

        const message = [
          "HALO FX DIGITAL, SAYA INGIN MELAKUKAN PEMESANAN.",
          "",
          `Kode pesanan: ${order.code}`,
          `Nama: ${name}`,
          `WhatsApp: ${whatsapp}`,
          `Kategori: ${order.category}`,
          `Layanan: ${order.service}`,
          `Paket: ${order.package}`,
          ...(order.unit ? [`Jumlah: ${order.quantity} ${order.unit}`] : []),
          `Estimasi harga: ${rupiah(order.estimatedTotal)}`,
          `Status: ${order.status}`,
          `Catatan: ${notes || "-"}`,
          "",
          `Tautan tracking pribadi: ${trackingLink}`,
          "",
          "Mohon konfirmasi pesanan, harga final, dan waktu pengerjaan. Terima kasih."
        ].join("\n");

        const phone = window.FX_CONFIG?.whatsapp || "6285168764882";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        alert(
          `Pesanan berhasil dibuat!\n` +
          `Kode pesanan: ${order.code}\n` +
          `Status: ${order.status}\n\n` +
          "Tautan tracking pribadi sudah disertakan dalam pesan WhatsApp. " +
          "Kirim pesan tersebut agar CS menerima detail pesanan Anda."
        );

        if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.location.href = url;
        } else {
          window.location.href = url;
        }
      } catch (error) {
        if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.close();
        }

        console.error("Gagal mengirim pesanan:", error);
        alert(error.message || "Terjadi kesalahan saat mengirim pesanan.");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      }
    });

    fillServices();
  }



  function initTracker() {
    const result = document.querySelector("#fx-track-result");
    if (!result) return;

    const section = document.querySelector("#fx-order-tracker");

    function showMessage(message) {
      const paragraph = document.createElement("p");
      paragraph.textContent = message;
      result.replaceChildren(paragraph);
    }

    function addRow(container, label, value) {
      const row = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      row.append(strong, document.createTextNode(String(value ?? "-")));
      container.appendChild(row);
    }

    async function loadTracking(token) {
      showMessage("Memuat status pesanan...");

      try {
        const response = await fetch("/api/track-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success || !data.order) {
          throw new Error(data.error || "Status pesanan tidak dapat dimuat.");
        }

        const order = data.order;
        const card = document.createElement("div");
        card.className = "fx-track-card";

        const title = document.createElement("h3");
        title.textContent = "Status Pesanan";
        card.appendChild(title);

        const quantityText = [
          order.quantity ?? 1,
          order.unit || ""
        ].join(" ").trim();

        const created = order.createdAt
          ? new Date(order.createdAt).toLocaleString("id-ID")
          : "-";

        const updated = order.updatedAt
          ? new Date(order.updatedAt).toLocaleString("id-ID")
          : "-";

        const finalPrice = order.finalTotal == null
          ? "Menunggu persetujuan admin"
          : rupiah(order.finalTotal);

        const rows = [
          ["Kode pesanan", order.code],
          ["Kategori", order.category],
          ["Layanan", order.service],
          ["Paket", order.package],
          ["Jumlah", quantityText],
          ["Estimasi harga", rupiah(order.estimatedTotal)],
          ["Harga final", finalPrice],
          ["Status pesanan", order.status],
          ["Status pembayaran", order.paymentStatus],
          ["Tanggal pemesanan", created],
          ["Pembaruan terakhir", updated]
        ];

        rows.forEach(([label, value]) => addRow(card, label, value));

        if (order.invoicePublished) {
          const invoiceNote = document.createElement("p");
          invoiceNote.textContent =
            "Invoice sudah diterbitkan. Gunakan tautan invoice yang diberikan CS melalui WhatsApp.";
          card.appendChild(invoiceNote);
        }

        result.replaceChildren(card);
      } catch (error) {
        showMessage(error.message || "Pelacakan pesanan gagal. Silakan coba kembali.");
      }
    }

    const match = window.location.hash.match(/^#track=([a-f0-9]{64})$/i);

    if (match) {
      const token = match[1];

      history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}#fx-order-tracker`
      );

      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      loadTracking(token);
      return;
    }

    showMessage(
      "Untuk melihat detail pesanan, buka tautan tracking pribadi yang dikirim melalui WhatsApp. " +
      "Kode pesanan saja tidak cukup. Untuk pesanan lama, hubungi CS dengan kode pesanan Anda."
    );
  }

  function init() {
    initCalculator();
    initTracker();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
