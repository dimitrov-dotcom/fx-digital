(() => {
  "use strict";

  const container = document.getElementById("fx-invoice-content");
  const printButton = document.getElementById("fx-invoice-print");
  const initialUrl = new URL(window.location.href);
  const token = initialUrl.searchParams.get("token") || "";
  if (initialUrl.searchParams.has("token")) {
    initialUrl.searchParams.delete("token");
    window.history.replaceState({}, document.title, initialUrl.pathname + initialUrl.search + initialUrl.hash);
  }

  printButton.disabled = true;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text ?? "";
    if (className) node.className = className;
    return node;
  }

  function rupiah(value) {
    const amount = Number(value);
    if (!Number.isSafeInteger(amount) || amount < 0) return "-";
    return "Rp" + amount.toLocaleString("id-ID");
  }

  function formatDate(value) {
    if (!value) return "-";
    const parsed = new Date(value.replace(" ", "T") + (value.includes("Z") ? "" : "Z"));
    return Number.isNaN(parsed.getTime())
      ? "-"
      : parsed.toLocaleString("id-ID", {
          dateStyle: "long",
          timeStyle: "short"
        });
  }

  function row(label, value) {
    const p = document.createElement("p");
    const strong = element("strong", label + ": ");
    p.append(strong, document.createTextNode(value ?? "-"));
    return p;
  }

  function showError(message) {
    container.replaceChildren(element("p", message));
    printButton.disabled = true;
  }

  async function loadInvoice() {
    if (!token || !/^[A-F0-9]{64}$/.test(token)) {
      showError("Invoice tidak ditemukan. Gunakan tautan invoice resmi dari FX Digital.");
      return;
    }

    try {
      const response = await fetch("/api/invoice", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token }),
        cache: "no-store",
        credentials: "same-origin",
        referrerPolicy: "no-referrer"
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.invoice) {
        throw new Error(data.error || "Invoice tidak dapat ditemukan.");
      }

      const invoice = data.invoice;
      const main = document.createElement("div");

      const header = document.createElement("header");
      header.className = "fx-invoice-header";

      const brand = document.createElement("div");
      brand.append(
        element("span", "FX DIGITAL", "eyebrow"),
        element("h1", "INVOICE"),
        element("p", "Layanan Digital dan Teknologi")
      );

      const number = document.createElement("div");
      number.className = "fx-invoice-number";
      number.append(
        element("strong", invoice.invoice_number),
        element("span", "Diterbitkan: " + formatDate(invoice.invoice_published_at))
      );

      header.append(brand, number);
      main.append(header);

      const divider = document.createElement("hr");
      main.append(divider);

      const customer = document.createElement("section");
      customer.className = "fx-invoice-customer";
      customer.append(
        element("h2", "Informasi Pelanggan"),
        row("Nama", invoice.customer_name),
        row("Kode Pesanan", invoice.order_code),
        row("Tanggal Pesanan", formatDate(invoice.created_at))
      );
      main.append(customer);

      const details = document.createElement("section");
      details.className = "fx-invoice-table-wrap";
      details.append(element("h2", "Rincian Pesanan"));

      const table = document.createElement("table");
      table.className = "fx-invoice-table";

      const thead = document.createElement("thead");
      const headingRow = document.createElement("tr");
      ["Layanan", "Paket", "Jumlah", "Harga Final"].forEach(label => {
        headingRow.append(element("th", label));
      });
      thead.append(headingRow);

      const tbody = document.createElement("tbody");
      const itemRow = document.createElement("tr");
      [
        invoice.service,
        invoice.package_name,
        `${invoice.quantity ?? 1} ${invoice.unit ?? ""}`.trim(),
        rupiah(invoice.final_total)
      ].forEach(value => itemRow.append(element("td", value)));
      tbody.append(itemRow);

      table.append(thead, tbody);
      details.append(table);
      main.append(details);

      const total = document.createElement("section");
      total.className = "fx-invoice-total";
      total.append(
        element("span", "Total Tagihan"),
        element("strong", rupiah(invoice.final_total))
      );
      main.append(total);

      const payment = document.createElement("section");
      payment.className = "fx-invoice-notes";
      payment.append(
        element("h2", "Status Pembayaran"),
        element("p", invoice.payment_status || "Belum Dibayar")
      );
      main.append(payment);

      const footer = document.createElement("footer");
      footer.className = "fx-invoice-footer";
      footer.append(
        element("p", "Terima kasih telah menggunakan layanan FX Digital."),
        element("p", "Invoice ini diterbitkan oleh FX Digital berdasarkan harga final yang telah disetujui."),
        element("p", "Simpan invoice ini sebagai referensi pembayaran.")
      );
      main.append(footer);

      container.replaceChildren(main);
      printButton.disabled = false;
    } catch (error) {
      showError(error.message || "Terjadi kesalahan saat memuat invoice.");
    }
  }

  printButton.addEventListener("click", () => {
    if (!printButton.disabled) window.print();
  });

  loadInvoice();
})();
