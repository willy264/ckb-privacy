import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const folder = path.join(root, 'docs/diagrams');
const source = await fs.readFile(path.join(folder, 'ccc-incognito-architecture.svg'));
let browser;
const errors = [];
let channel;
for (const candidate of process.env.PLAYWRIGHT_CHANNEL ? [process.env.PLAYWRIGHT_CHANNEL] : ['chrome', undefined, 'msedge']) {
  try { browser = await chromium.launch({ headless: true, channel: candidate }); channel = candidate ?? 'bundled'; break; }
  catch (error) { errors.push(error.message); }
}
assert.ok(browser, `Install Chromium using pnpm --filter frontend exec playwright install chromium. ${errors.join('\n')}`);
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });
  await page.route('**/*', route => route.abort());
  await page.setContent(`<html><head><meta charset="utf-8"><style>html,body{margin:0;background:white}svg{display:block}</style></head><body>${source.toString('utf8')}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => [...document.querySelectorAll('text')].filter(t => {
    const b = t.getBBox(); return b.x < 0 || b.y < 0 || b.x + b.width > 1600 || b.y + b.height > 1100;
  }).map(t => t.textContent));
  assert.deepEqual(overflow, []);
  const png = await page.screenshot({ type: 'png' });
  const sha = bytes => createHash('sha256').update(bytes).digest('hex');
  await fs.writeFile(path.join(folder, 'ccc-incognito-architecture.png'), png);
  await fs.writeFile(path.join(folder, 'ccc-incognito-architecture.json'), JSON.stringify({
    classification: 'Target architecture, not deployment evidence', generatedAtUtc: new Date().toISOString(),
    command: 'node frontend/scripts/export-incognito-architecture.mjs', browser: { channel, version: browser.version() },
    source: 'ccc-incognito-architecture.svg', sourceSha256: sha(source),
    file: 'ccc-incognito-architecture.png', sha256: sha(png), width: 1600, height: 1100,
  }, null, 2) + '\n');
  console.log('Exported incognito architecture: 1600 x 1100, white background, hashes recorded.');
} finally { await browser.close(); }
