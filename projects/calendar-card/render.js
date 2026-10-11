// calendar-card.html ko frame-by-frame PNG me render karta hai.
// Usage: node render.js <out_dir> [preview]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FPS = 30;

(async () => {
  const outDir = process.argv[2];
  const preview = process.argv[3] === 'preview';
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const url = 'file://' + path.resolve(__dirname, 'calendar-card.html') + '?static' + (preview ? '&preview' : '');
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);

  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.round(duration * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => window.renderAt(t), f / FPS);
    await page.screenshot({
      path: path.join(outDir, `f_${String(f).padStart(4, '0')}.png`),
      omitBackground: !preview,
    });
  }
  await browser.close();
  console.log(`${frames} frames -> ${outDir}`);
})();
