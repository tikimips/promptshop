import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, PB_ADMIN_COOKIE } from '../../../../lib/pbauth';
import {
  listSites,
  saveSite,
  removeSite,
  SITE_SLUG_RE,
  RESERVED_SLUGS,
  AVAILABLE_THEMES,
  SiteConfig,
} from '../../../../lib/sites';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

async function isAdmin(req: NextRequest): Promise<boolean> {
  return (await verifyToken(req.cookies.get(PB_ADMIN_COOKIE)?.value)) === 'admin';
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({ sites: await listSites() });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let b: { slug?: string; title?: string; password?: string; themes?: string[] };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  const slug = String(b.slug || '').trim().toLowerCase();
  const title = String(b.title || '').trim();
  const password = String(b.password || '').trim();
  const themes = Array.isArray(b.themes) ? b.themes.filter((t) => AVAILABLE_THEMES.includes(t)) : [];
  if (!SITE_SLUG_RE.test(slug)) return NextResponse.json({ error: 'Slug must be 2–32 chars: lowercase letters, numbers, hyphens.' }, { status: 400 });
  if (RESERVED_SLUGS.includes(slug)) return NextResponse.json({ error: 'That slug is reserved.' }, { status: 400 });
  if (!title || title.length > 60) return NextResponse.json({ error: 'Title is required (max 60 chars).' }, { status: 400 });
  if (password.length < 3 || password.length > 40) return NextResponse.json({ error: 'Password must be 3–40 chars.' }, { status: 400 });
  if (!themes.length) return NextResponse.json({ error: 'Pick at least one theme.' }, { status: 400 });

  const cfg: SiteConfig = { slug, title, password, themes, product: 'upload', createdAt: Date.now() };
  await saveSite(cfg);
  return NextResponse.json({ ok: true, url: `/photobooth/${slug}` });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let b: { slug?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  const slug = String(b.slug || '');
  if (!SITE_SLUG_RE.test(slug)) return NextResponse.json({ error: 'bad slug' }, { status: 400 });
  await removeSite(slug);
  return NextResponse.json({ ok: true });
}
