// Shared HTML for the publisher platform: login screen and site index.

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function loginPage(title: string, bad: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { height:100%; background:#000; color:#fff;
    font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','San Francisco','Helvetica Neue',Arial,sans-serif;
    font-weight:500; }
  body { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.8rem; padding:2rem; }
  h1 { font-size:clamp(1.05rem,3.15vw,1.61rem); font-weight:500; text-align:center; letter-spacing:.01em; }
  form { display:flex; gap:.7rem; flex-wrap:wrap; justify-content:center; }
  input { font-size:1.15rem; font-weight:500; padding:.85rem 1.1rem; border-radius:10px; border:1px solid #ffffff45;
    background:#000; color:#fff; text-align:center; letter-spacing:.18em; width:220px; outline:none; font-family:inherit; }
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
  <h1>${esc(title)}</h1>
  <p class="bad">Wrong password, try again.</p>
  <form method="GET">
    <input name="pw" type="password" placeholder="Password" autofocus autocomplete="off">
    <button type="submit">Enter</button>
  </form>
  <footer>Slack Mike Macadaan if anything breaks here</footer>
</body>
</html>`;
}

const THEME_META: Record<string, { emoji: string; name: string }> = {
  sports: { emoji: '⚾', name: 'Sports' },
  film: { emoji: '🎬', name: 'Film' },
  superhero: { emoji: '🦸', name: 'Superhero' },
  anime: { emoji: '🌸', name: 'Anime' },
};

export function siteIndexPage(slug: string, title: string, themes: string[]): string {
  const cards = themes
    .filter((t) => THEME_META[t])
    .map(
      (t) =>
        `  <a class="b" href="/photobooth/${slug}/${t}"><span class="e">${THEME_META[t].emoji}</span> ${THEME_META[t].name}</a>`
    )
    .join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #0b0b12; color: #fff; min-height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'San Francisco', 'Helvetica Neue', Arial, sans-serif;
    font-weight: 500; line-height: 1.5; }
  .wrap { max-width: 480px; margin: 0 auto; padding: 3rem 1.2rem 4rem; }
  h1 { font-size: clamp(1.2rem, 4vw, 1.5rem); font-weight: 600; }
  p.sub { color: #8b8b9e; margin: .3rem 0 1.6rem; font-size: .98rem; }
  a.b { display: flex; align-items: center; gap: .9rem; background: #14141c; border: 1px solid #ffffff22;
    border-radius: 14px; padding: 1rem 1.2rem; color: #fff; text-decoration: none; font-size: 1.05rem; margin-top: .8rem; }
  a.b:active { background: #1d1d28; }
  a.b span.e { font-size: 1.4rem; }
  a.b.gal { background: #ffffff; color: #000; font-weight: 600; margin-top: 1.6rem; }
  footer { text-align: center; color: #8b8b9e; font-size: .9rem; line-height: 1.6; font-weight: 500; padding: 2.5rem 1rem 1rem; }
</style>
</head>
<body>
<div class="wrap">
  <h1>${esc(title)}</h1>
  <p class="sub">Upload a photo, pick a theme, get the shot.</p>
${cards}
  <a class="b gal" href="/photobooth/${slug}/gallery"><span class="e">🖼</span> The gallery</a>
  <footer>Made for ${esc(title)}</footer>
</div>
</body>
</html>`;
}
