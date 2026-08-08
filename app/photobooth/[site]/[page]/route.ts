import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, PB_SITE_COOKIE, PB_INTERNAL_HEADER, PB_INTERNAL_VALUE } from '../../../../lib/pbauth';
import { getSite } from '../../../../lib/sites';
import { esc } from '../../../../lib/pbpages';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// The published booths ARE the Cindy upload pages, re-branded per site at
// serve time. One source of truth: improve the booth once, every published
// site gets it.
const tplCache = new Map<string, { t: number; html: string }>();
async function template(origin: string, path: string): Promise<string | null> {
  const hit = tplCache.get(path);
  if (hit && Date.now() - hit.t < 5 * 60 * 1000) return hit.html;
  try {
    const r = await fetch(origin + path, {
      headers: { [PB_INTERNAL_HEADER]: PB_INTERNAL_VALUE },
      cache: 'no-store',
    });
    if (!r.ok) return null;
    const html = await r.text();
    tplCache.set(path, { t: Date.now(), html });
    return html;
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { site: string; page: string } }
) {
  const { site: slug, page } = params;
  const cfg = await getSite(slug);
  if (!cfg) return new NextResponse('Not found', { status: 404 });

  const authedSlug = await verifyToken(req.cookies.get(PB_SITE_COOKIE)?.value);
  if (authedSlug !== slug) {
    return NextResponse.redirect(new URL(`/photobooth/${slug}`, req.url));
  }

  const origin = req.nextUrl.origin;

  if (page === 'gallery') {
    let html = await template(origin, '/cindy-gallery/index.html');
    if (!html) return new NextResponse('Template unavailable', { status: 502 });
    html = html
      .replace('<title>Cindy&#x27;s Gallery</title>', `<title>${esc(cfg.title)} — Gallery</title>`)
      .replace("<title>Cindy's Gallery</title>", `<title>${esc(cfg.title)} — Gallery</title>`)
      .replace("CINDY'S <span>PHOTO GALLERY</span>", `${esc(cfg.title.toUpperCase())} <span>PHOTO GALLERY</span>`)
      .replace("fetch('/api/gallery?g=cindy'", `fetch('/api/gallery?g=site-${slug}'`)
      .replaceAll('href="/cindy"', `href="/photobooth/${slug}"`)
      .replace('href="/cindy-gallery/create"', `href="/photobooth/${slug}"`);
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  if (!cfg.themes.includes(page)) return new NextResponse('Not found', { status: 404 });

  let html = await template(origin, `/${page}/upload/index.html`);
  if (!html) return new NextResponse('Template unavailable', { status: 502 });
  html = html
    .replace(
      `<nav class="gnav"><a href="/cindy">&#8592; Cindy's Photo Booth</a></nav>`,
      `<nav class="gnav"><a href="/photobooth/${slug}">&#8592; ${esc(cfg.title)}</a></nav>`
    )
    .replace("body.gallery = 'cindy';", `body.gallery = 'cindy';\n    body.site = '${slug}';`)
    .replace('/api/gallery/upload?g=cindy', `/api/gallery/upload?g=site-${slug}`)
    .replaceAll('href="/cindy-gallery"', `href="/photobooth/${slug}/gallery"`)
    .replace('Made for Cindy', `Made for ${esc(cfg.title)}`);
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
