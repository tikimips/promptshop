import { NextRequest, NextResponse } from 'next/server';
import { signToken, verifyToken, PB_SITE_COOKIE } from '../../../lib/pbauth';
import { getSite } from '../../../lib/sites';
import { loginPage, siteIndexPage } from '../../../lib/pbpages';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { site: string } }) {
  const slug = params.site;
  const cfg = await getSite(slug);
  if (!cfg) return new NextResponse('Not found', { status: 404 });

  const url = req.nextUrl;
  const pw = url.searchParams.get('pw');
  if (pw !== null && pw === cfg.password) {
    const clean = url.clone();
    clean.searchParams.delete('pw');
    const res = NextResponse.redirect(clean);
    res.cookies.set(PB_SITE_COOKIE, await signToken(slug), {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return res;
  }

  const authedSlug = await verifyToken(req.cookies.get(PB_SITE_COOKIE)?.value);
  if (authedSlug !== slug) {
    return new NextResponse(loginPage(cfg.title, pw !== null), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  return new NextResponse(siteIndexPage(slug, cfg.title, cfg.themes), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
