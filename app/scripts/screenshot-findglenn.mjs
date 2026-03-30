#!/usr/bin/env node
/**
 * find.glennsvanberg.se needs a name + "Enter world" before the 3D view appears.
 * Run from app/: node scripts/screenshot-findglenn.mjs
 */
import { chromium } from "playwright";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const url = "https://find.glennsvanberg.se";
const projectId = "findglenn";

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 390, height: 844 },
};

async function main() {
  const browser = await chromium.launch();
  for (const [size, viewport] of Object.entries(VIEWPORTS)) {
    const page = await browser.newPage();
    await page.setViewportSize(viewport);
    await page.goto(url, { waitUntil: "load", timeout: 120000 });
    await page.getByPlaceholder("Your name").fill("Portfolio");
    await page.getByRole("button", { name: "Enter world" }).click();
    await page.locator("canvas").waitFor({ state: "visible", timeout: 120000 });
    await page.waitForTimeout(12000);
    const out = join(publicDir, `${projectId}-${size}.png`);
    await page.screenshot({ path: out, fullPage: false, timeout: 60000 });
    console.log(`Screenshot saved: ${out}`);
    await page.close();
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
