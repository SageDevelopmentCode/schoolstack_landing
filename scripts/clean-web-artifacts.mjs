#!/usr/bin/env node
/**
 * Remove local web UI capture PNGs under e2e/.artifacts (gitignored).
 *
 * Usage:
 *   npm run clean:web-artifacts                    # e2e/.artifacts/responsive only
 *   npm run clean:web-artifacts -- --all           # entire e2e/.artifacts
 *   npm run clean:web-artifacts -- --feature slug  # responsive/*slug* files only
 *
 * Set KEEP_RESPONSIVE_ARTIFACTS=1 to skip (agents respect this after visual review).
 */
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const ARTIFACTS_ROOT = path.join(cwd, "e2e/.artifacts");
const RESPONSIVE_DIR = path.join(ARTIFACTS_ROOT, "responsive");

const args = process.argv.slice(2);
const all = args.includes("--all");
const force = args.includes("--force");
const featureIdx = args.indexOf("--feature");
const feature =
  featureIdx >= 0 ? args[featureIdx + 1]?.trim() : undefined;

if (featureIdx >= 0 && !feature) {
  console.error("Usage: npm run clean:web-artifacts -- --feature <slug>");
  process.exit(1);
}

if (
  !force &&
  (process.env.KEEP_RESPONSIVE_ARTIFACTS === "1" ||
    process.env.KEEP_RESPONSIVE_ARTIFACTS === "true")
) {
  console.log(
    "Skipped cleanup (KEEP_RESPONSIVE_ARTIFACTS is set). Use --force to delete anyway.",
  );
  process.exit(0);
}

function rmDir(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Nothing to clean: ${path.relative(cwd, dir)} (missing)`);
    return 0;
  }
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`Removed ${path.relative(cwd, dir)}/`);
  return 1;
}

function cleanFeaturePrefix(slug) {
  if (!fs.existsSync(RESPONSIVE_DIR)) {
    console.log("Nothing to clean: e2e/.artifacts/responsive/ (missing)");
    return;
  }
  const entries = fs.readdirSync(RESPONSIVE_DIR);
  const prefix = `${slug}-`;
  const matches = entries.filter(
    (name) => name.startsWith(prefix) && name.endsWith(".png"),
  );
  if (matches.length === 0) {
    console.log(`No responsive PNGs matching prefix "${slug}"`);
    return;
  }
  for (const name of matches) {
    fs.unlinkSync(path.join(RESPONSIVE_DIR, name));
    console.log(`Removed e2e/.artifacts/responsive/${name}`);
  }
}

if (all) {
  rmDir(ARTIFACTS_ROOT);
} else if (feature) {
  cleanFeaturePrefix(feature);
} else {
  rmDir(RESPONSIVE_DIR);
}
