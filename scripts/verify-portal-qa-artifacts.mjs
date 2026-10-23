#!/usr/bin/env node
/**
 * Verifies portal QA screenshot PNGs exist (file presence only — not visual QA).
 * Usage: node scripts/verify-portal-qa-artifacts.mjs committee-messages
 */
import fs from "node:fs";
import path from "node:path";

const VIEWPORTS = ["mobile", "tablet", "desktop"];
const ARTIFACT_DIR = path.join(process.cwd(), "e2e/.artifacts/portal-qa");

const scenario = process.argv[2]?.trim();
if (!scenario) {
  console.error("Usage: npm run verify:portal-qa-artifacts -- <scenario-id>");
  console.error("Example: npm run verify:portal-qa-artifacts -- committee-messages");
  process.exit(1);
}

const missing = [];
for (const viewport of VIEWPORTS) {
  const filePath = path.join(ARTIFACT_DIR, `${scenario}-${viewport}.png`);
  if (!fs.existsSync(filePath)) {
    missing.push(filePath);
  }
}

if (missing.length > 0) {
  console.error(`Missing ${missing.length} portal QA screenshot(s) for "${scenario}":`);
  for (const filePath of missing) {
    console.error(`  - ${path.relative(process.cwd(), filePath)}`);
  }
  console.error(
    "Capture via npm run test:qa:portal, then run visual review per portal-qa SKILL.",
  );
  process.exit(1);
}

console.log(`OK: all ${VIEWPORTS.length} screenshots present for "${scenario}".`);
for (const viewport of VIEWPORTS) {
  console.log(`  e2e/.artifacts/portal-qa/${scenario}-${viewport}.png`);
}
