function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function hashToken(token) {
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

  const origin = request.headers.get("Origin");
  const requestUrl = new URL(request.url);

  if (origin && origin !== requestUrl.origin) {
    return json({ error: "Permintaan tidak diizinkan." }, 403);
  }

  if (!request.headers.get("Content-Type")?.includes("application/json")) {
    return json({ error: "Format permintaan tidak valid." }, 415);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Format data tidak valid." }, 400);
  }

  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return json({ error: "Tautan tracking tidak valid atau sudah tidak tersedia." }, 404);
  }

  try {
    const tokenHash = await hashToken(token);

    const order = await env.fx_digital_db.prepare(`
      SELECT
        order_code,
        category,
        service,
        package_name,
        quantity,
        unit,
        estimated_total,
        final_total,
        order_status,
        payment_status,
        created_at,
        updated_at,
        invoice_number,
        invoice_published_at
      FROM orders
      WHERE tracking_token_hash = ?
      LIMIT 1
    `).bind(tokenHash).first();

    if (!order) {
      return json({
        error: "Pesanan tidak ditemukan. Periksa tautan tracking pribadi Anda."
      }, 404);
    }

    return json({
      success: true,
      order: {
        code: order.order_code,
        category: order.category,
        service: order.service,
        package: order.package_name,
        quantity: order.quantity,
        unit: order.unit,
        estimatedTotal: order.estimated_total,
        finalTotal: order.final_total,
        status: order.order_status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        invoicePublished: Boolean(order.invoice_published_at),
        invoiceNumber: order.invoice_number || null
      }
    });
  } catch (error) {
    console.error("Gagal melacak pesanan:", error);
    return json({ error: "Pelacakan pesanan gagal. Silakan coba kembali." }, 500);
  }
}
