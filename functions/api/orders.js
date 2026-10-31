const SERVICES = {
  "FX Web": {
    "Landing Page": 300000,
    "Website Profil Bisnis": 500000,
    "Undangan Digital": 250000,
    "Website Portofolio": 350000,
    "Toko Online": 400000,
    "Desain UI/UX": 150000,
    "Perbaikan dan Perawatan Website": 50000,
    "Website Responsif": 100000
  },
  "FX Docs": {
    "Bantuan Tugas Sekolah": 25000,
    "Pembuatan Makalah": 50000,
    "Jasa Pengetikan": 3000,
    "PowerPoint & Presentasi": 35000,
    "Rangkuman Materi": 20000,
    "Laporan & Proposal": 35000,
    "Format Word & PDF": 25000,
    "Koreksi & Perapian": 15000,
    "Bantuan Materi & Latihan": 15000
  },
  "FX Tech": {
    "Instalasi Software Windows": 20000,
    "Instalasi Software Linux": 25000,
    "Instalasi Game Laptop dan PC": 25000,
    "Pengecekan Kerusakan Software": 25000,
    "Pengecekan Kerusakan Hardware": 25000,
    "Optimasi Laptop dan PC": 35000,
    "Instalasi Ulang Windows atau Linux": 100000,
    "Instalasi Driver dan Perangkat": 25000
  },
  "FX Gaming": {
    "Instalasi atau Konfigurasi HEN": 50000,
    "Pengisian dan Pemindahan Game": 20000,
    "Instalasi Game Konsol": 25000,
    "Pengelolaan Penyimpanan Konsol": 15000,
    "Pengecekan Masalah Game": 25000,
    "Pengecekan Konsol": 35000,
    "Pembaruan dan Konfigurasi Konsol": 25000,
    "Pemeriksaan Penyimpanan Eksternal": 15000
  }
};

const PACKAGES = {
  Basic: 1,
  Standard: 1.5,
  Premium: 2
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function makeOrderCode() {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);

  const randomPart = Array.from(bytes, byte =>
    byte.toString(16).padStart(2, "0")
  ).join("").toUpperCase();

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `FXD-${date}-${randomPart}`;
}

function makeTrackingToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, byte =>
    byte.toString(16).padStart(2, "0")
  ).join("").toUpperCase();
}

async function hashTrackingToken(token) {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest), byte =>
    byte.toString(16).padStart(2, "0")
  ).join("").toUpperCase();
}

export async function onRequestPost({ request, env }) {
  if (!env.fx_digital_db) {
    return json({ error: "Database belum terhubung." }, 503);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Format data tidak valid." }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "Data pesanan tidak valid." }, 400);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const whatsapp = typeof body.whatsapp === "string"
    ? body.whatsapp.trim()
    : "";
  const category = body.category;
  const service = body.service;
  const packageName = body.package;
  const quantity = Number(body.quantity);
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!name || name.length > 100) {
    return json({ error: "Nama wajib diisi dan maksimal 100 karakter." }, 400);
  }

  if (!/^[0-9+\s().-]{8,25}$/.test(whatsapp)) {
    return json({ error: "Nomor WhatsApp tidak valid." }, 400);
  }

  if (!Object.hasOwn(SERVICES, category) ||
      !Object.hasOwn(SERVICES[category], service)) {
    return json({ error: "Kategori atau layanan tidak valid." }, 400);
  }

  if (!Object.hasOwn(PACKAGES, packageName)) {
    return json({ error: "Paket tidak valid." }, 400);
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
    return json({ error: "Jumlah pesanan harus antara 1 sampai 1000." }, 400);
  }

  if (notes.length > 2000) {
    return json({ error: "Catatan maksimal 2000 karakter." }, 400);
  }

  const unit = service === "Jasa Pengetikan"
    ? "halaman"
    : service.startsWith("Instalasi Software ")
      ? "aplikasi"
      : "";

  const estimatedTotal = Math.round(
    SERVICES[category][service] * PACKAGES[packageName] * quantity
  );

  const id = crypto.randomUUID();
  const orderCode = makeOrderCode();
  const trackingToken = makeTrackingToken();
  const trackingTokenHash = await hashTrackingToken(trackingToken);

  try {
    await env.fx_digital_db.prepare(`
      INSERT INTO orders (
        id,
        order_code,
        customer_name,
        customer_whatsapp,
        category,
        service,
        package_name,
        quantity,
        unit,
        estimated_total,
        customer_notes,
        order_status,
        payment_status,
        tracking_token_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      orderCode,
      name,
      whatsapp,
      category,
      service,
      packageName,
      quantity,
      unit,
      estimatedTotal,
      notes || null,
      "Menunggu Persetujuan",
      "Belum Dibayar",
      trackingTokenHash
    ).run();

    return json({
      success: true,
      message: "Pesanan berhasil diterima.",
      order: {
        code: orderCode,
        category,
        service,
        package: packageName,
        quantity,
        unit,
        estimatedTotal,
        status: "Menunggu Persetujuan",
        trackingToken
      }
    }, 201);
  } catch (error) {
    console.error("Gagal menyimpan pesanan:", error);
    return json({ error: "Pesanan gagal disimpan. Silakan coba kembali." }, 500);
  }
}
