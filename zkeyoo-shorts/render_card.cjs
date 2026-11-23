// Renders the transparent 1080x1920 overlay (white "fake tweet" card) for one Short.
// Usage: node render_card.cjs spec.json
// spec: { top, comment, images:[path,...], focus:["50% 50%",...], layout, zone:[y0,y1] (1080x1920 px), xzone:[x0,x1] optional,
//         out, brand:{name, handle, logo} }
// layouts: single | lr (left/right) | tb (top/bottom) | row3 | t1b2 (1 top, 2 bottom) | l1r2 (1 left, 2 right)
//          | 2x2 | l2r3 (2 left, 3 right) ; default: single for 1 image, lr for 2, t1b2 for 3, 2x2 for 4, l2r3 for 5
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const W = 1080, H = 1920, GAP = 6;
// typographic quotes, then glue the last 2 words of every paragraph (no orphan word/emoji on the last line)
const pretty = (s) => String(s || '')
  .replace(/"([^"\n]*)"/g, '“$1”').replace(/(\w)'(\w)/g, '$1’$2').replace(/(^|\s)'/g, '$1‘').replace(/'/g, '’').replace(/(\w)-(\w)/g, '$1\u2011$2')
  .split('\n').map((p) => {
    const w = p.split(' ');
    const k = w.length >= 6 ? 3 : w.length >= 3 ? 2 : 1; // how many trailing tokens stay together
    return w.slice(0, w.length - k).concat(w.slice(-k).join(' ')).join(' ');
  }).join('\n');
