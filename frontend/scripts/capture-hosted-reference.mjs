import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const evidenceDirectory = path.join(repositoryRoot, "docs/evidence");
const sourceUrl = "https://ckb-privacy-mixer-v1-frontend.vercel.app/";
const screenshotName = "previous-hosted-reference.png";
const metadataPath = path.join(evidenceDirectory, "previous-hosted-reference.json");
const viewport = { width: 1440, height: 1000 };
const blockedRequests = [];
const errors = [];
let browser;

const metadata = {
  schema: "obscell-hosted-reference-evidence-v1",
  project: "Obscell Privacy Protocol",
  requestedAtUtc: new Date().toISOString(),
  command: "node frontend/scripts/capture-hosted-reference.mjs",
  sourceUrl,
  evidenceMode: "historical-hosted-interface-only",
  evidenceLimit: "A screenshot of the previous hosted V1 interface. This capture does not verify CKB deployment, a transaction, balances, cryptographic correctness, or security.",
  walletConnected: false,
  transactionSubmissions: 0,
  interaction: "Opened the public URL in a fresh browser context; no buttons clicked and no wallet used. Non-GET/HEAD requests blocked.",
  viewport,
  captureRepositoryCommit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, encoding: "utf8" }).trim(),
  captureWorkingTree: execFileSync("git", ["status", "--porcelain"], { cwd: repositoryRoot, encoding: "utf8" }).trim() ? "dirty" : "clean",
  hostedSourceCommit: "unknown; the hosting interface does not establish its source revision",
};

try {
  const candidates = process.env.PLAYWRIGHT_CHANNEL
    ? [{ channel: process.env.PLAYWRIGHT_CHANNEL }]
    : [{}, { channel: "chrome" }, { channel: "msedge" }];
  const launchFailures = [];
  for (const candidate of candidates) {
    try {
      browser = await chromium.launch({ ...candidate, headless: true });
      metadata.browser = { channel: candidate.channel ?? "playwright-bundled", version: browser.version() };
      break;
    } catch (error) {
      launchFailures.push(error.message);
    }
  }
  assert.ok(browser, `No Chromium browser available: ${launchFailures.join("\n")}`);
  const context = await browser.newContext({ viewport, serviceWorkers: "block" });
  await context.route("**/*", async (route) => {
    const request = route.request();
    if (!["GET", "HEAD"].includes(request.method())) {
      blockedRequests.push({ method: request.method(), url: request.url().split("?")[0] });
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(sourceUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  assert.ok(response && response.status() < 400, `HTTP navigation failed: ${response?.status() ?? "no response"}`);
  await page.waitForFunction(() => /obscell|privacy|mixer/i.test(document.body?.innerText ?? ""), undefined, { timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  metadata.capturedAtUtc = new Date().toISOString();
  metadata.finalUrl = page.url();
  metadata.httpStatus = response.status();
  metadata.pageTitle = await page.title();
  metadata.visibleHeadings = await page.locator("h1, h2").allTextContents();
  fs.mkdirSync(evidenceDirectory, { recursive: true });
  const screenshotPath = path.join(evidenceDirectory, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage: true, animations: "disabled" });
  const screenshot = fs.readFileSync(screenshotPath);
  metadata.status = "captured";
  metadata.screenshot = { name: screenshotName, bytes: screenshot.byteLength, sha256: createHash("sha256").update(screenshot).digest("hex") };
} catch (error) {
  metadata.status = "failed";
  metadata.failure = error.message;
  metadata.failedAtUtc = new Date().toISOString();
  process.exitCode = 1;
} finally {
  metadata.blockedNonReadRequests = blockedRequests;
  metadata.pageErrors = errors;
  fs.mkdirSync(evidenceDirectory, { recursive: true });
  fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
  await browser?.close();
  console.log(JSON.stringify(metadata, null, 2));
}
