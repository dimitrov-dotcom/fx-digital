async function sha256(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  return Array.from(new Uint8Array(digest), byte =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const origin = request.headers.get("Origin");
    if (origin && origin !== new URL(request.url).origin) {
      return json({ error: "Permintaan tidak diizinkan." }, 403);
    }

    const contentType = request.headers.get("Content-Type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return json({ error: "Format permintaan tidak valid." }, 415);
    }

    const rawBody = await request.text();
    if (rawBody.length > 2048) {
      return json({ error: "Permintaan terlalu besar." }, 413);
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json({ error: "Format JSON tidak valid." }, 400);
    }

    const token = typeof body?.token === "string" ? body.token : "";

    if (!/^[A-F0-9]{64}$/.test(token)) {
      return json({ error: "Invoice tidak ditemukan." }, 404);
    }

    if (!env.fx_digital_db) {
      return json({ error: "Layanan invoice tidak tersedia." }, 503);
    }

    const tokenHash = await sha256(token);

    const order = await env.fx_digital_db.prepare(`
      SELECT
        invoice_number,
        order_code,
        customer_name,
        category,
        service,
        package_name,
        quantity,
        unit,
        final_total,
        payment_status,
        created_at,
        invoice_published_at
      FROM orders
      WHERE invoice_token_hash = ?
        AND invoice_published_at IS NOT NULL
        AND invoice_number IS NOT NULL
        AND final_total IS NOT NULL
        AND final_total > 0
        AND approved_at IS NOT NULL
        AND order_status IN (
          'Disetujui',
          'Dalam Proses',
          'Sedang Dikerjakan',
          'Revisi',
          'Selesai'
        )
      LIMIT 1
    `).bind(tokenHash).first();

    if (!order) {
      return json({ error: "Invoice tidak ditemukan." }, 404);
    }

    return json({
      success: true,
      invoice: order
    });
  } catch (error) {
    console.error("Gagal memuat data invoice.");
    return json({ error: "Invoice tidak dapat dimuat." }, 500);
  }
}
