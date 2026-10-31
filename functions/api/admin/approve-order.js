import { requireAdmin } from "../../_shared/auth.js";

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

    const body = await request.json();
    const orderCode = String(body.order_code || "").trim();
    const finalTotal = body.final_total;

    if (!orderCode || orderCode.length > 64) {
      return json({ error: "Kode pesanan tidak valid." }, 400);
    }

    if (
      !Number.isSafeInteger(finalTotal) ||
      finalTotal < 1 ||
      finalTotal > 100000000000
    ) {
      return json({ error: "Harga final harus berupa angka bulat positif yang valid." }, 400);
    }

    const result = await env.fx_digital_db.prepare(`
      UPDATE orders
      SET
        final_total = ?,
        order_status = 'Disetujui',
        approved_at = CURRENT_TIMESTAMP,
        approved_by = 'admin',
        updated_at = CURRENT_TIMESTAMP
      WHERE order_code = ?
        AND order_status = 'Menunggu Persetujuan'
        AND final_total IS NULL
    `).bind(finalTotal, orderCode).run();

    if (!result.meta?.changes) {
      return json({
        error: "Pesanan tidak ditemukan, sudah diproses, atau sudah memiliki harga final."
      }, 409);
    }

    return json({
      success: true,
      message: "Pesanan berhasil disetujui dan harga final telah ditetapkan."
    });
  } catch (error) {
    console.error("Gagal menyetujui pesanan:", error);
    return json({ error: "Gagal menyetujui pesanan." }, 500);
  }
}
