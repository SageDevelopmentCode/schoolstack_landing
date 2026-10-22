#!/usr/bin/env node
/**
 * Verifies responsive screenshot PNGs exist (file presence only — not visual QA).
 * Usage: node scripts/verify-responsive-artifacts.mjs committee-messages
 */
import fs from "node:fs";
import path from "node:path";

const VIEWPORTS = ["mobile", "tablet", "desktop"];
const ARTIFACT_DIR = path.join(process.cwd(), "e2e/.artifacts/responsive");

const feature = process.argv[2]?.trim();
if (!feature) {
  console.error("Usage: npm run verify:responsive-artifacts -- <feature-slug>");
  console.error("Example: npm run verify:responsive-artifacts -- committee-messages");
  process.exit(1);
}

const missing = [];
for (const viewport of VIEWPORTS) {
  const filePath = path.join(ARTIFACT_DIR, `${feature}-${viewport}.png`);
  if (!fs.existsSync(filePath)) {
    missing.push(filePath);
  }
}

if (missing.length > 0) {
  console.error(`Missing ${missing.length} responsive screenshot(s) for feature "${feature}":`);
  for (const filePath of missing) {
    console.error(`  - ${path.relative(process.cwd(), filePath)}`);
  }
  console.error(
    "Capture via browser MCP or Playwright layout spec, then run visual review per portal-responsive-verify SKILL.",
  );
  process.exit(1);
}

console.log(`OK: all ${VIEWPORTS.length} screenshots present for "${feature}".`);
for (const viewport of VIEWPORTS) {
  console.log(`  e2e/.artifacts/responsive/${feature}-${viewport}.png`);
}
