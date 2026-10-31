(() => {
  "use strict";

  const API = {
    session: "/api/admin/session",
    login: "/api/admin/login",
    logout: "/api/admin/logout",
    orders: "/api/admin/orders",
    update: "/api/admin/update-order",
    approve: "/api/admin/approve-order",
    publishInvoice: "/api/admin/publish-invoice",
    updatePayment: "/api/admin/update-payment"
  };

  // Persetujuan resmi dan penetapan harga final akan dibuat
  // melalui endpoint khusus, bukan perubahan status biasa.
  const STATUSES = [
    "Menunggu Persetujuan",
    "Disetujui",
    "Dalam Proses",
    "Sedang Dikerjakan",
    "Revisi",
    "Selesai",
    "Dibatalkan"
  ];

  const STATUS_COLORS = {
    "Menunggu Persetujuan": "#facc15",
    "Disetujui": "#60a5fa",
    "Dalam Proses": "#60a5fa",
    "Sedang Dikerjakan": "#c084fc",
    "Revisi": "#fb923c",
    "Selesai": "#4ade80",
    "Dibatalkan": "#f87171"
  };

  const $ = id => document.getElementById(id);

  const loginSection = $("fx-admin-login");
  const dashboard = $("fx-admin-dashboard");
  const loginForm = $("fx-admin-login-form");
  const passwordInput = $("fx-admin-password");
  const loginButton = $("fx-admin-login-button");
  const loginFeedback = $("fx-admin-login-feedback");
  const globalFeedback = $("fx-admin-global-feedback");
  const list = $("fx-admin-list");
  const search = $("fx-admin-search");

  let orders = [];
  let loading = false;
  let invoicePublicationNotice = null;

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function rupiah(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "-";

    return "Rp" + amount.toLocaleString("id-ID");
  }

  function formatDate(value) {
    if (!value) return "-";

    const normalized = String(value).includes("T")
      ? value
      : String(value).replace(" ", "T") + "Z";

    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  async function api(url, options = {}) {
    const response = await fetch(url, {
      cache: "no-store",
      credentials: "same-origin",
      ...options,
      headers: {
        ...(options.headers || {})
      }
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("Respons server tidak dapat dibaca.");
    }

    if (response.status === 401) {
      showLogin("Sesi admin telah berakhir. Silakan login kembali.");
      throw new Error("Sesi admin tidak berlaku.");
    }

    if (!response.ok) {
      throw new Error(data.error || "Permintaan gagal.");
    }

    return data;
  }

  function showLogin(message = "") {
    orders = [];
    dashboard.hidden = true;
    loginSection.hidden = false;
    loginFeedback.textContent = message;
    globalFeedback.textContent = "";
    list.innerHTML = "";
  }

  function showDashboard() {
    loginSection.hidden = true;
    dashboard.hidden = false;
    loginFeedback.textContent = "";
  }

  function updateStats() {
    $("stat-total").textContent = orders.length;

    $("stat-waiting").textContent = orders.filter(
      order => order.order_status === "Menunggu Persetujuan"
    ).length;

    $("stat-working").textContent = orders.filter(
      order => [
        "Dalam Proses",
        "Sedang Dikerjakan",
        "Revisi"
      ].includes(order.order_status)
    ).length;

    $("stat-done").textContent = orders.filter(
      order => order.order_status === "Selesai"
    ).length;
  }

  function render() {
    updateStats();

    const keyword = search.value.trim().toLowerCase();

    const filtered = orders.filter(order => {
      const content = [
        order.order_code,
        order.customer_name,
        order.customer_whatsapp,
        order.category,
        order.service,
        order.package_name,
        order.order_status
      ].join(" ").toLowerCase();

      return content.includes(keyword);
    });

    if (!filtered.length) {
      list.innerHTML = `
        <div class="fx-admin-empty">
          <h3>${orders.length ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}</h3>
          <p>${orders.length
            ? "Coba gunakan kata pencarian lain."
            : "Pesanan yang masuk melalui website akan muncul di sini."}</p>
        </div>
      `;
      return;
    }

    list.innerHTML = filtered.map(order => {
      const status = order.order_status || "Menunggu Persetujuan";

      const options = STATUSES.map(item => `
        <option value="${escapeHTML(item)}"
          ${item === status ? "selected" : ""}>
          ${escapeHTML(item)}
        </option>
      `).join("");

      const finalTotal = order.final_total === null
        ? "Belum ditetapkan"
        : rupiah(order.final_total);

      const invoiceEligibleStatuses = [
        "Disetujui",
        "Dalam Proses",
        "Sedang Dikerjakan",
        "Revisi",
        "Selesai"
      ];

      const canPublishInvoice =
        Boolean(order.approved_at) &&
        Number.isSafeInteger(Number(order.final_total)) &&
        Number(order.final_total) > 0 &&
        invoiceEligibleStatuses.includes(status) &&
        !order.invoice_number &&
        !order.invoice_published_at;

      const invoiceInfo = order.invoice_number
        ? `
          <div class="fx-admin-approval">
            <strong>Invoice: ${escapeHTML(order.invoice_number)}</strong>
            <p>Telah diterbitkan pada:
              ${escapeHTML(formatDate(order.invoice_published_at))}
            </p>
          </div>
        `
        : "";

      return `
        <article class="fx-admin-order" data-code="${escapeHTML(order.order_code)}">
          <div class="fx-admin-order-top">
            <div>
              <strong>${escapeHTML(order.order_code)}</strong>
              <small>${escapeHTML(formatDate(order.created_at))}</small>
            </div>

            <span class="fx-admin-badge"
              style="--status-color:${STATUS_COLORS[status] || "#a9b7c8"}">
              ${escapeHTML(status)}
            </span>
          </div>

          <div class="fx-admin-order-details">
            <p><b>Nama:</b> ${escapeHTML(order.customer_name)}</p>
            <p><b>WhatsApp:</b> ${escapeHTML(order.customer_whatsapp)}</p>
            <p><b>Kategori:</b> ${escapeHTML(order.category)}</p>
            <p><b>Layanan:</b> ${escapeHTML(order.service)}</p>
            <p><b>Paket:</b> ${escapeHTML(order.package_name)}</p>
            <p><b>Jumlah:</b> ${escapeHTML(order.quantity)} ${escapeHTML(order.unit || "")}</p>
            <p><b>Estimasi:</b> ${escapeHTML(rupiah(order.estimated_total))}</p>
            <p><b>Harga Final:</b> ${escapeHTML(finalTotal)}</p>
            <p><b>Status Pembayaran:</b> ${escapeHTML(order.payment_status)}</p>
            <p><b>Catatan Verifikasi:</b> ${escapeHTML(order.payment_note || "-")}</p>
            <p><b>Waktu Verifikasi:</b> ${escapeHTML(formatDate(order.payment_verified_at) || "-")}</p>
            <p><b>Diverifikasi oleh:</b> ${escapeHTML(order.payment_verified_by || "-")}</p>
            <p><b>Catatan Pelanggan:</b> ${escapeHTML(order.customer_notes || "-")}</p>
            <p><b>Catatan Admin:</b> ${escapeHTML(order.admin_note || "-")}</p>
          </div>

          ${status === "Menunggu Persetujuan" && order.final_total === null ? `
            <div class="fx-admin-approval">
              <label>
                Tetapkan Harga Final (Rupiah)
                <input
                  type="number"
                  class="fx-admin-final-price"
                  min="1"
                  max="100000000000"
                  step="1"
                  inputmode="numeric"
                  placeholder="Contoh: 150000"
                  required
                >
              </label>
              <button type="button" class="fx-admin-approve">
                Setujui Pesanan
              </button>
              <p class="fx-admin-approval-feedback" role="status" aria-live="polite"></p>
            </div>
          ` : ""}

          ${order.invoice_number &&
             order.invoice_published_at &&
             status !== "Dibatalkan" &&
             ["Belum Dibayar", "DP Dibayar"].includes(order.payment_status) ? `
            <div class="fx-admin-approval">
              <strong>Verifikasi Pembayaran</strong>
              <label>
                Status pembayaran yang diverifikasi
                <select class="fx-admin-payment-status">
                  ${order.payment_status === "Belum Dibayar"
                    ? '<option value="DP Dibayar">DP Dibayar</option><option value="Lunas">Lunas</option>'
                    : '<option value="Lunas">Lunas</option>'}
                </select>
              </label>
              <label>
                Catatan bukti pembayaran (wajib)
                <textarea class="fx-admin-payment-note"
                  rows="2"
                  maxlength="1000"
                  placeholder="Contoh: Transfer bank, nominal dan referensi transaksi..."
                  required></textarea>
              </label>
              <button type="button" class="fx-admin-verify-payment">
                Verifikasi Pembayaran
              </button>
              <p class="fx-admin-payment-feedback" role="status" aria-live="polite"></p>
            </div>
          ` : ""}

          ${canPublishInvoice ? `
            <div class="fx-admin-approval">
              <strong>Invoice belum diterbitkan</strong>
              <p>Harga final: ${escapeHTML(rupiah(order.final_total))}</p>
              <button type="button" class="fx-admin-publish-invoice">
                Terbitkan Invoice
              </button>
              <p class="fx-admin-invoice-feedback" role="status" aria-live="polite"></p>
            </div>
          ` : invoiceInfo}

          <div class="fx-admin-controls">
            <label>
              Status Pesanan
              <select class="fx-admin-status">
                ${options}
              </select>
            </label>

            <label>
              Catatan Admin untuk Pelanggan
              <textarea class="fx-admin-note"
                rows="3"
                maxlength="2000"
                placeholder="Contoh: Pesanan sedang kami kerjakan...">${escapeHTML(order.admin_note || "")}</textarea>
            </label>

            <button type="button" class="fx-admin-save">
              Simpan Perubahan
            </button>

            <p class="fx-admin-feedback" aria-live="polite"></p>
          </div>
        </article>
      `;
    }).join("");
  }

  async function loadOrders() {
    if (loading) return;

    loading = true;
    globalFeedback.textContent = "Memuat pesanan dari database...";

    try {
      const data = await api(API.orders);

      if (!Array.isArray(data.orders)) {
        throw new Error("Format daftar pesanan tidak valid.");
      }

      orders = data.orders;
      render();
      globalFeedback.textContent =
        `${orders.length} pesanan berhasil dimuat dari database.`;
    } catch (error) {
      if (error.message !== "Sesi admin tidak berlaku.") {
        globalFeedback.textContent = error.message;
      }
    } finally {
      loading = false;
    }
  }

  async function checkSession() {
    try {
      const data = await api(API.session);

      if (!data.authenticated) {
        showLogin();
        return;
      }

      showDashboard();
      await loadOrders();
    } catch (error) {
      showLogin(error.message);
    }
  }

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (loginButton.disabled) return;

    loginButton.disabled = true;
    loginButton.textContent = "Memeriksa...";
    loginFeedback.textContent = "";

    try {
      const data = await api(API.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password: passwordInput.value
        })
      });

      if (!data.success) {
        throw new Error(data.error || "Login gagal.");
      }

      passwordInput.value = "";
      showDashboard();
      await loadOrders();
    } catch (error) {
      loginFeedback.textContent = error.message;
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Masuk";
    }
  });

  $("fx-admin-logout").addEventListener("click", async () => {
    const button = $("fx-admin-logout");
    button.disabled = true;

    try {
      await api(API.logout, {
        method: "POST"
      });

      showLogin("Anda telah keluar dari panel admin.");
      passwordInput.value = "";
    } catch (error) {
      globalFeedback.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  $("fx-admin-refresh").addEventListener("click", loadOrders);
  search.addEventListener("input", render);

  list.addEventListener("click", async event => {
    const invoiceButton = event.target.closest(".fx-admin-publish-invoice");

    if (invoiceButton) {
      const card = invoiceButton.closest(".fx-admin-order");
      const code = card?.dataset.code;
      const feedback = card?.querySelector(".fx-admin-invoice-feedback");
      const order = orders.find(item => item.order_code === code);

      if (!order || !feedback) return;

      if (!confirm(
        `Terbitkan invoice untuk ${code} sebesar ${rupiah(order.final_total)}?`
      )) return;

      invoiceButton.disabled = true;
      invoiceButton.textContent = "Menerbitkan...";
      feedback.textContent = "";

      try {
        const data = await api(API.publishInvoice, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_code: code })
        });

        if (!data.success || !data.invoice_url || !data.invoice_number) {
          throw new Error(data.error || "Penerbitan invoice gagal.");
        }

        const invoiceUrl = new URL(data.invoice_url, window.location.origin);

        if (
          invoiceUrl.origin !== window.location.origin ||
          invoiceUrl.pathname !== "/invoice.html" ||
          !/^[A-F0-9]{64}$/.test(invoiceUrl.searchParams.get("token") || "")
        ) {
          throw new Error("Tautan invoice dari server tidak valid.");
        }

        invoicePublicationNotice = {
          orderCode: code,
          invoiceNumber: data.invoice_number,
          url: invoiceUrl.href
        };

        await loadOrders();

        const link = document.createElement("a");
        link.href = invoicePublicationNotice.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Buka invoice";

        globalFeedback.replaceChildren(
          document.createTextNode(
            `Invoice ${invoicePublicationNotice.invoiceNumber} untuk ${code} berhasil diterbitkan. Tautan siap dibagikan secara manual: `
          ),
          link
        );
      } catch (error) {
        feedback.textContent = error.message;
      } finally {
        invoiceButton.disabled = false;
        invoiceButton.textContent = "Terbitkan Invoice";
      }

      return;
    }

    const paymentButton = event.target.closest(".fx-admin-verify-payment");

    if (paymentButton) {
      const card = paymentButton.closest(".fx-admin-order");
      const code = card?.dataset.code;
      const feedback = card?.querySelector(".fx-admin-payment-feedback");
      const statusInput = card?.querySelector(".fx-admin-payment-status");
      const noteInput = card?.querySelector(".fx-admin-payment-note");
      const order = orders.find(item => item.order_code === code);

      if (!order || !feedback || !statusInput || !noteInput) return;

      const paymentStatus = statusInput.value;
      const paymentNote = noteInput.value.trim();

      if (!paymentNote) {
        feedback.textContent = "Catatan bukti pembayaran wajib diisi.";
        noteInput.focus();
        return;
      }

      if (paymentNote.length > 1000) {
        feedback.textContent = "Catatan maksimal 1.000 karakter.";
        noteInput.focus();
        return;
      }

      if (!confirm(
        `Verifikasi pembayaran ${code} sebagai ${paymentStatus}? Pastikan dana sudah diterima.`
      )) return;

      paymentButton.disabled = true;
      paymentButton.textContent = "Memverifikasi...";
      feedback.textContent = "";

      try {
        const data = await api(API.updatePayment, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_code: code,
            payment_status: paymentStatus,
            payment_note: paymentNote
          })
        });

        if (!data.success) {
          throw new Error(data.error || "Verifikasi pembayaran gagal.");
        }

        globalFeedback.textContent = data.message;
        await loadOrders();
      } catch (error) {
        feedback.textContent = error.message;
      } finally {
        paymentButton.disabled = false;
        paymentButton.textContent = "Verifikasi Pembayaran";
      }

      return;
    }

    const approveButton = event.target.closest(".fx-admin-approve");

    if (approveButton) {
      const card = approveButton.closest(".fx-admin-order");
      const code = card.dataset.code;
      const priceInput = card.querySelector(".fx-admin-final-price");
      const feedback = card.querySelector(".fx-admin-approval-feedback");
      const rawPrice = priceInput.value.trim();
      const finalTotal = Number(rawPrice);

      if (!rawPrice || !Number.isSafeInteger(finalTotal) ||
          finalTotal < 1 || finalTotal > 100000000000) {
        feedback.textContent = "Masukkan harga final berupa angka bulat positif.";
        priceInput.focus();
        return;
      }

      if (!confirm(
        `Setujui pesanan ${code} dengan harga final ${rupiah(finalTotal)}?`
      )) return;

      approveButton.disabled = true;
      approveButton.textContent = "Memproses...";
      feedback.textContent = "";

      try {
        const data = await api(API.approve, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_code: code,
            final_total: finalTotal
          })
        });

        if (!data.success) {
          throw new Error(data.error || "Persetujuan gagal.");
        }

        globalFeedback.textContent = data.message;
        await loadOrders();
      } catch (error) {
        feedback.textContent = error.message;
      } finally {
        approveButton.disabled = false;
        approveButton.textContent = "Setujui Pesanan";
      }

      return;
    }

    const button = event.target.closest(".fx-admin-save");
    if (!button) return;

    const card = button.closest(".fx-admin-order");
    const code = card.dataset.code;
    const statusSelect = card.querySelector(".fx-admin-status");
    const noteInput = card.querySelector(".fx-admin-note");
    const feedback = card.querySelector(".fx-admin-feedback");

    const order = orders.find(item => item.order_code === code);

    if (!order) {
      feedback.textContent = "Pesanan tidak ditemukan. Muat ulang halaman.";
      return;
    }

    const newStatus = statusSelect.value;
    const adminNote = noteInput.value.trim();

    if (adminNote.length > 2000) {
      feedback.textContent = "Catatan maksimal 2.000 karakter.";
      return;
    }

    if (newStatus === "Disetujui") {
      feedback.textContent =
        "Persetujuan harus dilakukan melalui proses penetapan harga final.";
      return;
    }

    button.disabled = true;
    button.textContent = "Menyimpan...";
    feedback.textContent = "";

    try {
      const data = await api(API.update, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          order_code: code,
          order_status: newStatus,
          admin_note: adminNote
        })
      });

      if (!data.success) {
        throw new Error(data.error || "Perubahan gagal disimpan.");
      }

      feedback.textContent = "Perubahan berhasil disimpan.";
      await loadOrders();
    } catch (error) {
      feedback.textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = "Simpan Perubahan";
    }
  });

  checkSession();
})();
