import { NextResponse, NextRequest } from 'next/server';

const PASSWORD = process.env.SUPERHERO_PASSWORD || 'LA28';
const COOKIE = 'superhero_auth';

const THEMES = {
  hero:  { title: 'Super Hero', bg: '#1a2a5e 0%, #0b0b1a', fg: '#ffd23f', shadow: '#e63946', grad: '#e63946,#ffd23f', btnFg: '#1a1a2e' },
  anime: { title: 'Anime', bg: '#3a1a5e 0%, #120820', fg: '#ff9ecf', shadow: '#7b2cbf', grad: '#7b2cbf,#ff5fa2', btnFg: '#fff' },
  cyber: { title: 'Cyberpunk', bg: '#240f4a 0%, #050510', fg: '#00e5ff', shadow: '#ff2ec4', grad: '#ff2ec4,#00e5ff', btnFg: '#050510' },
  sports: { title: 'Sports', bg: '#0e3d20 0%, #06120a', fg: '#ffd23f', shadow: '#1b6b3a', grad: '#1b6b3a,#ffd23f', btnFg: '#06120a' },
  film: { title: 'Movie', bg: '#471019 0%, #140508', fg: '#ffd23f', shadow: '#8a1522', grad: '#8a1522,#ffd23f', btnFg: '#140508' },
};

const loginPage = (bad: boolean, t: (typeof THEMES)[keyof typeof THEMES]) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.title} Photo Booth</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { height:100%; background:radial-gradient(ellipse at 50% 30%, ${t.bg} 70%);
    font-family:'Segoe UI',system-ui,sans-serif; color:#fff; }
  body { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.4rem; padding:2rem; }
  h1 { font-size:clamp(1.8rem,6vw,3.5rem); font-weight:900; text-transform:uppercase; text-align:center;
    color:${t.fg}; text-shadow:3px 3px 0 ${t.shadow}; }
  form { display:flex; gap:.8rem; flex-wrap:wrap; justify-content:center; }
  input { font-size:1.4rem; padding:.9rem 1.2rem; border-radius:14px; border:3px solid ${t.fg};
    background:#14142a; color:#fff; text-align:center; letter-spacing:.2em; width:220px; outline:none; }
  button { font-size:1.3rem; font-weight:800; padding:.9rem 2rem; border-radius:14px; border:none;
    cursor:pointer; background:linear-gradient(90deg,${t.grad}); color:${t.btnFg}; }
  .bad { color:#ff8fa0; font-weight:700; ${bad ? '' : 'display:none;'} }
</style>
</head>
<body>
  <h1>${t.title}<br>Photo Booth</h1>
  <p class="bad">Wrong password, try again.</p>
  <form method="GET">
    <input name="pw" type="password" placeholder="Password" autofocus autocomplete="off">
    <button type="submit">Enter</button>
  </form>
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

  const theme = pathname.startsWith('/anime') ? THEMES.anime
    : pathname.startsWith('/cyberpunk') ? THEMES.cyber
    : pathname.startsWith('/sports') ? THEMES.sports
    : pathname.startsWith('/film') ? THEMES.film
    : THEMES.hero;
  return new NextResponse(loginPage(pw !== null, theme), {
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
  ],
};
