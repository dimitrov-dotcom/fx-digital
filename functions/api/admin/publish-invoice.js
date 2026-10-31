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

async function sha256(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  return Array.from(new Uint8Array(digest), byte =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function randomHex(length) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(bytes, byte =>
    byte.toString(16).padStart(2, "0")
  ).join("").toUpperCase();
}

export async function onRequestPost({ request, env }) {
  if (request.headers.get("Origin") !== new URL(request.url).origin) {
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
    if (rawBody.length > 2048) {
      return json({ error: "Permintaan terlalu besar." }, 413);
    }

    const body = JSON.parse(rawBody);
    const orderCode = String(body.order_code || "").trim();

    if (!orderCode || orderCode.length > 64) {
      return json({ error: "Kode pesanan tidak valid." }, 400);
    }

    const token = randomHex(32);
    const tokenHash = await sha256(token);

    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const invoiceNumber = `FXD-INV-${datePart}-${randomHex(4)}`;

    const result = await env.fx_digital_db.prepare(`
      UPDATE orders
      SET
        invoice_number = ?,
        invoice_token_hash = ?,
        invoice_published_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
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
        AND invoice_number IS NULL
        AND invoice_token_hash IS NULL
        AND invoice_published_at IS NULL
    `).bind(invoiceNumber, tokenHash, orderCode).run();

    if (!result.meta?.changes) {
      return json({
        error: "Pesanan belum disetujui, tidak memenuhi syarat, atau invoice sudah diterbitkan."
      }, 409);
    }

    const invoiceUrl = new URL("/invoice.html", request.url);
    invoiceUrl.searchParams.set("token", token);

    return json({
      success: true,
      message: "Invoice berhasil diterbitkan.",
      invoice_number: invoiceNumber,
      invoice_url: invoiceUrl.toString()
    });
  } catch (error) {
    console.error("Gagal menerbitkan invoice:", error);
    return json({ error: "Gagal menerbitkan invoice." }, 500);
  }
}
