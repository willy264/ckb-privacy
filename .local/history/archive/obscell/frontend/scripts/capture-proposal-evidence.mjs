import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { createServer } from "vite";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(frontendRoot, "..");
const destination = path.join(root, "docs/evidence");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "obscell-proposal-capture-"));
const hostedUrl = "https://ckb-privacy-mixer-v1-frontend.vercel.app/";
const viewport = { width: 1440, height: 900 };
const command = "node frontend/scripts/capture-proposal-evidence.mjs";
const require = createRequire(import.meta.url);
const hash = (data) => createHash("sha256").update(data).digest("hex");
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", windowsHide: true }).trim();
const json = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const slash = (value) => value.replaceAll(path.sep, "/");
const sourceFiles = (folder) => fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(folder, entry.name);
  return entry.isDirectory() ? sourceFiles(file) : [file];
});

async function launch() {
  const attempts = process.env.PLAYWRIGHT_CHANNEL
    ? [{ channel: process.env.PLAYWRIGHT_CHANNEL }]
    : [{ channel: "chrome" }, {}, { channel: "msedge" }];
  const errors = [];
  for (const options of attempts) {
    try { return { browser: await chromium.launch({ ...options, headless: true }), channel: options.channel ?? "playwright-bundled" }; }
    catch (error) { errors.push(error.message); }
  }
  throw new Error(`Install Chrome/Edge or run pnpm --filter frontend exec playwright install chromium.\n${errors.join("\n")}`);
}

let browser;
let server;
const screenshots = [];
const blockedRequests = [];
const privacyRequests = [];
const pageErrors = [];
let recordPrivacy = false;

