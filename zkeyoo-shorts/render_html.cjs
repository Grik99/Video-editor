// Render an HTML file to PNG (used for original puzzle artwork). Usage: node render_html.cjs in.html out.png W H
const { chromium } = require('playwright');
(async () => {
  const [, , inp, out, W, H] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  await p.goto('file://' + require('path').resolve(inp));
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: out });
  await b.close();
})();
