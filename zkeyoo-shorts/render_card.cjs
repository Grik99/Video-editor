// Renders the transparent 1080x1920 overlay (white "fake tweet" card) for one Short.
// Usage: node render_card.cjs spec.json
// spec: { top, comment, images:[path,...], focus:["50% 50%",...], zone:[y0,y1] (1080x1920 px),
//         out, brand:{name, handle, logo} }
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const W = 1080, H = 1920;
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
const fileUrl = (p) => 'file://' + path.resolve(p);

const imgs = (spec.images || []).map((p, i) => {
  const focus = (spec.focus && spec.focus[i]) || '50% 50%';
  return `<div class="ph"><img src="${fileUrl(p)}" style="object-position:${focus}"></div>`;
}).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;background:transparent;width:${W}px;height:${H}px;overflow:hidden}
  *{box-sizing:border-box}
  #card{position:absolute;left:50%;transform:translateX(-50%);width:${Math.round(W * 0.765)}px;background:#fff;
        border-radius:24px;box-shadow:0 10px 34px rgba(0,0,0,.22);padding:30px 34px 34px;
        font-family:'Inter','Noto Color Emoji',sans-serif;color:#0f1419;--s:1}
  .t{font-size:calc(33px*var(--s));line-height:1.36;font-weight:400;letter-spacing:-.15px;text-wrap:pretty;margin:0}
  #media{display:flex;gap:6px;margin-top:calc(24px*var(--s))}
  .ph{flex:1;overflow:hidden;background:#111}
  .ph img{width:100%;height:100%;object-fit:cover;display:block}
  #who{display:flex;align-items:center;gap:16px;margin-top:calc(28px*var(--s))}
  #who img{width:calc(80px*var(--s));height:calc(80px*var(--s));border-radius:50%;display:block}
  .nm{font-size:calc(33px*var(--s));font-weight:700;line-height:1.1}
  .hd{font-size:calc(25px*var(--s));color:#536471;line-height:1.2;margin-top:2px}
  #cm{margin-top:calc(20px*var(--s))}
</style></head><body>
<div id="card">
  ${spec.top ? `<p class="t" id="top">${esc(spec.top)}</p>` : ''}
  <div id="media">${imgs}</div>
  <div id="who"><img src="${fileUrl(spec.brand.logo)}"><div><div class="nm">${esc(spec.brand.name)}</div><div class="hd">${esc(spec.brand.handle)}</div></div></div>
  <p class="t" id="cm">${esc(spec.comment)}</p>
</div></body></html>`;

(async () => {
  const tmp = path.resolve(spec.out.replace(/\.png$/, '') + '.html');
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto('file://' + tmp);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
  const info = await page.evaluate(([z0, z1]) => {
    const card = document.getElementById('card');
    const media = document.getElementById('media');
    const phs = [...media.querySelectorAll('.ph')];
    const imgs = phs.map((p) => p.querySelector('img'));
    const zoneH = z1 - z0;
    const mw = media.clientWidth;
    // natural photo height: single photo keeps its ratio (clamped), two photos sit side by side
    let ratio;
    if (imgs.length === 1) ratio = imgs[0].naturalWidth / imgs[0].naturalHeight;
    else ratio = imgs.reduce((a, i) => a + i.naturalWidth / i.naturalHeight, 0) / imgs.length * imgs.length;
    ratio = Math.min(Math.max(ratio, 0.95), 2.2);
    let mh = Math.round(mw / ratio);
    const minH = Math.round(mw / 2.3);
    const setH = (h) => { media.style.height = h + 'px'; };
    setH(mh);
    let s = 1;
    let ch = card.offsetHeight;
    if (ch > zoneH) { mh = Math.max(minH, mh - (ch - zoneH)); setH(mh); ch = card.offsetHeight; }
    while (ch > zoneH && s > 0.8) { s -= 0.02; card.style.setProperty('--s', s); ch = card.offsetHeight; }
    const top = Math.round(z0 + Math.max(0, (zoneH - ch) / 2));
    card.style.top = top + 'px';
    return { cardH: ch, top, mediaH: mh, mediaW: mw, scale: s, fits: ch <= zoneH };
  }, spec.zone);
  await page.screenshot({ path: spec.out, omitBackground: true });
  await browser.close();
  fs.unlinkSync(tmp);
  console.log(JSON.stringify(info));
})().catch((e) => { console.error(e); process.exit(1); });
