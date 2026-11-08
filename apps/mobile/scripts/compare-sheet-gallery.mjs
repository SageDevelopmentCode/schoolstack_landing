#!/usr/bin/env node
// Compare sheet gallery screenshots from .maestro/sheet-gallery.yaml against
// committed baselines in apps/mobile/visual-baselines/sheet-gallery/<platform>/.
//
// Usage:
//   node apps/mobile/scripts/compare-sheet-gallery.mjs [--platform android|ios] [--strict]
//   node apps/mobile/scripts/compare-sheet-gallery.mjs --platform android --update [--from <dir>]
//
// Env:
//   SHEET_GALLERY_SCREENSHOTS_DIR  extra directory to search for screenshots
//   SHEET_GALLERY_MAX_DIFF_RATIO   fraction of compared pixels allowed to differ (default 0.01)

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
  appendFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const mobileDir = path.resolve(scriptDir, '..');
const flowFile = path.join(mobileDir, '.maestro', 'sheet-gallery.yaml');

const args = process.argv.slice(2);
const argValue = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const platform = argValue('--platform') ?? 'android';
const update = args.includes('--update');
const strict = args.includes('--strict');
const fromDir = argValue('--from') ?? process.env.SHEET_GALLERY_SCREENSHOTS_DIR;
const isCi = process.env.CI === 'true';
const maxDiffRatio = Number(process.env.SHEET_GALLERY_MAX_DIFF_RATIO ?? '0.01');
// Per-channel delta below which a pixel counts as unchanged (anti-aliasing, caret blink).
const CHANNEL_TOLERANCE = 40;
// Status bar clock and icons change between runs.
const CROP_TOP_RATIO = 0.07;
// Screenshots older than this relative to the newest one are leftovers from a previous run.
const STALE_WINDOW_MS = 2 * 60 * 60 * 1000;

if (!['android', 'ios'].includes(platform)) {
  console.error(`Unknown --platform ${platform}; expected android or ios`);
  process.exit(2);
}

const baselineDir = path.join(mobileDir, 'visual-baselines', 'sheet-gallery', platform);
const outDir = path.join(mobileDir, '.artifacts', 'sheet-gallery', platform);
const currentOutDir = path.join(outDir, 'current');
const diffOutDir = path.join(outDir, 'diff');

function expectedNames() {
  const yaml = readFileSync(flowFile, 'utf8');
  const names = [...yaml.matchAll(/takeScreenshot:\s*(sheet-gallery-[\w-]+)/g)].map((m) => m[1]);
  return [...new Set(names)];
}

function walkPngs(dir, recursive, found) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive && entry.name !== 'node_modules') walkPngs(full, recursive, found);
      continue;
    }
    const match = /^(sheet-gallery-[\w-]+)\.png$/.exec(entry.name);
    if (!match) continue;
    const mtimeMs = statSync(full).mtimeMs;
    const existing = found.get(match[1]);
    if (!existing || existing.mtimeMs < mtimeMs) {
      found.set(match[1], { file: full, mtimeMs });
    }
  }
}

function findScreenshots() {
  const found = new Map();
  if (fromDir) {
    walkPngs(path.resolve(fromDir), true, found);
    return found;
  }
  walkPngs(mobileDir, false, found);
  walkPngs(path.join(homedir(), '.maestro', 'tests'), true, found);

  const newest = Math.max(0, ...[...found.values()].map((entry) => entry.mtimeMs));
  for (const [name, entry] of found) {
    if (newest - entry.mtimeMs > STALE_WINDOW_MS) found.delete(name);
  }
  return found;
}

