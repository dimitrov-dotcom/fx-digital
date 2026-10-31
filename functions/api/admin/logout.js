import {
  deleteAdminSession,
  clearSessionCookie
} from "../../_shared/auth.js";

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

export async function onRequestPost({ request, env }) {
  const requestOrigin = request.headers.get("Origin");

  if (!requestOrigin || requestOrigin !== new URL(request.url).origin) {
    return json({ error: "Permintaan tidak diizinkan." }, 403);
  }

  if (!env.fx_digital_db) {
    return json({ error: "Database tidak tersedia." }, 503);
  }

  try {
    await deleteAdminSession(request, env.fx_digital_db);

    return json(
      { success: true, message: "Logout berhasil." },
      200,
      { "Set-Cookie": clearSessionCookie() }
    );
  } catch {
    return json({ error: "Gagal mengakhiri sesi." }, 500);
  }
}
