// ── Cron Secret Verification (3 methods) ─────────────────────────────────────
export function verifyCronSecret(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // SECURE: no secret configured = deny all

  // Method 1: Vercel automatic cron — Authorization: Bearer <secret>
  if (request.headers.get('authorization') === `Bearer ${secret}`) return true;

  // Method 2: Manual trigger — ?secret=<secret>
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('secret') === secret) return true;
  } catch {}

  // Method 3: Legacy custom header
  if (request.headers.get('x-cron-secret') === secret) return true;

  return false;
}

// ── API Password Verification ─────────────────────────────────────────────────
export function verifyApiPassword(request) {
  const password = process.env.SITE_API_PASSWORD;
  if (!password) return false; // SECURE: no password = deny

  if (request.headers.get('authorization') === `Bearer ${password}`) return true;

  try {
    const url = new URL(request.url);
    if (url.searchParams.get('password') === password) return true;
  } catch {}

  return false;
}

// ── CORS Headers ──────────────────────────────────────────────────────────────
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
