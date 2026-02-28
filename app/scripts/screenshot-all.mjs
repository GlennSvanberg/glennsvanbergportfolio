#!/usr/bin/env node
/**
 * Runs screenshot for all projects. Execute from app/: node scripts/screenshot-all.mjs
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(__dirname, "screenshot-site.mjs");

const PROJECTS = [
  ["https://allaheterglenn.se", "allaheterglenn"],
  ["https://qrbutik.se", "qrbutik"],
  ["https://boardio.io", "boardio"],
  ["https://trackaton.com", "trackaton"],
  ["https://photo.glennsvanberg.se", "photo"],
  ["https://målasidor.se", "malasidor"],
  ["https://grzaniec.se", "grzaniec"],
  ["https://next.glennsvanberg.se", "next"],
  ["https://teddy.glennsvanberg.se", "teddy"],
  ["https://avatar.glennsvanberg.se", "avatar"],
  ["https://pair.glennsvanberg.se", "pair"],
];

async function runScreenshot(url, projectId) {
  return new Promise((resolve, reject) => {
    const proc = spawn("node", [scriptPath, url, projectId], {
      stdio: "inherit",
      cwd: join(__dirname, ".."),
    });
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
  });
}

async function main() {
  for (const [url, projectId] of PROJECTS) {
    console.log(`\n--- ${projectId} ---`);
    try {
      await runScreenshot(url, projectId);
    } catch (err) {
      console.error(`Failed ${projectId}:`, err.message);
    }
  }
  console.log("\nDone.");
}

main().catch(console.error);
