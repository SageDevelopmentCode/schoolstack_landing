#!/usr/bin/env node
/**
 * Parent program co-op visual gate: artifact presence + agent review checklist.
 *
 * Usage:
 *   node scripts/verify-parent-coop-visual-checklist.mjs
 *   node scripts/verify-parent-coop-visual-checklist.mjs --artifacts-only
 */
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = path.join(process.cwd(), "apps/mobile/.artifacts/responsive");
const SLUGS = ["parent-coop-teaching-schedule", "parent-coop-more-menu"];
const artifactsOnly = process.argv.includes("--artifacts-only");

const missing = [];
for (const slug of SLUGS) {
  const filePath = path.join(ARTIFACT_DIR, `${slug}-ios.png`);
  if (!fs.existsSync(filePath)) {
    missing.push(filePath);
  }
}

if (missing.length > 0) {
  console.error("Missing co-op program visual screenshot(s):");
  for (const filePath of missing) {
    console.error(`  - ${path.relative(process.cwd(), filePath)}`);
  }
  console.error("");
  console.error("Capture:");
  console.error("  npm run mobile:visual:capture:coop-program");
  console.error("Or individually:");
  console.error("  npm run mobile:visual:capture -- parent-coop-teaching-schedule");
  console.error("  npm run mobile:visual:capture -- parent-coop-more-menu");
  process.exit(1);
}

console.log("OK: co-op program visual artifacts present:");
for (const slug of SLUGS) {
  console.log(`  apps/mobile/.artifacts/responsive/${slug}-ios.png`);
}

if (artifactsOnly) {
  process.exit(0);
}

console.log("");
console.log("=== Parent co-op program visual review (read PNGs + checklist) ===");
console.log("");
console.log("Prerequisites:");
console.log("  - supabase start && supabase db reset && npm run seed:e2e");
console.log("  - Kindergarten Co-op program portal data (rooted-meadows-demo manual seeds");
console.log("    or equivalent coop program + teaching weeks for the previewed family.");
console.log("  - API on :3100, Expo with apps/mobile/.env.e2e.local, iOS Simulator");
console.log("");
console.log("parent-coop-teaching-schedule:");
console.log("  [ ] Story header + four stat cards readable (not cramped)");
console.log("  [ ] Filter pills visible (All weeks / Upcoming / My weeks / Open slots)");
console.log("  [ ] Week cards: single Instructor/Assistant line; no duplicate Open chip in preview");
console.log("  [ ] Schedule tab selected; content not clipped under preview banner / tab bar");
console.log("");
console.log("parent-coop-more-menu:");
console.log("  [ ] Co-op kicker above Curriculum when coop mode");
console.log("  [ ] Curriculum and Supply list rows visible with subtitles");
console.log("  [ ] More sheet not empty / not stuck on skeleton");
console.log("");
console.log("Optional navigation smoke (manual after capture):");
console.log("  [ ] More → Curriculum opens PDF/guides screen");
console.log("  [ ] More → Supply list opens claim list");
console.log("  [ ] Schedule tab matches web data for same preview family");