const esc = (s) => pretty(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
const fileUrl = (p) => 'file://' + path.resolve(p);
const n = (spec.images || []).length;
const layout = spec.layout || ({ 0: 'none', 1: 'single', 2: 'lr', 3: 't1b2', 4: '2x2', 5: 'l2r3' }[n] || 'single');

// grid templates: areas a,b,c,d,e map to images[0..4]
const GRIDS = {
  single: { areas: ['a'], cols: '1fr', rows: '1fr' },
  lr: { areas: ['a b'], cols: '1fr 1fr', rows: '1fr' },
  tb: { areas: ['a', 'b'], cols: '1fr', rows: '1fr 1fr' },
  row3: { areas: ['a b c'], cols: '1fr 1fr 1fr', rows: '1fr' },
  t1b2: { areas: ['a a', 'b c'], cols: '1fr 1fr', rows: '1.25fr 1fr' },
  l1r2: { areas: ['a b', 'a c'], cols: '1.15fr 1fr', rows: '1fr 1fr' },
  '2x2': { areas: ['a b', 'c d'], cols: '1fr 1fr', rows: '1fr 1fr' },
  l2r3: { areas: ['a c', 'a d', 'b d', 'b e'], cols: '1fr 1fr', rows: '1fr 1fr 1fr 1fr' },
};
const g = GRIDS[layout];
if (layout !== 'none' && !g) throw new Error('unknown layout ' + layout);
const letters = 'abcde';
const cells = (spec.images || []).map((p, i) => {
  const focus = (spec.focus && spec.focus[i]) || '50% 50%';
  return `<div class="ph" style="grid-area:${letters[i]}"><img src="${fileUrl(p)}" style="object-position:${focus}"></div>`;
}).join('');
// l2r3 uses a 4-row grid where e.g. 'd' spans the middle: rebuild it as 2 left x 3 right with 6 rows
if (layout === 'l2r3') {
  g.areas = ['a c', 'a c', 'a d', 'b d', 'b e', 'b e'];
  g.rows = 'repeat(6, 1fr)';
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;background:transparent;width:${W}px;height:${H}px;overflow:hidden}
  *{box-sizing:border-box}
  #card{position:absolute;left:50%;transform:translateX(-50%);width:${Math.round(W * 0.765)}px;background:#fff;
        border-radius:24px;box-shadow:0 10px 34px rgba(0,0,0,.22);padding:30px 34px 34px;
        font-family:'Inter','Noto Color Emoji',sans-serif;color:#0f1419;--s:1}
  ${spec.xzone ? `#card{left:${spec.xzone[0]}px;transform:none;width:${spec.xzone[1] - spec.xzone[0]}px}` : ''}
  .t{font-size:calc(33px*var(--s));line-height:1.36;font-weight:400;letter-spacing:-.15px;text-wrap:pretty;margin:0}
  #media{display:grid;gap:${GAP}px;margin-top:calc(24px*var(--s));
         ${g ? `grid-template-areas:${g.areas.map((r) => `'${r}'`).join(' ')};grid-template-columns:${g.cols};grid-template-rows:${g.rows};` : 'display:none;'}}
  .ph{overflow:hidden;background:#111;min-height:0;min-width:0}
  .ph img{width:100%;height:100%;object-fit:cover;display:block}
  #who{display:flex;align-items:center;gap:16px;margin-top:calc(28px*var(--s))}
  #who img{width:calc(80px*var(--s));height:calc(80px*var(--s));border-radius:50%;display:block}
  .nm{font-size:calc(33px*var(--s));font-weight:700;line-height:1.1}
  .hd{font-size:calc(25px*var(--s));color:#536471;line-height:1.2;margin-top:2px}
  #cm{margin-top:calc(20px*var(--s))}
  #rb{display:inline-block;color:#fff;font-weight:800;font-size:calc(21px*var(--s));letter-spacing:1.2px;
      padding:7px 14px 6px;border-radius:9px;margin-bottom:calc(16px*var(--s));line-height:1.1}
</style></head><body>
<div id="card">
  ${spec.rubric ? `<div id="rb" style="background:${spec.rubric.color}">${esc(spec.rubric.name)}</div>` : ''}
  ${spec.top ? `<p class="t" id="top">${esc(spec.top)}</p>` : ''}
  <div id="media">${cells}</div>
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
  const info = await page.evaluate(([z0, z1, layout, GAP]) => {
    const card = document.getElementById('card');
    const media = document.getElementById('media');
    const imgs = [...media.querySelectorAll('img')];
    const zoneH = z1 - z0;
    const mw = media.clientWidth;
    const ar = imgs.map((i) => i.naturalWidth / i.naturalHeight);
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
    const half = (mw - GAP) / 2, third = (mw - 2 * GAP) / 3;
    const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    let mh = 0; // natural media height for the layout
    if (layout === 'single') mh = mw / clamp(ar[0], 0.8, 2.2);
    else if (layout === 'lr') mh = half / clamp(avg(ar), 0.6, 1.6);
    else if (layout === 'tb') mh = ar.reduce((s, a) => s + mw / clamp(a, 1.3, 2.2), 0) + GAP;
    else if (layout === 'row3') mh = third / clamp(avg(ar), 0.5, 1.3);
    else if (layout === 't1b2') mh = mw / clamp(ar[0], 1.3, 2.0) + GAP + half / clamp(avg(ar.slice(1)), 0.8, 1.4);
    else if (layout === 'l1r2') mh = mw / 1.25;
    else if (layout === '2x2') mh = 2 * (half / clamp(avg(ar), 0.8, 1.5)) + GAP;
    else if (layout === 'l2r3') mh = mw / 0.95;
    mh = Math.round(mh);
    const minH = Math.round(mh * 0.55);
    const setH = (h) => { media.style.height = h + 'px'; };
    if (layout !== 'none') setH(mh);
    let s = 1;
    let ch = card.offsetHeight;
    if (ch > zoneH && layout !== 'none') { mh = Math.max(minH, mh - (ch - zoneH)); setH(mh); ch = card.offsetHeight; }
    while (ch > zoneH && s > 0.8) { s -= 0.02; card.style.setProperty('--s', s); ch = card.offsetHeight; }
    const top = Math.round(z0 + Math.max(0, (zoneH - ch) / 2));
    card.style.top = top + 'px';
    return { layout, cardH: ch, top, mediaH: mh, mediaW: mw, scale: +s.toFixed(2), fits: ch <= zoneH };
  }, [spec.zone[0], spec.zone[1], layout, GAP]);
  await page.screenshot({ path: spec.out, omitBackground: true });
  await browser.close();
  fs.unlinkSync(tmp);
  console.log(JSON.stringify(info));
})().catch((e) => { console.error(e); process.exit(1); });
