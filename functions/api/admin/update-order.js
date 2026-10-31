import { requireAdmin } from "../../_shared/auth.js";

const ALLOWED_STATUSES = [
  "Menunggu Persetujuan",
  "Dalam Proses",
  "Sedang Dikerjakan",
  "Revisi",
  "Selesai",
  "Dibatalkan"
];

const WORK_STATUSES = [
  "Dalam Proses",
  "Sedang Dikerjakan",
  "Revisi",
  "Selesai"
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequestPost({ request, env }) {
  const requestOrigin = request.headers.get("Origin");

  if (!requestOrigin || requestOrigin !== new URL(request.url).origin) {
    return json({ error: "Permintaan tidak diizinkan." }, 403);
  }

  const { response } = await requireAdmin(request, env);
  if (response) return response;

  try {
    const contentType = request.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
      return json({ error: "Format permintaan tidak valid." }, 415);
    }

    const rawBody = await request.text();
    if (rawBody.length > 8192) {
      return json({ error: "Permintaan terlalu besar." }, 413);
    }

    const body = JSON.parse(rawBody);
    const orderCode = String(body.order_code || "").trim();
    const orderStatus = String(body.order_status || "").trim();
    const adminNote = String(body.admin_note || "").trim();

    if (!orderCode || orderCode.length > 64) {
      return json({ error: "Kode pesanan tidak valid." }, 400);
    }

    if (!ALLOWED_STATUSES.includes(orderStatus)) {
      return json({ error: "Status pesanan tidak valid." }, 400);
    }

    if (adminNote.length > 2000) {
      return json({ error: "Catatan admin maksimal 2.000 karakter." }, 400);
    }

    let result;

    if (orderStatus === "Dibatalkan") {
      result = await env.fx_digital_db.prepare(`
        UPDATE orders
        SET order_status = ?, admin_note = ?, updated_at = CURRENT_TIMESTAMP
        WHERE order_code = ?
          AND order_status NOT IN ('Dibatalkan', 'Selesai')
          AND payment_status != 'Lunas'
      `).bind(orderStatus, adminNote, orderCode).run();
    } else if (orderStatus === "Menunggu Persetujuan") {
      result = await env.fx_digital_db.prepare(`
        UPDATE orders
        SET admin_note = ?, updated_at = CURRENT_TIMESTAMP
        WHERE order_code = ?
          AND order_status = 'Menunggu Persetujuan'
          AND approved_at IS NULL
          AND final_total IS NULL
      `).bind(adminNote, orderCode).run();
    } else if (WORK_STATUSES.includes(orderStatus)) {
      result = await env.fx_digital_db.prepare(`
        UPDATE orders
        SET order_status = ?, admin_note = ?, updated_at = CURRENT_TIMESTAMP
        WHERE order_code = ?
          AND approved_at IS NOT NULL
          AND final_total IS NOT NULL
          AND final_total > 0
          AND order_status IN (
            'Disetujui',
            'Dalam Proses',
            'Sedang Dikerjakan',
            'Revisi',
            'Selesai'
          )
      `).bind(orderStatus, adminNote, orderCode).run();
    }

    if (!result?.meta?.changes) {
      return json({
        error: "Perubahan ditolak. Pesanan mungkin tidak ditemukan, belum disetujui, atau statusnya tidak memenuhi syarat."
      }, 409);
    }

    return json({
      success: true,
      message: "Perubahan pesanan berhasil disimpan."
    });
  } catch (error) {
    console.error("Gagal memperbarui pesanan:", error);
    return json({ error: "Gagal memperbarui pesanan." }, 500);
  }
}
