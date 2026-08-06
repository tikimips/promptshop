import { NextResponse, NextRequest } from 'next/server';

const PASSWORD = process.env.SUPERHERO_PASSWORD || 'LA28';
const COOKIE = 'superhero_auth';

const loginPage = (bad: boolean) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TVE GGO Photobooth Gallery</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { height:100%; background:#0b0b12; font-family:'Segoe UI',system-ui,sans-serif; color:#fff; }
  body { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.6rem; padding:2rem; }
  h1 { font-size:clamp(1.6rem,5vw,2.6rem); font-weight:800; text-align:center; }
  h1 span { color:#ffd23f; }
  form { display:flex; gap:.7rem; flex-wrap:wrap; justify-content:center; }
  input { font-size:1.3rem; padding:.85rem 1.1rem; border-radius:12px; border:1px solid #ffffff2e;
    background:#15151f; color:#fff; text-align:center; letter-spacing:.2em; width:220px; outline:none; }
  input:focus { border-color:#ffd23f; }
  button { font-size:1.15rem; font-weight:700; padding:.85rem 1.8rem; border-radius:12px; border:none;
    cursor:pointer; background:#ffd23f; color:#1a1a1a; }
  .bad { color:#ff8fa0; font-weight:600; ${bad ? '' : 'display:none;'} }
  footer { position:fixed; bottom:1.4rem; left:0; right:0; text-align:center; color:#8b8b9e; font-size:.95rem; padding:0 1rem; }
</style>
</head>
<body>
  <h1>TVE GGO <span>Photobooth Gallery</span></h1>
  <p class="bad">Wrong password, try again.</p>
  <form method="GET">
    <input name="pw" type="password" placeholder="Password" autofocus autocomplete="off">
    <button type="submit">Enter</button>
  </form>
  <footer>Slack Mike Macadaan if anything breaks here</footer>
</body>
</html>`;

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (req.cookies.get(COOKIE)?.value === PASSWORD) {
    return NextResponse.next();
  }

  const pw = searchParams.get('pw');
  if (pw === PASSWORD) {
    const url = req.nextUrl.clone();
    url.searchParams.delete('pw');
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE, PASSWORD, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return res;
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return new NextResponse(loginPage(pw !== null), {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export const config = {
  matcher: [
    '/superhero', '/superhero/:path*', '/api/superhero', '/api/superhero/:path*',
    '/anime', '/anime/:path*', '/api/anime', '/api/anime/:path*',
    '/cyberpunk', '/cyberpunk/:path*', '/api/cyberpunk', '/api/cyberpunk/:path*',
    '/sports', '/sports/:path*', '/api/sports', '/api/sports/:path*',
    '/film', '/film/:path*', '/api/film', '/api/film/:path*',
    '/architecture', '/architecture/:path*',
    '/tveggo-gallery-26', '/tveggo-gallery-26/:path*', '/api/gallery', '/api/gallery/:path*',
  ],
};
