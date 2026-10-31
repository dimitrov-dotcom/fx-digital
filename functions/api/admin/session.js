import { getAdminSession } from "../../_shared/auth.js";

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
  if (!env.fx_digital_db) {
    return json({ error: "Database tidak tersedia." }, 503);
  }

  try {
    const session = await getAdminSession(
      request,
      env.fx_digital_db
    );

    if (!session) {
      return json({ authenticated: false }, 200);
    }

    return json({
      authenticated: true,
      expiresAt: session.expires_at
    });
  } catch {
    return json({ error: "Gagal memeriksa sesi." }, 500);
  }
}
