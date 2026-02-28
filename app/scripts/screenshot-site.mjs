#!/usr/bin/env node
/**
 * Captures full-page screenshots at desktop and mobile viewports.
 * Run from app/: npm run screenshot -- <url> <projectId>
 *
 * Outputs:
 *   app/public/{projectId}-desktop.png
 *   app/public/{projectId}-mobile.png
 *
 * First run: npx playwright install chromium
 */

import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const [url, projectId] = process.argv.slice(2);

if (!url || !projectId) {
  console.error("Usage: npm run screenshot -- <url> <projectId>");
  console.error("Example: npm run screenshot -- https://example.com myproject");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 390, height: 844 },
};

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const [size, viewport] of Object.entries(VIEWPORTS)) {
    // Set viewport BEFORE navigation so the site renders the correct layout
    await page.setViewportSize(viewport);
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(2000);

    // Ensure we capture the top of the page (hero/landing), not a scrolled position
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const outputPath = join(publicDir, `${projectId}-${size}.png`);
    // Mobile: viewport only (what user sees on phone). Desktop: full page for hero shot.
    const fullPage = size === "desktop";
    await page.screenshot({ path: outputPath, fullPage, timeout: 60000 });
    console.log(`Screenshot saved: ${outputPath} (${fullPage ? "full page" : "viewport"})`);
  }

  await browser.close();
  console.log(`Done. Add to projects.ts: imageUrlDesktop: "/${projectId}-desktop.png", imageUrlMobile: "/${projectId}-mobile.png"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
