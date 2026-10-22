#!/usr/bin/env node
/**
 * Verifies mobile visual screenshot PNGs exist (file presence only — not visual QA).
 * Usage: node scripts/verify-mobile-artifacts.mjs school-admin-dashboard
 *        ANDROID=1 node scripts/verify-mobile-artifacts.mjs school-admin-dashboard
 *        node scripts/verify-mobile-artifacts.mjs school-admin-dashboard android
 */
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = path.join(process.cwd(), "apps/mobile/.artifacts/responsive");

const feature = process.argv[2]?.trim();
const platformArg = process.argv[3]?.trim().toLowerCase();
const requireAndroid =
  process.env.ANDROID === "1" ||
  process.env.ANDROID === "true" ||
  platformArg === "android" ||
  platformArg === "both";

if (!feature) {
  console.error("Usage: npm run verify:mobile-artifacts -- <feature-slug> [android]");
  console.error("Example: npm run verify:mobile-artifacts -- school-admin-dashboard");
  process.exit(1);
}

const platforms = requireAndroid ? ["ios", "android"] : ["ios"];
const missing = [];

for (const platform of platforms) {
  const filePath = path.join(ARTIFACT_DIR, `${feature}-${platform}.png`);
  if (!fs.existsSync(filePath)) {
    missing.push(filePath);
  }
}

if (missing.length > 0) {
  console.error(`Missing ${missing.length} mobile screenshot(s) for feature "${feature}":`);
  for (const filePath of missing) {
    console.error(`  - ${path.relative(process.cwd(), filePath)}`);
  }
  console.error(
    "Capture with: npm run mobile:visual:capture -- <feature-slug> [ios|android]",
  );
  console.error("Then run visual review per mobile-ui-visual-verify SKILL.");
  process.exit(1);
}

console.log(`OK: ${platforms.length} screenshot(s) present for "${feature}".`);
for (const platform of platforms) {
  console.log(`  apps/mobile/.artifacts/responsive/${feature}-${platform}.png`);
}
