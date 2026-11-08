#!/usr/bin/env node
/**
 * Remove local Expo/Maestro capture PNGs under apps/mobile/.artifacts (gitignored).
 *
 * Usage: npm run clean:mobile-artifacts
 *
 * Set KEEP_MOBILE_ARTIFACTS=1 to skip (agents respect this after visual review).
 */
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const ARTIFACTS_DIR = path.join(cwd, "apps/mobile/.artifacts");

if (
  !process.argv.includes("--force") &&
  (process.env.KEEP_MOBILE_ARTIFACTS === "1" ||
    process.env.KEEP_MOBILE_ARTIFACTS === "true")
) {
  console.log(
    "Skipped cleanup (KEEP_MOBILE_ARTIFACTS is set). Use --force to delete anyway.",
  );
  process.exit(0);
}

if (!fs.existsSync(ARTIFACTS_DIR)) {
  console.log("Nothing to clean: apps/mobile/.artifacts/ (missing)");
  process.exit(0);
}

fs.rmSync(ARTIFACTS_DIR, { recursive: true, force: true });
console.log("Removed apps/mobile/.artifacts/");
