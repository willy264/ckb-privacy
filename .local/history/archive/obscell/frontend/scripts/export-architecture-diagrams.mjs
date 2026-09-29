import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(frontendRoot, "..");
const diagramRoot = path.join(repositoryRoot, "docs", "diagrams");
const diagrams = ["system-architecture", "sdk-integration"];
const require = createRequire(import.meta.url);
const sha256 = (data) => createHash("sha256").update(data).digest("hex");

async function launchBrowser() {
  const candidates = process.env.PLAYWRIGHT_CHANNEL
    ? [{ channel: process.env.PLAYWRIGHT_CHANNEL }]
    : [{ channel: "chrome" }, {}, { channel: "msedge" }];
  const failures = [];
  for (const options of candidates) {
    try {
      return {
        browser: await chromium.launch({ ...options, headless: true }),
        channel: options.channel ?? "playwright-bundled",
      };
    } catch (error) {
      failures.push(`${options.channel ?? "playwright-bundled"}: ${error.message}`);
    }
  }
  throw new Error(`No Chromium browser is available. Install Chrome/Edge or run pnpm --filter frontend exec playwright install chromium.\n${failures.join("\n")}`);
}

const { browser, channel } = await launchBrowser();
const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  classification: "Authored target architecture; not deployment evidence",
  renderer: "frontend/scripts/export-architecture-diagrams.mjs",
  playwrightVersion: require("playwright/package.json").version,
  browser: { channel, version: browser.version() },
  background: "#ffffff",
  deviceScaleFactor: 1,
  diagrams: [],
};
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  // Diagrams are self-contained artwork; rendering cannot load external resources.
  await page.route("**/*", (route) => route.abort());
  for (const name of diagrams) {
    const source = await fs.readFile(path.join(diagramRoot, `${name}.svg`));
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff}svg{display:block}</style></head><body>${source.toString("utf8")}</body></html>`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const { width, height } = await page.locator("svg").evaluate((svg) => ({
      width: Number(svg.getAttribute("width")),
      height: Number(svg.getAttribute("height")),
    }));
    assert.equal(width, 1600, `${name}: SVG must be 1600 pixels wide`);
    assert.ok(Number.isInteger(height) && height > 0, `${name}: invalid height`);
    await page.setViewportSize({ width, height });
    const layout = await page.evaluate(() => {
      const svg = document.querySelector("svg");
      const { width, height } = svg.viewBox.baseVal;
      const outside = [...svg.querySelectorAll("text")].filter((node) => {
        const box = node.getBBox();
        return box.x < 0 || box.y < 0 || box.x + box.width > width || box.y + box.height > height;
      }).map((node) => node.textContent);
      return { outside, pageWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight };
    });
    assert.deepEqual(layout.outside, [], `${name}: labels must stay within the image`);
    assert.equal(layout.pageWidth, width, `${name}: horizontal overflow`);
    assert.equal(layout.pageHeight, height, `${name}: vertical overflow`);
    const png = await page.screenshot({
      type: "png",
      omitBackground: false,
      fullPage: false,
    });
    assert.equal(png.readUInt32BE(16), width, `${name}: exported width`);
    assert.equal(png.readUInt32BE(20), height, `${name}: exported height`);
    // Preserve a prior good output if rendering or validation fails.
    await fs.writeFile(path.join(diagramRoot, `${name}.png`), png);
    manifest.diagrams.push({
      source: `${name}.svg`,
      sourceSha256: sha256(source),
      file: `${name}.png`,
      sha256: sha256(png),
      width,
      height,
    });
  }
  await fs.writeFile(path.join(diagramRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
} finally {
  await browser.close();
}

console.log(`Exported ${diagrams.length} diagrams at exactly 1600px width (${channel}, ${manifest.browser.version}). Source/PNG hashes: docs/diagrams/manifest.json`);
