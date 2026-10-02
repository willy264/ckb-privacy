import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { preview } from 'vite';

const demo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(demo, '../..');
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
assert.ok(fs.existsSync(path.join(demo, 'dist/index.html')), 'Run pnpm build before capture.');
process.chdir(demo);

try {
  server = await preview({ root: demo, logLevel: 'error', preview: { host: '127.0.0.1', port: 0, strictPort: true } });
  const sourceUrl = `http://127.0.0.1:${server.httpServer.address().port}/`;
  const failures = [];
  for (const candidate of process.env.PLAYWRIGHT_CHANNEL ? [process.env.PLAYWRIGHT_CHANNEL] : [undefined, 'chrome', 'msedge']) {
    try { browser = await chromium.launch({ headless: true, channel: candidate }); channel = candidate ?? 'bundled'; break; }
    catch (error) { failures.push(error.message); }
  }
  assert.ok(browser, `Install Chromium: pnpm --filter @ccc-incognito/demo exec playwright install chromium\n${failures.join('\n')}`);
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, serviceWorkers: 'block' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: sourceUrl });
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
  await page.getByTestId('ccc-app').waitFor();
  const toggle = page.getByRole('switch', { name: 'Incognito mode' });
  assert.equal(await toggle.getAttribute('aria-checked'), 'false');
  const normalIdentity = (await page.getByTestId('receiving-identity').innerText()).trim();
  assert.match(normalIdentity, /^ckt1[a-z0-9]+$/);

  async function honestLayout() {
    const body = await page.locator('body').innerText();
    assert.match(body, /SIMULATED/);
    assert.match(body, /Demo only\. Do not enter real private keys or send real assets\./);
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
  async function copyIdentity(expected) {
    await page.getByRole('button', { name: 'Copy receiving identity', exact: true }).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(copied, expected, 'Copy uses the actual Clipboard API and the active receiving identity.');
  }
  async function scanFixtures() {
    await page.getByRole('button', { name: 'Scan fixture payments', exact: true }).click();
    await page.getByRole('button', { name: /Checking fixture payments/ }).waitFor();
    await page.getByTestId('scan-results').waitFor();
  }
  async function deriveIfNeeded() {
    if (!(await page.getByTestId('derived-payment').count())) {
      await page.getByRole('button', { name: 'Derive one-time address', exact: true }).click();
    }
  }

  await capture('incognito-overview.png', 'Normal mode: adapted CCC demo shell, public demo account, reusable receiving address and normal send. SIMULATED account; no wallet connection.');
  await copyIdentity(normalIdentity);
  await page.getByRole('button', { name: 'Receive', exact: true }).click();
  await page.getByTestId('normal-receive').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Scan fixture payments', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Send', exact: true }).click();

  // Normal mode builds a genuine unsigned output, while rejecting invalid inputs.
  await page.getByLabel('Recipient CKB address', { exact: true }).fill('not-a-ckb-address');
  await page.getByRole('button', { name: 'Build transaction preview' }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByTestId('transaction-preview').count(), 0);
  await page.getByRole('button', { name: 'Use demo recipient' }).click();
  await page.getByLabel(/^Amount/).fill('0');
  await page.getByRole('button', { name: 'Build transaction preview' }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByTestId('transaction-preview').count(), 0);
  await page.getByLabel(/^Amount/).fill('200');
  await page.getByRole('button', { name: 'Build transaction preview' }).click();
  await page.getByTestId('transaction-preview').waitFor();
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-checked'), 'true');
  assert.equal(await page.getByTestId('transaction-preview').count(), 0);
  const stealthIdentity = (await page.getByTestId('receiving-identity').innerText()).trim();
  assert.match(stealthIdentity, /^0x[0-9a-f]{132}$/);
  assert.notEqual(stealthIdentity, normalIdentity);
  await capture('incognito-enabled.png', 'Incognito enabled inside the same CCC demo shell: a public stealth receiving identity replaces the reusable address. Prototype capability, not official upstream CCC functionality.');
  await copyIdentity(stealthIdentity);

  await page.getByRole('button', { name: 'Scan & receive', exact: true }).click();
  await page.getByLabel('Demo viewing profile', { exact: true }).waitFor();
  assert.equal(await page.getByTestId('scan-results').count(), 0);
  const viewingDetails = page.locator('details').filter({ has: page.locator('summary').filter({ hasText: 'Technical details: public fixture viewing key' }) });
  assert.match(await viewingDetails.locator('code').textContent(), /^0x[0-9a-f]{64}$/);
  assert.equal(await page.getByTestId('receive-view').locator('input, textarea, [contenteditable="true"]').count(), 0,
    'Receiving uses fixed profiles and readonly key text, never an editable private key field.');
  await capture('incognito-identity.png', 'Stealth receiving identity and local fixture profile before scanning. The shared identity contains public keys; the demo accepts no private viewing key.');
  await page.getByRole('button', { name: 'What changed?', exact: true }).click();
  await page.getByTestId('mode-comparison').waitFor();
  assert.match(await page.getByTestId('mode-comparison').innerText(), /one-time/i);
  await capture('incognito-comparison.png', 'Normal versus Incognito comparison within the same application: reusable receiving address versus public stealth identity and fresh one-time destinations. Amounts and sender inputs remain public.');
  await page.getByRole('button', { name: 'What changed?', exact: true }).click();
  assert.equal(await page.getByTestId('mode-comparison').isVisible(), false);

  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await page.getByLabel('Recipient stealth meta-address').fill('not-a-meta-address');
  await page.getByRole('button', { name: 'Derive one-time address' }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByTestId('derived-payment').count(), 0);
  await page.getByRole('button', { name: 'Use demo recipient' }).click();
  await page.getByRole('button', { name: 'Derive one-time address' }).click();
  const firstAddress = await page.getByTestId('one-time-address').innerText();
  assert.match(firstAddress, /^ckt1[a-z0-9]+$/);
  await page.locator('summary').filter({ hasText: 'Technical details: ephemeral public key' }).click();
  assert.match(await page.getByTestId('ephemeral-public-key').innerText(), /^0x0[23][0-9a-f]{64}$/);
  await page.getByRole('button', { name: 'Derive one-time address' }).click();
  assert.notEqual(await page.getByTestId('one-time-address').innerText(), firstAddress);
  await page.getByRole('button', { name: 'Build transaction preview' }).click();
  await page.getByTestId('fresh-change').waitFor();
  assert.ok(!(await page.getByTestId('fresh-change').innerText()).includes(await page.getByTestId('one-time-address').innerText()));
  await capture('incognito-send.png', 'Incognito ON: locally derived one-time address and ephemeral public key, actual unsigned CCC output, SIMULATED completion/signing and fresh change.');
  // Fresh change is optional, and toggling the policy invalidates the old draft.
  await page.getByRole('checkbox', { name: 'Preview fresh change', exact: true }).uncheck();
  assert.equal(await page.getByTestId('transaction-preview').count(), 0);
  assert.equal(await page.getByTestId('fresh-change').count(), 0);
  await deriveIfNeeded();
  await page.getByRole('button', { name: 'Build transaction preview' }).click();
  await page.getByTestId('transaction-preview').waitFor();
  assert.equal(await page.getByTestId('fresh-change').count(), 0);
  await page.getByRole('checkbox', { name: 'Preview fresh change', exact: true }).check();
  assert.equal(await page.getByTestId('transaction-preview').count(), 0);
  await deriveIfNeeded();
  await page.getByRole('button', { name: 'Build transaction preview' }).click();
  await page.getByTestId('fresh-change').waitFor();
  await page.getByLabel(/^Amount/).fill('201');
  assert.equal(await page.getByTestId('transaction-preview').count(), 0);
  assert.equal(await page.getByTestId('derived-payment').count(), 0);

  await page.getByRole('button', { name: 'Scan & receive', exact: true }).click();
  const profile = page.getByLabel('Demo viewing profile', { exact: true });
  // An in-flight local check must not restore results after a profile change.
  await page.getByRole('button', { name: 'Scan fixture payments', exact: true }).click();
  await profile.selectOption('unrelated');
  await page.waitForTimeout(250); // Deliberately cross the hook's 180ms local transition.
  assert.equal(await page.getByTestId('scan-results').count(), 0);
  await scanFixtures();
  assert.match(await page.getByTestId('scan-results').innerText(), /0 payments detected/);
  await profile.selectOption('matching');
  assert.equal(await page.getByTestId('scan-results').count(), 0);
  await scanFixtures();
  const incoming = await page.getByTestId('scan-results').innerText();
  assert.match(incoming, /1 payment detected/);
  assert.match(incoming, /1 unrelated or invalid output excluded/);
  assert.match(incoming, /LOCAL FIXTURE.*SIMULATED/);
  await capture('incognito-receive.png', 'View-key scan of two public local fixtures: one detected incoming payment, one nonmatching output, Spend simulation action. No chain scan.');
  await page.getByRole('button', { name: 'Spend simulation' }).click();
  await page.getByTestId('spend-preview').waitFor();
  assert.match(await page.getByTestId('spend-preview').innerText(), /fixture remains unspent/);
  // Switching off restores normal receiving and cancels pending fixture checks.
  await page.getByRole('button', { name: 'Scan fixture payments', exact: true }).click();
  await toggle.click();
  await page.waitForTimeout(250);
  await page.getByTestId('normal-receive').waitFor();
  assert.equal((await page.getByTestId('receiving-identity').innerText()).trim(), normalIdentity);
  assert.equal(await page.getByTestId('scan-results').count(), 0);
  assert.equal(await page.getByTestId('spend-preview').count(), 0);
  await toggle.click();
  assert.equal(await page.getByTestId('scan-results').count(), 0);
  await page.getByRole('button', { name: 'Disclosure', exact: true }).click();
  assert.match(await page.getByTestId('disclosure-detail').innerText(), /NOT HIDDEN/);
  await capture('incognito-disclosure.png', 'Disclosure of reduced recipient linkage and its limits: amounts, sender inputs, visible outputs, ephemeral key, timing/network exposure and fresh-change caveats. SIMULATED target flow.');

  // The same actual interface must remain usable at a small viewport.
  await page.setViewportSize({ width: 390, height: 844 });
  for (const name of ['Send', 'Scan & receive', 'Disclosure']) {
    await page.getByRole('button', { name, exact: true }).click();
    await honestLayout();
  }
  await page.getByRole('button', { name: 'Scan & receive', exact: true }).click();
  await toggle.click();
  await page.getByTestId('normal-receive').waitFor();
  await honestLayout();
  await toggle.click();
  await page.getByRole('button', { name: 'What changed?', exact: true }).click();
  await page.getByTestId('mode-comparison').waitFor();
  await honestLayout();
  await page.getByRole('button', { name: 'What changed?', exact: true }).click();
  await page.getByRole('button', { name: 'Disconnect demo', exact: true }).click();
  assert.equal(await toggle.isDisabled(), true);
  assert.equal(await toggle.getAttribute('aria-checked'), 'false');
  assert.equal(await page.getByTestId('spend-preview').count(), 0);
  await honestLayout();
  await page.getByRole('button', { name: 'Use demo account', exact: true }).click();
  assert.equal(await toggle.isEnabled(), true);
  assert.equal((await page.getByTestId('receiving-identity').innerText()).trim(), normalIdentity);
  await toggle.click();
  await page.getByRole('button', { name: 'Scan & receive', exact: true }).click();
  await page.getByRole('button', { name: 'Scan fixture payments', exact: true }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.waitForTimeout(250);
  assert.equal(await toggle.getAttribute('aria-checked'), 'false');
  assert.equal(await page.getByTestId('derived-payment').count(), 0);
  await page.getByRole('button', { name: 'Receive', exact: true }).click();
  await toggle.click();
  assert.equal(await page.getByTestId('scan-results').count(), 0);
  await honestLayout();
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(dataRequests, [], 'The simulation must make no RPC, indexer or service request.');
  assert.deepEqual(blockedRequests, [], 'The demo must not attempt any external/write request.');

  if (!checkOnly) {
    const inputs = [...walk(path.join(demo, 'src')), ...walk(path.join(root, 'packages/stealth/src')), ...walk(path.join(demo, 'dist')),
      ...(fs.existsSync(path.join(demo, 'public')) ? walk(path.join(demo, 'public')) : []),
      path.join(demo, 'package.json'), path.join(root, 'packages/stealth/package.json'), path.join(demo, 'vite.config.ts'), path.join(root, 'pnpm-lock.yaml'), fileURLToPath(import.meta.url)];
    const sourceFingerprint = inputs.sort().map(file => ({ file: path.relative(root, file).replaceAll(path.sep, '/'), sha256: sha(fs.readFileSync(file)) }));
    const manifest = { schema: 'ccc-incognito-evidence-v2', capturedAtUtc: new Date().toISOString(), command: 'pnpm capture:evidence',
      baseCommit: git('rev-parse', 'HEAD'), workingTree: git('status', '--porcelain') ? 'dirty' : 'clean',
      sourceFingerprint, sourceFingerprintSha256: sha(JSON.stringify(sourceFingerprint)),
      browser: { channel, version: browser.version() }, playwright: require('playwright/package.json').version, node: process.version,
      sourceUrl, viewport, deviceScaleFactor: 1, simulation: true, pageErrors, dataRequests, blockedRequests,
      walletConnected: false, signatures: 0, broadcasts: 0, chainEvidence: 'None. Local fixtures only.',
      accountState: 'Public demo account only; connect/disconnect controls simulate account state.',
      checks: ['Normal/Incognito receiving identities', 'Actual clipboard copy', 'Malformed recipients and invalid capacity',
        'Fresh one-time destinations', 'Optional fresh change', 'Matching/nonmatching fixture profiles',
        'Scan cancellation on profile/mode/reset', 'Unspent fixture after spend preview',
        '390px layouts', 'Demo account disconnect/reconnect', 'No external requests or private key input'],
      captureIntegrity: 'Actual UI controls, no page mocks, DOM replacement, fake chain identifiers or edited pixels.',
      files: files.map(({ png, ...record }) => record),
    };
    fs.mkdirSync(destination, { recursive: true });
    const existing = ['README.md', 'incognito-manifest.json', ...files.map(f => f.name)].filter(name => fs.existsSync(path.join(destination, name)));
    if (existing.length) {
      const archive = path.join(root, '.local/history/captures', `incognito-${new Date().toISOString().replaceAll(/[:.]/g, '-')}`);
      fs.mkdirSync(archive, { recursive: true });
      for (const name of existing) fs.copyFileSync(path.join(destination, name), path.join(archive, name), fs.constants.COPYFILE_EXCL);
    }
    for (const file of files) fs.writeFileSync(path.join(destination, file.name), file.png);
    fs.writeFileSync(path.join(destination, 'incognito-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    const diagram = json(path.join(root, 'docs/diagrams/ccc-incognito-architecture.json'));
    assert.equal(sha(fs.readFileSync(path.join(root, 'docs/diagrams', diagram.file))), diagram.sha256);
    const rows = files.map((f, i) => `| ${i + 2} | [${f.name}](${f.name}) — ${f.description} | ${f.capturedAtUtc} | ${f.sourceUrl} | 1440 × 1000 → ${f.dimensions.width} × ${f.dimensions.height} | \`${f.sha256}\` |`);
    const catalog = `# CCC Incognito integration evidence

These are genuine screenshots of the running local CCC application adaptation with an optional Incognito mode. The account, chain scanning, transaction completion, signing and settlement are **SIMULATED**. Local ECDH derivation, view-key matching against supplied fixtures and unsigned CCC output construction are real computations. No wallet is connected and no transaction is signed or submitted. Public fixture keys must never receive assets.

Normal mode displays a reusable receiving address. Incognito mode displays a public stealth receiving identity and demonstrates fresh one-time destinations, fixture recognition and a spend preview. The integration is a local prototype, not official upstream CCC functionality.

Amounts and sender inputs are **not hidden**. Outputs remain observable. Reducing direct recipient linkage and using fresh change do not defeat timing, network, amount or transaction-graph correlation. These images are **not deployment evidence**.

## Figure catalog

| Figure | File and meaning | Capture / generation time (UTC) | Source | Viewport → PNG pixels | SHA-256 |
|---|---|---|---|---|---|
| 1 | [Architecture](../diagrams/${diagram.file}) — authored target design, not deployment evidence | ${diagram.generatedAtUtc} | [SVG](../diagrams/${diagram.source}) | 1600 × 1100 | \`${diagram.sha256}\` |
${rows.join('\n')}

## Reproduce

\`\`\`sh
pnpm install --frozen-lockfile
pnpm build
node examples/incognito/scripts/capture-incognito-evidence.mjs
\`\`\`

The [Playwright script](../../examples/incognito/scripts/capture-incognito-evidence.mjs) starts and closes its own Vite preview server. It operates actual UI controls and verifies normal versus Incognito receiving, real clipboard copy, malformed recipient inputs, invalid amounts, fresh destinations, optional fresh change, matching and nonmatching fixture profiles, spend previews, demo account connection states and 390px layouts. Pending fixture scans must not restore stale results after profile changes, mode switches or reset. The viewing key is readonly; users choose public fixture profiles instead of entering private keys.

\`--check\` runs the same assertions without replacing evidence. External/write requests are blocked and any attempt fails verification. The browser receives local clipboard permissions to test copying without mocks. Captures use a 1440 × 1000 viewport; full-page PNG heights vary. No content is injected into the UI or edited into the PNGs.

[Capture manifest](incognito-manifest.json) records the browser (${channel} ${browser.version()}), Playwright, Node, source URL, source/build fingerprints, base commit, dates, sizes and hashes. The base commit alone does not identify uncommitted source edits. Browser fonts and fresh random one-time destinations can change pixel hashes across runs. The dynamic localhost port is provenance, not a public service. [Diagram metadata](../diagrams/ccc-incognito-architecture.json) records the existing authored target architecture separately; the capture command does not regenerate that diagram.

These artifacts establish interface behavior and local computations, not a verified deployment, live testnet lifecycle, audit, published package or accepted CCC contribution. Live lock-specific signing and indexer scanning remain pending.

## Prior evidence

Before replacement, the script copies the previous catalog, manifest and replaced screenshots into ignored \`.local/history/captures/\`. Committed earlier captures remain accessible through [Git history](../history.md); they describe their original interface states.
`;
    fs.writeFileSync(path.join(destination, 'README.md'), catalog);
  }
  console.log(JSON.stringify({ status: 'passed', mode: checkOnly ? 'verification' : 'capture', screenshots: files.map(({ name, dimensions, sha256 }) => ({ name, dimensions, sha256 })), viewports: [viewport, { width: 390, height: 844 }], dataRequests: 0, broadcasts: 0, pageErrors }, null, 2));
  await context.close();
} finally {
  await browser?.close();
  if (server) await new Promise((resolve, reject) => { server.httpServer.close(error => error ? reject(error) : resolve()); server.httpServer.closeAllConnections?.(); });
}
