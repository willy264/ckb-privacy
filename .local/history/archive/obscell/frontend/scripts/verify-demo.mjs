import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import { preview } from "vite";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(frontendRoot, "..");
const configuredScreenshotDirectory = process.argv[2] ?? process.env.DEMO_SCREENSHOT_DIR;
const screenshotDirectory = configuredScreenshotDirectory
  ? path.resolve(repositoryRoot, configuredScreenshotDirectory)
  : os.tmpdir();
fs.mkdirSync(screenshotDirectory, { recursive: true });

async function launchBrowser() {
  const requestedChannel = process.env.PLAYWRIGHT_CHANNEL;
  const attempts = requestedChannel
    ? [{ channel: requestedChannel }]
    : [{}, { channel: "chrome" }, { channel: "msedge" }];
  const failures = [];
  for (const options of attempts) {
    try {
      const browser = await chromium.launch({ ...options, headless: true });
      return {
        browser,
        channel: options.channel ?? "playwright-bundled",
      };
    } catch (error) {
      failures.push(error);
    }
  }
  throw new AggregateError(
    failures,
    "No Chromium browser is available. Run `pnpm exec playwright install chromium` or set PLAYWRIGHT_CHANNEL.",
  );
}

async function closePreviewServer(server) {
  if (!server) return;

  await new Promise((resolve, reject) => {
    server.httpServer.close((error) => {
      if (error) reject(error);
      else resolve();
    });
    server.httpServer.closeAllConnections?.();
  });
}

let previewServer;
let baseUrl = process.env.DEMO_BASE_URL;
if (!baseUrl) {
  assert.ok(
    fs.existsSync(path.join(frontendRoot, "dist", "index.html")),
    "Production build missing. Run `pnpm build` before the browser verifier.",
  );
  previewServer = await preview({
    root: frontendRoot,
    logLevel: "error",
    preview: { host: "127.0.0.1", port: 0, strictPort: true },
  });
  const address = previewServer.httpServer.address();
  assert.ok(address && typeof address !== "string", "Vite preview did not expose a TCP port");
  baseUrl = `http://127.0.0.1:${address.port}`;
}

const errors = [];
const privacyNetworkRequests = [];
let browser;
let browserChannel;

