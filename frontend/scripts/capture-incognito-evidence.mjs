import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { preview } from 'vite';

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(frontend, '..');
const destination = path.join(root, 'docs/evidence');
const checkOnly = process.argv.includes('--check');
const viewport = { width: 1440, height: 1000 };
const sha = data => createHash('sha256').update(data).digest('hex');
const require = createRequire(import.meta.url);
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
const walk = folder => fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(folder, entry.name); return entry.isDirectory() ? walk(file) : [file];
});
const files = [];
const pageErrors = [];
const dataRequests = [];
const blockedRequests = [];
let server;
let browser;
let channel;
assert.ok(fs.existsSync(path.join(frontend, 'dist/index.html')), 'Run pnpm build before capture.');
process.chdir(frontend);

try {
  server = await preview({ root: frontend, logLevel: 'error', preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const sourceUrl = `http://127.0.0.1:${server.httpServer.address().port}/`;
  const failures = [];
  for (const candidate of process.env.PLAYWRIGHT_CHANNEL ? [process.env.PLAYWRIGHT_CHANNEL] : [undefined, 'chrome', 'msedge']) {
    try { browser = await chromium.launch({ headless: true, channel: candidate }); channel = candidate ?? 'bundled'; break; }
    catch (error) { failures.push(error.message); }
  }
  assert.ok(browser, `Install Chromium: pnpm --filter frontend exec playwright install chromium\n${failures.join('\n')}`);
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, serviceWorkers: 'block' });
  await context.route('**/*', route => {
    const request = route.request();
    if (!request.url().startsWith(sourceUrl) || !['GET', 'HEAD'].includes(request.method())) {
      blockedRequests.push(`${request.method()} ${request.url()}`); return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => { if (['fetch', 'xhr'].includes(request.resourceType())) dataRequests.push(request.url()); });
  await page.goto(sourceUrl, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Incognito mode,/ }).waitFor();
  const toggle = page.getByRole('switch', { name: 'Incognito mode' });
  assert.equal(await toggle.getAttribute('aria-checked'), 'false');

  async function honestLayout() {
    const body = await page.locator('body').innerText();
    assert.match(body, /SIMULATED/);
    assert.match(body, /Amounts and sender inputs are NOT hidden/);
    assert.match(body, /Not deployment evidence/i);
    assert.doesNotMatch(body, /\b(?:mixer|pool|nullifier|Privacy Core|100\s*CT)\b/i);
    assert.doesNotMatch(body, /(?:transaction hash|tx hash|confirmations?|block height)\s*[:=]\s*(?:0x|\d)/i);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `Horizontal overflow: ${overflow}`);
  }
  async function capture(name, description) {
    await honestLayout();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    const png = await page.screenshot({ type: 'png', fullPage: true });
    assert.equal(png.readUInt32BE(16), viewport.width);
    files.push({ name, description, capturedAtUtc: new Date().toISOString(), sourceUrl, source: 'Local Vite preview of actual application', viewport,
      dimensions: { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }, sha256: sha(png), bytes: png.length, png });
  }

  await capture('incognito-overview.png', 'Incognito toggle OFF: normal CCC send, scope banner and disclosure panel. SIMULATED target flow.');
  // Normal mode still constructs an actual unsigned CCC output.
  await page.getByRole('button', { name: 'Build transaction preview' }).click();
  await page.getByTestId('transaction-preview').waitFor();
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-checked'), 'true');
  assert.equal(await page.getByTestId('transaction-preview').count(), 0);
  await page.getByLabel('Recipient stealth meta-address').fill('not-a-meta-address');
  await page.getByRole('button', { name: 'Derive one-time address' }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByTestId('derived-payment').count(), 0);
  await page.getByRole('button', { name: 'Use demo recipient' }).click();
  await page.getByRole('button', { name: 'Derive one-time address' }).click();
  const firstAddress = await page.getByTestId('one-time-address').innerText();
  assert.match(firstAddress, /^ckt1[a-z0-9]+$/);
  assert.match(await page.getByTestId('ephemeral-public-key').innerText(), /^0x0[23][0-9a-f]{64}$/);
  await page.getByRole('button', { name: 'Derive one-time address' }).click();
  assert.notEqual(await page.getByTestId('one-time-address').innerText(), firstAddress);
  await page.getByRole('button', { name: 'Build transaction preview' }).click();
  await page.getByTestId('fresh-change').waitFor();
  assert.ok(!(await page.getByTestId('fresh-change').innerText()).includes(await page.getByTestId('one-time-address').innerText()));
  await capture('incognito-send.png', 'Incognito ON: locally derived one-time address and ephemeral public key, actual unsigned CCC output, SIMULATED completion/signing and fresh change.');
  await page.getByLabel(/^Amount/).fill('201');
  assert.equal(await page.getByTestId('transaction-preview').count(), 0);
  assert.equal(await page.getByTestId('derived-payment').count(), 0);

  await page.getByRole('button', { name: 'Scan & receive', exact: true }).click();
  await page.getByLabel('Demo view key').fill(`0x${'0'.repeat(63)}4`);
  await page.getByRole('button', { name: 'Scan fixture payments' }).click();
  assert.match(await page.getByTestId('scan-results').innerText(), /0 payments detected/);
  await page.getByRole('button', { name: 'Use demo key' }).click();
  await page.getByRole('button', { name: 'Scan fixture payments' }).click();
  const incoming = await page.getByTestId('scan-results').innerText();
  assert.match(incoming, /1 payment detected/);
  assert.match(incoming, /1 unrelated or invalid output excluded/);
  assert.match(incoming, /LOCAL FIXTURE.*SIMULATED/);
  await capture('incognito-receive.png', 'View-key scan of two public local fixtures: one detected incoming payment, one nonmatching output, Spend simulation action. No chain scan.');
  await page.getByRole('button', { name: 'Spend simulation' }).click();
  await page.getByTestId('spend-preview').waitFor();
  assert.match(await page.getByTestId('spend-preview').innerText(), /fixture remains unspent/);
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await toggle.click();
  assert.match(await page.locator('.change-indicator').innerText(), /Enable incognito for fresh change/);
  await toggle.click();
  await page.getByRole('button', { name: 'Disclosure', exact: true }).click();
  assert.match(await page.getByTestId('disclosure-detail').innerText(), /NOT HIDDEN/);
  await capture('incognito-disclosure.png', 'Disclosure of recipient unlinkability limits: amounts, sender inputs, ephemeral key, timing/network exposure and fresh-change caveats. SIMULATED target flow.');

  // The same actual interface must remain usable at a small viewport.
  await page.setViewportSize({ width: 390, height: 844 });
  for (const name of ['Send', 'Scan & receive', 'Disclosure']) {
    await page.getByRole('button', { name, exact: true }).click();
    await honestLayout();
  }
  await page.getByRole('button', { name: 'Reset demo' }).click();
  assert.equal(await toggle.getAttribute('aria-checked'), 'false');
  assert.equal(await page.getByTestId('derived-payment').count(), 0);
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(dataRequests, [], 'The simulation must make no RPC, indexer or service request.');
  assert.deepEqual(blockedRequests, [], 'The demo must not attempt any external/write request.');

  if (!checkOnly) {
    const inputs = [...walk(path.join(frontend, 'src')), ...walk(path.join(root, 'packages/stealth/src')), ...walk(path.join(frontend, 'dist')),
      path.join(frontend, 'package.json'), path.join(root, 'packages/stealth/package.json'), path.join(frontend, 'vite.config.ts'), path.join(root, 'pnpm-lock.yaml'), fileURLToPath(import.meta.url)];
    const sourceFingerprint = inputs.sort().map(file => ({ file: path.relative(root, file).replaceAll(path.sep, '/'), sha256: sha(fs.readFileSync(file)) }));
    const manifest = { schema: 'ccc-incognito-evidence-v1', capturedAtUtc: new Date().toISOString(), command: 'pnpm capture:evidence',
      baseCommit: git('rev-parse', 'HEAD'), workingTree: git('status', '--porcelain') ? 'dirty' : 'clean',
      sourceFingerprint, sourceFingerprintSha256: sha(JSON.stringify(sourceFingerprint)),
      browser: { channel, version: browser.version() }, playwright: require('playwright/package.json').version, node: process.version,
      sourceUrl, viewport, deviceScaleFactor: 1, simulation: true, pageErrors, dataRequests, blockedRequests,
      walletConnected: false, signatures: 0, broadcasts: 0, chainEvidence: 'None. Local fixtures only.',
      captureIntegrity: 'Actual UI controls, no page mocks, DOM replacement, fake chain identifiers or edited pixels.',
      files: files.map(({ png, ...record }) => record),
    };
    fs.mkdirSync(destination, { recursive: true });
    const existing = ['incognito-manifest.json', ...files.map(f => f.name)].filter(name => fs.existsSync(path.join(destination, name)));
    if (existing.length) {
      const archive = path.join(destination, 'history', `incognito-${new Date().toISOString().replaceAll(/[:.]/g, '-')}`);
      fs.mkdirSync(archive, { recursive: true });
      for (const name of existing) fs.copyFileSync(path.join(destination, name), path.join(archive, name), fs.constants.COPYFILE_EXCL);
    }
    for (const file of files) fs.writeFileSync(path.join(destination, file.name), file.png);
    fs.writeFileSync(path.join(destination, 'incognito-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    const diagram = json(path.join(root, 'docs/diagrams/ccc-incognito-architecture.json'));
    assert.equal(sha(fs.readFileSync(path.join(root, 'docs/diagrams', diagram.file))), diagram.sha256);
    const rows = files.map((f, i) => `| ${i + 2} | [${f.name}](${f.name}) — ${f.description} | ${f.capturedAtUtc} | ${f.sourceUrl} | 1440 × 1000 → ${f.dimensions.width} × ${f.dimensions.height} | \`${f.sha256}\` |`);
    const catalog = `# CCC incognito demo evidence\n\nThese are genuine screenshots of the running local CCC stealth-address demo. All funding, chain scanning, transaction completion, signing and settlement are **SIMULATED**. Local ECDH derivation, view-key matching and unsigned CCC output construction are real computations. No wallet is connected and no transaction is signed or submitted. Public fixture keys must never receive assets.\n\nAmounts and sender inputs are **not hidden**. Receiver unlinkability and fresh change do not defeat timing, network, amount or transaction-graph correlation.\n\n## Figure catalog\n\n| Figure | File and meaning | Capture / generation time (UTC) | Source | Viewport → PNG pixels | SHA-256 |\n|---|---|---|---|---|---|\n| 1 | [Architecture](../diagrams/${diagram.file}) — authored target design, not deployment evidence | ${diagram.generatedAtUtc} | [SVG](../diagrams/${diagram.source}) | 1600 × 1100 | \`${diagram.sha256}\` |\n${rows.join('\n')}\n\n## Reproduce\n\n\`\`\`sh\npnpm install --frozen-lockfile\npnpm build\nnode frontend/scripts/export-incognito-architecture.mjs\nnode frontend/scripts/capture-incognito-evidence.mjs\n\`\`\`\n\nThe [Playwright script](../../frontend/scripts/capture-incognito-evidence.mjs) starts and closes its own Vite preview server. It uses real UI controls, checks malformed inputs, mode switching, fresh addresses, nonmatching scan keys, spend simulation and 390px layout. \`--check\` runs the same assertions without replacing evidence. External/write requests are blocked and any attempt fails verification. Captures are taken at 1440 × 1000; full-page PNG heights vary. Nothing is injected into the UI or edited into the PNGs.\n\n[Capture manifest](incognito-manifest.json) records the browser (${channel} ${browser.version()}), Playwright, Node, source URL, source/build fingerprints, base commit, dates, sizes and hashes. The base commit alone does not identify uncommitted source edits. Browser fonts and random one-time keys can change pixel hashes across runs. The dynamic localhost port is provenance, not a public service. [Diagram metadata](../diagrams/ccc-incognito-architecture.json) records authored artwork separately.\n\nThese artifacts establish interface behavior and local computations, not a verified deployment, live testnet lifecycle, audit, published package or accepted CCC contribution. Live lock-specific signing and indexer scanning remain pending. Funding terms are maintained in the local canonical proposal.\n\n## Prior evidence\n\nThe [pre-incognito catalog](pre-incognito-catalog.md) and its original images, hashes and dates are retained as historical records. They are not figures for the current proposal.\n`;
    fs.writeFileSync(path.join(destination, 'README.md'), catalog);
  }
  console.log(JSON.stringify({ status: 'passed', mode: checkOnly ? 'verification' : 'capture', screenshots: files.map(({ name, dimensions, sha256 }) => ({ name, dimensions, sha256 })), viewports: [viewport, { width: 390, height: 844 }], dataRequests: 0, broadcasts: 0, pageErrors }, null, 2));
  await context.close();
} finally {
  await browser?.close();
  if (server) await new Promise((resolve, reject) => { server.httpServer.close(error => error ? reject(error) : resolve()); server.httpServer.closeAllConnections?.(); });
}
