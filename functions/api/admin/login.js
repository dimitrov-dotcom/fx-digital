import {
  verifyAdminPassword,
  createAdminSession,
  makeSessionCookie
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

async function sha256(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  return Array.from(new Uint8Array(digest), byte =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export async function onRequestPost({ request, env }) {
  const requestOrigin = request.headers.get("Origin");

  if (!requestOrigin || requestOrigin !== new URL(request.url).origin) {
    return json({ error: "Permintaan tidak diizinkan." }, 403);
  }

  if (!env.fx_digital_db) {
    return json({ error: "Database tidak tersedia." }, 503);
  }

  if (!env.FX_ADMIN_PASSWORD_HASH) {
    return json({ error: "Konfigurasi autentikasi belum tersedia." }, 503);
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ error: "Format permintaan tidak valid." }, 415);
  }

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > 4096) {
    return json({ error: "Permintaan terlalu besar." }, 413);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Format JSON tidak valid." }, 400);
  }

  const password = body?.password;

  if (typeof password !== "string" || password.length < 1 || password.length > 256) {
    return json({ error: "Password tidak valid." }, 400);
  }

  const clientIp = request.headers.get("CF-Connecting-IP") || "local-development";
  const attemptKey = `ip:${await sha256(clientIp)}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - 900;

  try {
    await env.fx_digital_db.prepare(`
      DELETE FROM admin_login_attempts
      WHERE attempted_at < ?
    `).bind(windowStart - 3600).run();

    const attempts = await env.fx_digital_db.prepare(`
      SELECT COUNT(*) AS total
      FROM admin_login_attempts
      WHERE attempt_key = ?
        AND successful = 0
        AND attempted_at > ?
    `).bind(attemptKey, windowStart).first();

    if ((attempts?.total || 0) >= 5) {
      return json({
        error: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit."
      }, 429);
    }

    const valid = await verifyAdminPassword(
      password,
      env.FX_ADMIN_PASSWORD_HASH
    );

    await env.fx_digital_db.prepare(`
      INSERT INTO admin_login_attempts
        (id, attempt_key, attempted_at, successful)
      VALUES (?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      attemptKey,
      now,
      valid ? 1 : 0
    ).run();

    if (!valid) {
      return json({ error: "Password salah." }, 401);
    }

    const session = await createAdminSession(env.fx_digital_db);

    return json(
      { success: true, message: "Login berhasil." },
      200,
      { "Set-Cookie": makeSessionCookie(session.token) }
    );
  } catch {
    return json({ error: "Terjadi kesalahan pada server." }, 500);
  }
}
