import { NextResponse, NextRequest } from 'next/server';

const PASSWORD = process.env.SUPERHERO_PASSWORD || 'LA28';
const CINDY_PASSWORD = process.env.CINDY_PASSWORD || 'cindychu';
const COOKIE = 'superhero_auth';
const CINDY_COOKIE = 'cindy_auth';

// The upload booths and Cindy's gallery live behind their own password.
// The shared /api/* routes accept either login.
function realm(pathname: string): 'cindy' | 'main' | 'api' {
  if (pathname === '/cindy-gallery' || pathname.startsWith('/cindy-gallery/')) return 'cindy';
  if (/^\/(superhero|anime|cyberpunk|sports|film)\/upload(\/|$)/.test(pathname)) return 'cindy';
  if (pathname.startsWith('/api/')) return 'api';
  return 'main';
}

const loginPage = (bad: boolean) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TVE + Growth GTM Ops Gallery</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { height:100%; background:#000; color:#fff;
    font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','San Francisco','Helvetica Neue',Arial,sans-serif;
    font-weight:500; }
  body { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.8rem; padding:2rem; }
  h1 { font-size:clamp(1.05rem,3.15vw,1.61rem); font-weight:500; text-align:center; letter-spacing:.01em; }
  form { display:flex; gap:.7rem; flex-wrap:wrap; justify-content:center; }
  input { font-size:1.15rem; font-weight:500; padding:.85rem 1.1rem; border-radius:10px; border:1px solid #ffffff45;
    background:#000; color:#fff; text-align:center; letter-spacing:.18em; width:220px; outline:none;
    font-family:inherit; }
  input::placeholder { color:#ffffff80; letter-spacing:normal; }
  input:focus { border-color:#fff; }
  button { font-size:1.05rem; font-weight:500; padding:.85rem 1.9rem; border-radius:10px; border:none;
    cursor:pointer; background:#fff; color:#000; font-family:inherit; }
  .bad { color:#fff; font-weight:500; ${bad ? '' : 'display:none;'} }
  footer { position:fixed; bottom:1.6rem; left:0; right:0; text-align:center; color:#ffffffa8;
    font-size:.95rem; font-weight:500; padding:0 1rem; }
</style>
</head>
<body>
  <h1>TVE + Growth GTM Ops Gallery</h1>
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
  const zone = realm(pathname);

  const hasMain = req.cookies.get(COOKIE)?.value === PASSWORD;
  const hasCindy = req.cookies.get(CINDY_COOKIE)?.value === CINDY_PASSWORD;

  const authorized =
    zone === 'api' ? hasMain || hasCindy : zone === 'cindy' ? hasCindy : hasMain;
  if (authorized) return NextResponse.next();

  const pw = searchParams.get('pw');
  const pwOk =
    zone === 'cindy' ? pw === CINDY_PASSWORD : pw === PASSWORD || pw === CINDY_PASSWORD;
  if (pw !== null && pwOk) {
    const url = req.nextUrl.clone();
    url.searchParams.delete('pw');
    const res = NextResponse.redirect(url);
    if (pw === CINDY_PASSWORD) {
      res.cookies.set(CINDY_COOKIE, CINDY_PASSWORD, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    } else {
      res.cookies.set(COOKIE, PASSWORD, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }
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
    '/cindy-gallery', '/cindy-gallery/:path*',
  ],
};
