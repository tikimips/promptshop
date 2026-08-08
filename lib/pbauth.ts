// Shared auth for the photobooth publisher platform.
// Edge-safe (WebCrypto only) so both middleware and route handlers can use it.

const SECRET = process.env.PB_SECRET || 'pb-secret-7f3a9c2e51d84b6a90cd12';

// Lets our own server-side template fetches through the password middleware.
export const PB_INTERNAL_HEADER = 'x-pb-internal';
export const PB_INTERNAL_VALUE = 'pb-internal-3e91c44a71d2';

export const PB_SITE_COOKIE = 'pb_site';
export const PB_ADMIN_COOKIE = 'pb_admin';

async function hmac(msg: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function signToken(payload: string): Promise<string> {
  return payload + '.' + (await hmac(payload));
}

export async function verifyToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const i = token.lastIndexOf('.');
  if (i < 1) return null;
  const payload = token.slice(0, i);
  if ((await hmac(payload)) !== token.slice(i + 1)) return null;
  return payload;
}