async function loadRaw(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function diffImages(baselineFile, currentFile, diffFile) {
  const baseline = await loadRaw(baselineFile);
  const current = await loadRaw(currentFile);
  if (baseline.width !== current.width || baseline.height !== current.height) {
    return {
      sizeMismatch: `${baseline.width}x${baseline.height} baseline vs ${current.width}x${current.height} current`,
    };
  }

  const { width, height } = current;
  const cropTop = Math.round(height * CROP_TOP_RATIO);
  const out = Buffer.alloc(width * height * 4);
  let changed = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const gray = Math.round(
        (baseline.data[i] * 0.3 + baseline.data[i + 1] * 0.59 + baseline.data[i + 2] * 0.11) * 0.35 + 160,
      );
      const delta = Math.max(
        Math.abs(baseline.data[i] - current.data[i]),
        Math.abs(baseline.data[i + 1] - current.data[i + 1]),
        Math.abs(baseline.data[i + 2] - current.data[i + 2]),
      );
      const isChanged = y >= cropTop && delta > CHANNEL_TOLERANCE;
      if (isChanged) changed += 1;
      out[i] = isChanged ? 230 : gray;
      out[i + 1] = isChanged ? 30 : gray;
      out[i + 2] = isChanged ? 60 : gray;
      out[i + 3] = 255;
    }
  }

  const ratio = changed / (width * (height - cropTop));
  if (changed > 0) {
    await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(diffFile);
  }
  return { ratio };
}

function writeSummary(lines) {
  const body = ['## Sheet gallery visual diff', '', `Platform: \`${platform}\``, '', ...lines, ''].join('\n');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, 'summary.md'), body);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, body);
}

async function main() {
  const names = expectedNames();
  const screenshots = findScreenshots();

  const readsFromOutDir = fromDir && path.resolve(fromDir).startsWith(outDir);
  if (!readsFromOutDir) rmSync(outDir, { recursive: true, force: true });
  rmSync(diffOutDir, { recursive: true, force: true });
  mkdirSync(currentOutDir, { recursive: true });
  mkdirSync(diffOutDir, { recursive: true });

  const failures = [];
  const warnings = [];
  const passes = [];

  for (const name of names) {
    const shot = screenshots.get(name);
    if (!shot) {
      failures.push(`\`${name}\`: no screenshot found (did the Maestro flow finish?)`);
      continue;
    }
    const caseName = name.replace(/^sheet-gallery-/, '');
    const currentCopy = path.join(currentOutDir, `${name}.png`);
    if (path.resolve(shot.file) !== path.resolve(currentCopy)) copyFileSync(shot.file, currentCopy);

    const baselineFile = path.join(baselineDir, `${caseName}.png`);
    if (update) {
      mkdirSync(baselineDir, { recursive: true });
      copyFileSync(shot.file, baselineFile);
      passes.push(`\`${caseName}\`: baseline updated`);
      continue;
    }
    if (!existsSync(baselineFile)) {
      const message = `\`${caseName}\`: no baseline yet (download the sheet-gallery-${platform} artifact and run with --update --from <dir>)`;
      (strict ? failures : warnings).push(message);
      continue;
    }

    const result = await diffImages(baselineFile, currentCopy, path.join(diffOutDir, `${caseName}-diff.png`));
    if (result.sizeMismatch) {
      const message = `\`${caseName}\`: screenshot size changed (${result.sizeMismatch}); different device or orientation`;
      (strict || isCi ? failures : warnings).push(message);
      continue;
    }
    const percent = (result.ratio * 100).toFixed(2);
    if (result.ratio > maxDiffRatio) {
      failures.push(`\`${caseName}\`: ${percent}% of pixels changed (limit ${(maxDiffRatio * 100).toFixed(2)}%)`);
    } else {
      passes.push(`\`${caseName}\`: ${percent}% changed`);
    }
  }

  const section = (title, items) => (items.length ? [`### ${title}`, '', ...items.map((item) => `- ${item}`), ''] : []);
  writeSummary([...section('Failed', failures), ...section('Warnings', warnings), ...section('Passed', passes)]);

  for (const item of passes) console.log(`ok    ${item}`);
  for (const item of warnings) console.warn(`warn  ${item}`);
  for (const item of failures) console.error(`FAIL  ${item}`);
  console.log(`\nScreenshots: ${currentOutDir}\nDiffs: ${diffOutDir}`);

  if (failures.length > 0) {
    console.error(
      '\nIf the change is intentional, update baselines:\n' +
        `  node apps/mobile/scripts/compare-sheet-gallery.mjs --platform ${platform} --update --from <screenshots dir>`,
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
