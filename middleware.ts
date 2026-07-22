import { NextResponse, NextRequest } from 'next/server';

const PASSWORD = process.env.SUPERHERO_PASSWORD || 'LA28';
const COOKIE = 'superhero_auth';

const loginPage = (bad: boolean) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Super Hero Photo Booth</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { height:100%; background:radial-gradient(ellipse at 50% 30%, #1a2a5e 0%, #0b0b1a 70%);
    font-family:'Segoe UI',system-ui,sans-serif; color:#fff; }
  body { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.4rem; padding:2rem; }
  h1 { font-size:clamp(1.8rem,6vw,3.5rem); font-weight:900; text-transform:uppercase; text-align:center;
    color:#ffd23f; text-shadow:3px 3px 0 #e63946; }
  form { display:flex; gap:.8rem; flex-wrap:wrap; justify-content:center; }
  input { font-size:1.4rem; padding:.9rem 1.2rem; border-radius:14px; border:3px solid #ffd23f;
    background:#14142a; color:#fff; text-align:center; letter-spacing:.2em; width:220px; outline:none; }
  button { font-size:1.3rem; font-weight:800; padding:.9rem 2rem; border-radius:14px; border:none;
    cursor:pointer; background:linear-gradient(90deg,#e63946,#ffd23f); color:#1a1a2e; }
  .bad { color:#ff8fa0; font-weight:700; ${bad ? '' : 'display:none;'} }
</style>
</head>
<body>
  <h1>Super Hero<br>Photo Booth</h1>
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

  return new NextResponse(loginPage(pw !== null), {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export const config = {
  matcher: ['/superhero', '/superhero/:path*', '/api/superhero', '/api/superhero/:path*'],
};
