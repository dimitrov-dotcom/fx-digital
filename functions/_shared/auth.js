const COOKIE_NAME = "__Host-fx_admin_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function bytesToHex(bytes) {
  return Array.from(bytes, byte =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function hexToBytes(hex) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) {
    throw new Error("Format hash tidak valid.");
  }

  return Uint8Array.from(
    hex.match(/.{2}/g),
    byte => parseInt(byte, 16)
  );
}

async function sha256(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  return bytesToHex(new Uint8Array(digest));
}

export async function verifyAdminPassword(password, storedHash) {
  try {
    if (typeof password !== "string" ||
        typeof storedHash !== "string") {
      return false;
    }

    const parts = storedHash.split("$");

    if (parts.length !== 4 || parts[0] !== "pbkdf2") {
      return false;
    }

    const iterations = Number(parts[1]);
    const salt = hexToBytes(parts[2]);
    const expected = hexToBytes(parts[3]);

    if (!Number.isInteger(iterations) ||
        iterations < 100000 ||
        iterations > 1000000 ||
        salt.length < 16 ||
        expected.length !== 32) {
      return false;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const derived = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt,
        iterations
      },
      key,
      256
    );

    const actual = new Uint8Array(derived);

    let difference = 0;
    for (let i = 0; i < expected.length; i++) {
      difference |= actual[i] ^ expected[i];
    }

    return difference === 0;
  } catch {
    return false;
  }
}

export async function createAdminSession(db) {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = bytesToHex(tokenBytes);
  const tokenHash = await sha256(token);
  const id = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_SECONDS * 1000
  ).toISOString();

  await db.prepare(`
    INSERT INTO admin_sessions (id, token_hash, expires_at)
    VALUES (?, ?, ?)
  `).bind(id, tokenHash, expiresAt).run();

  return {
    token,
    expiresAt
  };
}

export function makeSessionCookie(token) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;

    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    if (key === name) return value;
  }

  return null;
}

export async function getAdminSession(request, db) {
  const token = getCookie(request, COOKIE_NAME);

  if (!token || !/^[0-9a-f]{64}$/i.test(token)) {
    return null;
  }

  const tokenHash = await sha256(token);

  const session = await db.prepare(`
    SELECT id, expires_at
    FROM admin_sessions
    WHERE token_hash = ?
      AND expires_at > ?
    LIMIT 1
  `).bind(tokenHash, new Date().toISOString()).first();

  return session || null;
}

export async function requireAdmin(request, env) {
  if (!env.fx_digital_db) {
    return {
      session: null,
      response: json({ error: "Database tidak tersedia." }, 503)
    };
  }

  const session = await getAdminSession(
    request,
    env.fx_digital_db
  );

  if (!session) {
    return {
      session: null,
      response: json({ error: "Autentikasi diperlukan." }, 401)
    };
  }

  return {
    session,
    response: null
  };
}

export async function deleteAdminSession(request, db) {
  const token = getCookie(request, COOKIE_NAME);

  if (!token || !/^[0-9a-f]{64}$/i.test(token)) {
    return;
  }

  const tokenHash = await sha256(token);

  await db.prepare(`
    DELETE FROM admin_sessions
    WHERE token_hash = ?
  `).bind(tokenHash).run();
}
