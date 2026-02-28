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

  // Disable scroll restoration so we always start at top
  await page.addInitScript(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  });

  for (const [size, viewport] of Object.entries(VIEWPORTS)) {
    // Set viewport BEFORE navigation so the site renders the correct layout
    await page.setViewportSize(viewport);
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2000);

    // Force scroll to top – handle both document and body, and any scroll containers
    await page.evaluate(() => {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      // Some sites use a main scroll container
      const main = document.querySelector("main");
      if (main) {
        main.scrollTop = 0;
        main.scrollLeft = 0;
      }
    });
    await page.waitForTimeout(500);

    const outputPath = join(publicDir, `${projectId}-${size}.png`);
    // Viewport only – capture what visitors see when they land on the page
    const fullPage = false;
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