try {
  // Vite serves the current source tree, not a potentially stale production build.
  // Tailwind's configuration discovery uses cwd, just like `pnpm --filter frontend dev`.
  process.chdir(frontendRoot);
  server = await createServer({ root: frontendRoot, logLevel: "error", server: { host: "127.0.0.1", port: 0, strictPort: true, open: false } });
  await server.listen();
  const address = server.httpServer.address();
  assert.ok(address && typeof address !== "string");
  const localUrl = `http://127.0.0.1:${address.port}/`;
  const launched = await launch();
  browser = launched.browser;
  const browserInfo = { channel: launched.channel, version: browser.version() };
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, serviceWorkers: "block" });
  // No wallet is connected or invoked. Reject writes even if the page attempts one.
  await context.route("**/*", (route) => {
    if (!["GET", "HEAD"].includes(route.request().method())) {
      blockedRequests.push(`${route.request().method()} ${route.request().url()}`);
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("request", (request) => {
    if (recordPrivacy && ["fetch", "xhr"].includes(request.resourceType())) privacyRequests.push(`${request.method()} ${request.url()}`);
  });

  async function capture(target, name, description, sourceType, extra = {}) {
    await target.evaluate(() => document.fonts.ready);
    await target.evaluate(() => window.scrollTo(0, 0));
    const overflow = await target.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `${name}: horizontal overflow ${overflow}`);
    const text = await target.locator("body").innerText();
    if (sourceType === "local-vite-dev-server") {
      assert.match(text, /simulat(?:ion|ed)/i, `${name}: simulation labels must stay visible`);
      assert.doesNotMatch(text, /\b0x[0-9a-f]{16,}\b/i, `${name}: no invented hashes`);
      assert.doesNotMatch(text, /(?:block height|confirmations?|transaction hash)\s*[:=]\s*(?:0x|\d)/i, `${name}: no invented chain records`);
    }
    const png = await target.screenshot({ fullPage: true, type: "png" });
    assert.equal(png.readUInt32BE(16), viewport.width);
    fs.writeFileSync(path.join(temporary, name), png);
    screenshots.push({ name, description, capturedAtUtc: new Date().toISOString(), sourceType, sourceUrl: target.url(), viewport, dimensions: { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }, bytes: png.length, sha256: hash(png), ...extra });
  }

  await page.goto(localUrl, { waitUntil: "networkidle", timeout: 60_000 });
  await page.getByRole("heading", { name: "CKB Privacy Protocol Demo" }).waitFor();
  assert.match(await page.locator("body").innerText(), /privacy operations are protocol simulations/i);
  await capture(page, "figure-2-ccc-demo.png", "Reference overview: wallet, state and operation boundaries; local simulation.", "local-vite-dev-server");
  recordPrivacy = true;
  await page.getByRole("button", { name: "Initialize local state" }).click();
  await page.getByText(/Local state initialized/).waitFor();
  await page.getByRole("button", { name: "Fund private state" }).click();
  await page.getByRole("dialog", { name: "Fund private state" }).waitFor();
  await page.getByRole("button", { name: "Run shield simulation" }).click();
  await page.getByText(/Shield simulation complete/).waitFor({ timeout: 15_000 });
  const balances = page.locator(".demo-balance-item > strong");
  assert.match(await balances.nth(0).innerText(), /^0\s+CT$/);
  assert.match(await balances.nth(1).innerText(), /^100\s+CT$/);
  await capture(page, "figure-3-private-balance.png", "Private state after simulated funding: 100 CT local fixture balance, not settled assets.", "local-vite-dev-server");
  await page.getByRole("tab", { name: "Protocol View" }).click();
  await page.getByRole("heading", { name: "Protocol state and verification" }).waitFor();
  const protocol = await page.locator(".demo-protocol-view").innerText();
  for (const term of [/not live chain state/i, /commitment/i, /merkle/i, /proof/i, /nullifier/i, /recipient/i]) assert.match(protocol, term);
  await capture(page, "figure-4-developer-protocol.png", "Protocol view: commitments, Merkle state, proofs, nullifiers and recipient relationships; target/simulated state.", "local-vite-dev-server");
  await page.getByRole("tab", { name: "Developer View" }).click();
  await page.getByRole("heading", { name: "Use the protocol through the Privacy SDK" }).waitFor();
  const developer = await page.locator(".demo-developer-view").innerText();
  assert.match(developer, /Existing foundation API/);
  assert.match(developer, /Live shield, refund, unshield, proof generation and transaction construction are unavailable/);
  assert.match(developer, /separate deterministic simulation client/);
  await capture(page, "obscell-demo-verified-developer.png", "Developer view: real SDK guidance, injected services and unavailable live capabilities.", "local-vite-dev-server");
  recordPrivacy = false;
  assert.deepEqual(privacyRequests, [], "Privacy simulations must make no fetch/XHR requests");
  assert.deepEqual(pageErrors, [], "Local views must have no page runtime errors");

  const historical = await context.newPage();
  const historicalErrors = [];
  historical.on("pageerror", (error) => historicalErrors.push(error.message));
  let hostedFailure = null;
  let hostedStatus = null;
  let historicalType = "historical-hosted-interface";
  try {
    const response = await historical.goto(hostedUrl, { waitUntil: "networkidle", timeout: 60_000 });
    hostedStatus = response?.status() ?? null;
    assert.ok(response?.ok(), `Hosted HTTP status ${hostedStatus}`);
    await historical.getByText(/SpectraMix/i).first().waitFor({ timeout: 15_000 });
  } catch (error) {
    hostedFailure = error.message;
    historicalType = "historical-local-legacy-interface";
    await historical.goto(`${localUrl}?view=legacy`, { waitUntil: "networkidle", timeout: 60_000 });
    await historical.getByText(/SpectraMix/i).first().waitFor({ timeout: 15_000 });
  }
  const historicalText = await historical.locator("body").innerText();
  assert.doesNotMatch(historicalText, /\b0x[0-9a-f]{64}\b/i, "Do not publish historical UI containing unverified transaction hashes");
  assert.doesNotMatch(historicalText, /(?:block height|confirmations?|transaction hash)\s*[:=]\s*(?:0x|\d)/i);
  await capture(historical, "previous-hosted-reference.png", "Actual SpectraMix historical interface. Displayed badges, balances and privacy claims are unverified interface text.", historicalType, { requestedUrl: hostedUrl, httpStatus: hostedStatus, hostedFailure, pageErrors: historicalErrors, sourceRevision: historicalType === "historical-hosted-interface" ? "unknown deployed revision" : "current preserved legacy route" });
  await historical.close();
  await context.close();

  const sourcePaths = [...sourceFiles(path.join(frontendRoot, "src")), path.join(frontendRoot, "index.html"), path.join(frontendRoot, "package.json"), path.join(frontendRoot, "vite.config.ts"), path.join(root, "pnpm-lock.yaml"), fileURLToPath(import.meta.url)].filter((file) => fs.existsSync(file)).sort();
  const sourceFingerprint = sourcePaths.map((file) => ({ name: slash(path.relative(root, file)), sha256: hash(fs.readFileSync(file)) }));
  const manifest = {
    schema: "obscell-proposal-capture-v1", capturedAtUtc: new Date().toISOString(), command,
    gitCommit: git("rev-parse", "HEAD"), workingTree: git("status", "--porcelain") ? "dirty" : "clean",
    sourceState: "Current working-tree Vite source; base commit alone does not identify uncommitted UI edits.",
    sourceFingerprint, sourceFingerprintSha256: hash(JSON.stringify(sourceFingerprint)),
    nodeVersion: process.version, playwrightVersion: require("playwright/package.json").version, viteVersion: require("vite/package.json").version,
    browser: browserInfo, viewport, deviceScaleFactor: 1, localSourceUrl: localUrl,
    walletConnected: false, transactionSubmissions: 0, networkRequestsDuringPrivacyOperations: privacyRequests.length,
    blockedNonReadRequests: blockedRequests, pageErrors, chainEvidence: "none; screenshots are interface evidence only",
    manipulation: "None: no route mocks, injected UI, edited pixels or replacement values. Actual UI controls produce local simulation state.",
    files: screenshots,
  };

  // All five captures and assertions succeeded before any existing evidence is replaced.
  fs.mkdirSync(destination, { recursive: true });
  const archive = path.join(destination, "history", new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-"));
  fs.mkdirSync(archive, { recursive: true });
  const archived = [];
  for (const name of fs.readdirSync(destination).filter((name) => /\.(png|json)$/.test(name))) {
    const original = path.join(destination, name);
    const data = fs.readFileSync(original);
    fs.copyFileSync(original, path.join(archive, name), fs.constants.COPYFILE_EXCL);
    archived.push({ name, bytes: data.length, sha256: hash(data) });
  }
  writeJson(path.join(archive, "archive-index.json"), { archivedAtUtc: new Date().toISOString(), purpose: "Preserve pre-capture files and original provenance; archive date is not their capture date.", files: archived });
  manifest.previousEvidenceArchive = slash(path.relative(root, archive));
  for (const shot of screenshots) fs.copyFileSync(path.join(temporary, shot.name), path.join(destination, shot.name));
  writeJson(path.join(destination, "proposal-capture-manifest.json"), manifest);
  const previous = screenshots.find((shot) => shot.name === "previous-hosted-reference.png");
  writeJson(path.join(destination, "previous-hosted-reference.json"), { ...previous, command, browser: browserInfo, walletConnected: false, transactionSubmissions: 0, captureRepositoryCommit: manifest.gitCommit, captureWorkingTree: manifest.workingTree, evidenceLimit: "Interface only: no deployment, balances, transactions or security claims are independently verified." });

  // Keep supplementary entries with their original date and viewport, not this capture date.
  const oldManifestPath = path.join(archive, "manifest.json");
  const old = fs.existsSync(oldManifestPath) ? json(oldManifestPath) : { files: [] };
  const changed = new Map(screenshots.filter((shot) => shot.name !== previous.name).map((shot) => [shot.name, shot]));
  const files = old.files.map((entry) => {
    if (changed.has(entry.name)) { const shot = changed.get(entry.name); changed.delete(entry.name); return shot; }
    const kind = entry.name.includes("mobile") ? "mobile" : entry.name.includes("presentation") ? "presentation" : "desktop";
    return { ...entry, capturedAtUtc: entry.capturedAtUtc ?? old.capturedAtUtc, sourceType: entry.sourceType ?? "historical-local-preview", sourceUrl: entry.sourceUrl ?? "Local preview; original port was not recorded", viewport: entry.viewport ?? old.viewports?.[kind] ?? (kind === "presentation" ? { width: 1280, height: 720 } : null) };
  });
  files.push(...changed.values());
  writeJson(path.join(destination, "manifest.json"), { schema: "obscell-demo-evidence-v2", updatedAtUtc: manifest.capturedAtUtc, provenance: "Mixed capture dates: read each file record. Current four proposal views use proposal-capture-manifest.json; other views retain original provenance.", currentCaptureManifest: "proposal-capture-manifest.json", historicalManifest: `${slash(path.relative(destination, archive))}/manifest.json`, files });
  console.log(JSON.stringify({ status: "passed", command, browser: browserInfo, viewport, sourceUrl: localUrl, privacyNetworkRequests: privacyRequests.length, historicalSource: previous.sourceUrl, historicalHttpStatus: hostedStatus, manifest: "docs/evidence/proposal-capture-manifest.json", archivedTo: manifest.previousEvidenceArchive, files: screenshots.map(({ name, dimensions, sha256 }) => ({ name, dimensions, sha256 })) }, null, 2));
} finally {
  await browser?.close();
  await server?.close();
}
