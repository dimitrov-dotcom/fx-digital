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

export async function onRequestGet({ request, env }) {
  const { response } = await requireAdmin(request, env);

  if (response) {
    return response;
  }

  try {
    const result = await env.fx_digital_db.prepare(`
      SELECT
        order_code,
        customer_name,
        customer_whatsapp,
        category,
        service,
        package_name,
        quantity,
        unit,
        estimated_total,
        final_total,
        customer_notes,
        admin_note,
        order_status,
        payment_status,
        created_at,
        updated_at,
        approved_at,
        invoice_number,
        invoice_published_at,
        payment_verified_at,
        payment_note,
        payment_verified_by
      FROM orders
      ORDER BY created_at DESC
      LIMIT 200
    `).all();

    return json({
      success: true,
      orders: result.results || []
    });
  } catch (error) {
    console.error("Gagal mengambil daftar pesanan:", error);
    return json({
      error: "Gagal mengambil daftar pesanan."
    }, 500);
  }
}