try {
  const launched = await launchBrowser();
  browser = launched.browser;
  browserChannel = launched.channel;
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  let recordPrivacyNetwork = false;
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("request", (request) => {
    if (
      recordPrivacyNetwork &&
      (request.resourceType() === "fetch" || request.resourceType() === "xhr")
    ) {
      privacyNetworkRequests.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60_000 });
  await page.getByRole("heading", { name: "CKB Privacy Protocol Demo" }).waitFor();
  const initialText = await page.locator("body").innerText();
  assert.match(initialText, /privacy operations are protocol simulations/i);
  assert.match(initialText, /one reference application/i);
  assert.match(initialText, /Privacy Core/);
  assert.match(initialText, /Host-owned CCC/);
  assert.equal(await page.getByRole("button", { name: "Send privately" }).count(), 0);
  assert.equal(await page.getByRole("button", { name: "SDK Fixture" }).count(), 0);
  await page.screenshot({
    path: path.join(screenshotDirectory, "figure-2-ccc-demo.png"),
    fullPage: true,
  });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  assert.ok(overflow <= 1, `Desktop page overflows horizontally by ${overflow}px`);

  await page.getByRole("button", { name: "Initialize local state" }).click();
  await page.getByText(/Local state initialized/).waitFor();

  recordPrivacyNetwork = true;
  await page.getByRole("button", { name: "Fund private state" }).click();
  await page.getByRole("dialog", { name: "Fund private state" }).waitFor();
  await page.getByRole("button", { name: "Run shield simulation" }).click();
  await page.getByText(/Shield simulation complete/).waitFor({ timeout: 10_000 });

  const balanceValues = page.locator(".demo-balance-item > strong");
  assert.match(await balanceValues.nth(0).innerText(), /^0\s+CT$/);
  assert.match(await balanceValues.nth(1).innerText(), /^100\s+CT$/);
  await page.screenshot({
    path: path.join(screenshotDirectory, "figure-3-private-balance.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.getByText(/Overview restored/).waitFor();
  await page.getByRole("button", { name: "Inspect state" }).click();
  await page.getByText(/Local state initialized/).waitFor();
  assert.match(await balanceValues.nth(1).innerText(), /^100\s+CT$/);

  await page.getByRole("tab", { name: "Protocol View" }).click();
  await page.getByRole("heading", { name: "Protocol state and verification" }).waitFor();
  const protocolText = await page.locator(".demo-protocol-view").innerText();
  assert.match(protocolText, /not live chain state/i);
  assert.match(protocolText, /0x\*{8}/);
  assert.match(protocolText, /generated/i);
  assert.match(protocolText, /bound/i);
  await page.screenshot({
    path: path.join(screenshotDirectory, "obscell-demo-verified-protocol.png"),
    fullPage: true,
  });
  await page.screenshot({
    path: path.join(screenshotDirectory, "figure-4-developer-protocol.png"),
    fullPage: true,
  });

  await page.getByRole("tab", { name: "Developer View" }).click();
  await page.getByRole("heading", { name: "Use the protocol through the Privacy SDK" }).waitFor();
  const developerText = await page.locator(".demo-developer-view").innerText();
  assert.match(developerText, /Existing foundation API/);
  assert.match(developerText, /State sync and balance inspection work with injected verification services/);
  assert.match(developerText, /Live shield, refund, unshield, proof generation and transaction construction are unavailable/);
  assert.match(developerText, /separate deterministic simulation client/);
  assert.match(developerText, /scripts are not deployed/);
  assert.match(await page.locator(".demo-code-content").innerText(), /UnsupportedOperationError/);
  await page.screenshot({
    path: path.join(screenshotDirectory, "obscell-demo-verified-developer.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: "Application view" }).click();
  await page.getByRole("button", { name: "Unshield note" }).click();
  await page.getByRole("button", { name: "Run unshield simulation" }).click();
  await page.getByText(/Unshield simulation complete/).waitFor({ timeout: 10_000 });
  assert.match(await balanceValues.nth(0).innerText(), /^100\s+CT$/);
  assert.match(await balanceValues.nth(1).innerText(), /^0\s+CT$/);

  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.getByText(/Demo scenario reset/).waitFor();
  assert.match(await balanceValues.nth(0).innerText(), /^100\s+CT$/);
  assert.match(await balanceValues.nth(1).innerText(), /^--\s+CT$/);

  const bodyText = await page.locator("body").innerText();
  assert.doesNotMatch(bodyText, /\b0x[0-9a-f]{16,}\b/i);
  assert.doesNotMatch(bodyText, /100% anonymous|fully private|maximum privacy/i);
  assert.deepEqual(privacyNetworkRequests, [], "Simulated privacy actions made network requests");
  assert.deepEqual(errors, [], "The demo emitted browser errors");

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const presentationOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  assert.ok(presentationOverflow <= 1, `Presentation page overflows by ${presentationOverflow}px`);
  await page.screenshot({
    path: path.join(screenshotDirectory, "obscell-demo-verified-presentation.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({
    path: path.join(screenshotDirectory, "obscell-demo-verified-desktop.png"),
    fullPage: true,
  });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(baseUrl, { waitUntil: "networkidle", timeout: 60_000 });
  const mobileOverflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  assert.ok(mobileOverflow <= 1, `Mobile page overflows horizontally by ${mobileOverflow}px`);
  await mobile.getByRole("button", { name: "Initialize local state" }).click();
  await mobile.getByText(/Local state initialized/).waitFor();
  await mobile.getByRole("button", { name: "Fund private state" }).click();
  const mobileDialog = mobile.getByRole("dialog", { name: "Fund private state" });
  const dialogBox = await mobileDialog.boundingBox();
  assert.ok(dialogBox && dialogBox.x >= 0 && dialogBox.width <= 390, "Mobile dialog is out of bounds");
  await mobile.getByRole("button", { name: "Close dialog" }).click();
  await mobile.evaluate(() => window.scrollTo(0, 0));
  await mobile.screenshot({
    path: path.join(screenshotDirectory, "obscell-demo-verified-mobile.png"),
    fullPage: true,
  });

  const legacy = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await legacy.goto(`${baseUrl}/?view=legacy`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await legacy.getByText(/SpectraMix/i).first().waitFor({ timeout: 20_000 });
  const legacyText = await legacy.locator("body").innerText();
  assert.match(legacyText, /Legacy mixer prototype/);
  assert.doesNotMatch(
    legacyText,
    /Maximum \(Relay\)|withdrawal is anonymous|Latest deposits|Anonymity set/i,
  );
  // Preserve the repository's historical screenshot; remote evidence has its own capture.
  if (!configuredScreenshotDirectory) {
    await legacy.screenshot({
      path: path.join(screenshotDirectory, "figure-1-legacy-mixer.png"),
      fullPage: true,
    });
  }

  const legacyHonestySource = [
    "src/components/StatsSidebar.tsx",
    "src/components/WithdrawTab.tsx",
    "src/hooks/useWithdrawalFlow.ts",
  ]
    .map(relativePath => fs.readFileSync(path.join(frontendRoot, relativePath), "utf8"))
    .join("\n");
  assert.doesNotMatch(legacyHonestySource, /Math\.random|Maximum \(Relay\)|is anonymous/i);

  const screenshotPaths = [
    path.join(screenshotDirectory, "figure-2-ccc-demo.png"),
    path.join(screenshotDirectory, "figure-3-private-balance.png"),
    path.join(screenshotDirectory, "figure-4-developer-protocol.png"),
    path.join(screenshotDirectory, "obscell-demo-verified-desktop.png"),
    path.join(screenshotDirectory, "obscell-demo-verified-presentation.png"),
    path.join(screenshotDirectory, "obscell-demo-verified-mobile.png"),
    path.join(screenshotDirectory, "obscell-demo-verified-developer.png"),
    path.join(screenshotDirectory, "obscell-demo-verified-protocol.png"),
  ];
  const report = {
    status: "passed",
    browser: { channel: browserChannel, version: browser.version() },
    interactions: [
      "protocol-oriented reference application",
      "local state initialization",
      "shield",
      "mode persistence",
      "developer foundation-API honesty boundary",
      "protocol view",
      "unshield",
      "reset",
      "legacy route",
      "legacy honesty boundary",
    ],
    networkRequestsDuringPrivacyOperations: privacyNetworkRequests.length,
    screenshots: screenshotPaths,
  };

  if (configuredScreenshotDirectory) {
    const command = (args) => execFileSync("git", args, {
      cwd: repositoryRoot,
      encoding: "utf8",
      windowsHide: true,
    }).trim();
    const fileHash = (filePath) => createHash("sha256")
      .update(fs.readFileSync(filePath))
      .digest("hex");
    const manifest = {
      schema: "obscell-demo-evidence-v1",
      capturedAtUtc: new Date().toISOString(),
      evidenceMode: "deterministic-local-simulation",
      command: process.argv[2]
        ? "pnpm --filter frontend capture:evidence"
        : "pnpm --filter frontend test:demo with DEMO_SCREENSHOT_DIR configured",
      gitCommit: command(["rev-parse", "HEAD"]),
      workingTree: command(["status", "--porcelain"]) ? "dirty" : "clean",
      browser: report.browser,
      viewports: {
        desktop: { width: 1440, height: 900 },
        mobile: { width: 390, height: 844 },
        legacy: { width: 1280, height: 720 },
      },
      networkRequestsDuringPrivacyOperations: privacyNetworkRequests.length,
      chainEvidence: "none; current privacy operations use local deterministic state",
      supplementarySdkFixture: "figure-6-second-consumer.png; captured separately by the SDK fixture verifier",
      files: screenshotPaths.map((filePath) => ({
        name: path.basename(filePath),
        bytes: fs.statSync(filePath).size,
        sha256: fileHash(filePath),
      })),
    };
    fs.writeFileSync(
      path.join(screenshotDirectory, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
  }

  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  await closePreviewServer(previewServer);
}
