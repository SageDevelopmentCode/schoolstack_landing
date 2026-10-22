#!/usr/bin/env node
/**
 * Local Playwright web server: production `next start` on the E2E port.
 * Avoids Next.js "only one next dev per repo" when daily dev runs on 3000.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const port = process.argv[2];
if (!port || Number.isNaN(Number(port))) {
  console.error("Usage: node scripts/playwright-e2e-web-server.mjs <port>");
  process.exit(1);
}

const buildIdPath = path.join(process.cwd(), ".next", "BUILD_ID");
if (!fs.existsSync(buildIdPath)) {
  console.error(
    "E2E production server requires a build. Run: npm run test:e2e:build",
  );
  process.exit(1);
}

const child = spawn("npx", ["next", "start", "-p", port], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
