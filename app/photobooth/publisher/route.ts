import { NextRequest, NextResponse } from 'next/server';
import { signToken, verifyToken, PB_ADMIN_COOKIE } from '../../../lib/pbauth';
import { loginPage } from '../../../lib/pbpages';

export const dynamic = 'force-dynamic';

const PUBLISHER_PASSWORD = process.env.PUBLISHER_PASSWORD || 'publishpass';

const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Photobooth Publisher</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #0b0b12; color: #fff; min-height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'San Francisco', 'Helvetica Neue', Arial, sans-serif;
    font-weight: 500; line-height: 1.5; }
  .wrap { max-width: 620px; margin: 0 auto; padding: 2.5rem 1.2rem 4rem; }
  h1 { font-size: clamp(1.2rem, 4vw, 1.6rem); font-weight: 600; }
  p.sub { color: #8b8b9e; margin: .3rem 0 1.8rem; font-size: .95rem; }
  h2 { font-size: 1.02rem; font-weight: 600; margin: 1.6rem 0 .5rem; }
  label { display: block; color: #8b8b9e; font-size: .88rem; margin: 1rem 0 .3rem; }
  input[type=text], input[type=password] { width: 100%; background: #14141c; border: 1px solid #ffffff22; border-radius: 12px;
    padding: .85rem 1rem; color: #fff; font-family: inherit; font-size: 1rem; font-weight: 500; outline: none; }
  input:focus { border-color: #ffffff66; }
  .slugrow { display: flex; align-items: center; gap: .5rem; }
  .slugrow span { color: #8b8b9e; font-size: .9rem; white-space: nowrap; }
  .themes { display: flex; gap: .6rem; flex-wrap: wrap; margin-top: .3rem; }
  .themes label { display: flex; align-items: center; gap: .45rem; background: #14141c; border: 1px solid #ffffff22;
    border-radius: 999px; padding: .55rem 1rem; cursor: pointer; color: #fff; font-size: .95rem; margin: 0; }
  .themes input { accent-color: #fff; }
  .go { display: block; width: 100%; margin-top: 1.6rem; background: #fff; color: #000; border: none; border-radius: 999px;
    padding: 1rem; font-family: inherit; font-weight: 600; font-size: 1.05rem; cursor: pointer; }
  .go:disabled { opacity: .4; }
  #msg { margin-top: .9rem; font-size: .95rem; min-height: 1.3em; }
  #msg.err { color: #ff8a96; } #msg.ok { color: #7ee2a0; }
  .site { background: #14141c; border: 1px solid #ffffff22; border-radius: 14px; padding: .9rem 1.1rem; margin-top: .8rem;
    display: flex; align-items: center; justify-content: space-between; gap: .8rem; flex-wrap: wrap; }
  .site .meta { min-width: 0; }
  .site .t { font-weight: 600; }
  .site .u { color: #8b8b9e; font-size: .88rem; overflow-wrap: anywhere; }
  .site .u a { color: #8b8b9e; }
  .site .acts { display: flex; gap: .5rem; flex: 0 0 auto; }
  .site button { background: #ffffff18; color: #fff; border: none; border-radius: 999px; padding: .5rem 1rem;
    font-family: inherit; font-weight: 500; font-size: .9rem; cursor: pointer; }
  .site button.del { color: #ff8a96; }
  footer { text-align: center; color: #8b8b9e; font-size: .9rem; line-height: 1.6; font-weight: 500; padding: 2.5rem 1rem 1rem; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Photobooth Publisher</h1>
  <p class="sub">Publish a bespoke upload photobooth: its own URL, title, password, themes and gallery. Walk-up camera booths come in phase two.</p>

  <h2>New / edit site</h2>
  <label for="title">Site title</label>
  <input type="text" id="title" maxlength="60" placeholder="e.g. Chu Family Photo Booth">
  <label for="slug">URL</label>
  <div class="slugrow"><span>promptshop.ai/photobooth/</span><input type="text" id="slug" maxlength="32" placeholder="chu-family"></div>
  <label for="pw">Visitor password</label>
  <input type="text" id="pw" maxlength="40" placeholder="e.g. chufam26">
  <label>Themes</label>
  <div class="themes">
    <label><input type="checkbox" value="sports" checked> ⚾ Sports</label>
    <label><input type="checkbox" value="film" checked> 🎬 Film</label>
    <label><input type="checkbox" value="superhero" checked> 🦸 Superhero</label>
    <label><input type="checkbox" value="anime" checked> 🌸 Anime</label>
  </div>
  <button class="go" id="pub">Publish</button>
  <div id="msg"></div>

  <h2 style="margin-top:2.4rem">Published sites</h2>
  <div id="list"><p style="color:#8b8b9e">Loading…</p></div>

  <footer>Slack Mike Macadaan if anything breaks here</footer>
</div>
<script>
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var msg = $('msg');
  function say(t, ok) { msg.textContent = t; msg.className = ok ? 'ok' : 'err'; }

  $('slug').addEventListener('input', function () {
    this.value = this.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
  });

  function themes() {
    return Array.prototype.filter.call(document.querySelectorAll('.themes input'), function (c) { return c.checked; })
      .map(function (c) { return c.value; });
  }

  $('pub').addEventListener('click', function () {
    say('', true);
    $('pub').disabled = true;
    fetch('/api/photobooth/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: $('title').value, slug: $('slug').value, password: $('pw').value, themes: themes() })
    }).then(function (r) { return r.json(); }).then(function (j) {
      $('pub').disabled = false;
      if (j && j.ok) { say('Published — live at promptshop.ai' + j.url, true); load(); }
      else say((j && j.error) || 'Publish failed', false);
    }).catch(function () { $('pub').disabled = false; say('Publish failed', false); });
  });

  var armed = null;
  function load() {
    fetch('/api/photobooth/sites').then(function (r) { return r.json(); }).then(function (j) {
      var list = $('list');
      list.innerHTML = '';
      var sites = (j && j.sites) || [];
      if (!sites.length) { list.innerHTML = '<p style="color:#8b8b9e">Nothing published yet.</p>'; return; }
      sites.forEach(function (s) {
        var d = document.createElement('div');
        d.className = 'site';
        d.innerHTML = '<div class="meta"><div class="t"></div><div class="u"><a target="_blank"></a> · pw: <span class="p"></span> · <span class="th"></span></div></div>' +
          '<div class="acts"><button class="edit">Edit</button><button class="del">Unpublish</button></div>';
        d.querySelector('.t').textContent = s.title;
        var a = d.querySelector('a');
        a.textContent = 'promptshop.ai/photobooth/' + s.slug;
        a.href = '/photobooth/' + s.slug;
        d.querySelector('.p').textContent = s.password;
        d.querySelector('.th').textContent = s.themes.join(', ');
        d.querySelector('.edit').addEventListener('click', function () {
          $('title').value = s.title; $('slug').value = s.slug; $('pw').value = s.password;
          document.querySelectorAll('.themes input').forEach(function (c) { c.checked = s.themes.indexOf(c.value) >= 0; });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        var del = d.querySelector('.del');
        del.addEventListener('click', function () {
          if (armed !== s.slug) {
            armed = s.slug;
            del.textContent = 'Really unpublish?';
            setTimeout(function () { if (armed === s.slug) { armed = null; del.textContent = 'Unpublish'; } }, 3500);
            return;
          }
          armed = null;
          fetch('/api/photobooth/sites', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: s.slug })
          }).then(function () { load(); });
        });
        list.appendChild(d);
      });
    });
  }
  load();
})();
</script>
</body>
</html>`;

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const pw = url.searchParams.get('pw');
  if (pw !== null && pw === PUBLISHER_PASSWORD) {
    const clean = url.clone();
    clean.searchParams.delete('pw');
    const res = NextResponse.redirect(clean);
    res.cookies.set(PB_ADMIN_COOKIE, await signToken('admin'), {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return res;
  }
  const authed = (await verifyToken(req.cookies.get(PB_ADMIN_COOKIE)?.value)) === 'admin';
  if (!authed) {
    return new NextResponse(loginPage('Photobooth Publisher', pw !== null), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  return new NextResponse(PAGE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
