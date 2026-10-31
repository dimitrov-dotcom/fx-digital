import { requireAdmin } from "../../_shared/auth.js";

const ALLOWED_PAYMENT_STATUSES = ["DP Dibayar", "Lunas"];

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
  const origin = request.headers.get("Origin");

  if (!origin || origin !== new URL(request.url).origin) {
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
    if (rawBody.length > 4096) {
      return json({ error: "Permintaan terlalu besar." }, 413);
    }

    const body = JSON.parse(rawBody);
    const orderCode = String(body.order_code || "").trim();
    const paymentStatus = String(body.payment_status || "").trim();
    const paymentNote = String(body.payment_note || "").trim();

    if (!orderCode || orderCode.length > 64) {
      return json({ error: "Kode pesanan tidak valid." }, 400);
    }

    if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
      return json({ error: "Status pembayaran tidak valid." }, 400);
    }

    if (paymentNote.length > 1000) {
      return json({ error: "Catatan pembayaran maksimal 1.000 karakter." }, 400);
    }

    const result = await env.fx_digital_db.prepare(`
      UPDATE orders
      SET
        payment_status = ?,
        payment_note = ?,
        payment_verified_at = CURRENT_TIMESTAMP,
        payment_verified_by = 'admin',
        updated_at = CURRENT_TIMESTAMP
      WHERE order_code = ?
        AND approved_at IS NOT NULL
        AND final_total IS NOT NULL
        AND final_total > 0
        AND invoice_number IS NOT NULL
        AND invoice_published_at IS NOT NULL
        AND (
          payment_status = 'Belum Dibayar'
          OR (payment_status = 'DP Dibayar' AND ? = 'Lunas')
        )
        AND order_status != 'Dibatalkan'
    `).bind(
      paymentStatus,
      paymentNote || null,
      orderCode,
      paymentStatus
    ).run();

    if (!result.meta?.changes) {
      return json({
        error: "Verifikasi ditolak. Pastikan invoice sudah diterbitkan dan status pembayaran memenuhi syarat."
      }, 409);
    }

    return json({
      success: true,
      message: `Pembayaran berhasil diverifikasi sebagai ${paymentStatus}.`
    });
  } catch (error) {
    console.error("Gagal memperbarui pembayaran:", error);
    return json({ error: "Gagal memperbarui pembayaran." }, 500);
  }
}
