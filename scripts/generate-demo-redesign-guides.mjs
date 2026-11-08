#!/usr/bin/env node
/**
 * Generates guides/demos/{slug}_redesign_guide.md from school website config files.
 * Run: node scripts/generate-demo-redesign-guides.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const configDir = path.join(root, "src/data/school-demos");
const outDir = path.join(root, "guides/demos");

const skip = new Set([
  "types",
  "default",
  "index",
  "dashboard-registry",
  "walkthrough-placeholder",
  "demo-dashboard-types",
]);

const configFiles = fs
  .readdirSync(configDir)
  .filter((f) => f.endsWith(".ts") && !f.includes("-admin-") && !f.includes("-parent-") && !f.includes("-teacher-"))
  .filter((f) => !skip.has(f.replace(/\.ts$/, "").replace(/-/g, "_")));

function extractField(src, field) {
  const re = new RegExp(`${field}:\\s*["'\`]([^"'\`]+)["'\`]`, "m");
  const m = src.match(re);
  return m?.[1] ?? "";
}

function extractThemeHex(src, key) {
  const re = new RegExp(`${key}:\\s*["'\`](#[0-9A-Fa-f]{3,8})["'\`]`, "m");
  return src.match(re)?.[1] ?? "";
}

function headlineFromSrc(src) {
  const block = src.match(/headline:\s*\[([\s\S]*?)\]/m);
  if (!block) return "";
  const lines = [...block[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
  return lines.join(" ");
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const rows = [];

for (const file of configFiles.sort()) {
  const slug = file.replace(/\.ts$/, "");
  const src = fs.readFileSync(path.join(configDir, file), "utf8");
  if (!src.includes("SchoolWebsiteDemoConfig")) continue;

  const schoolName = extractField(src, "schoolName") || slug;
  const primary = extractThemeHex(src, "primary");
  const dark = extractThemeHex(src, "dark");
  const lightBg = extractThemeHex(src, "lightBg");
  const muted = extractThemeHex(src, "muted");
  const headline = headlineFromSrc(src);
  const subhead = extractField(src, "subheadline").slice(0, 200);

  const guide = `# ${schoolName} redesign extraction guide

Bright school-website demo refresh (MudKitchen concept site). Generated from \`src/data/school-demos/${slug}.ts\` — reconcile against the live school site before shipping copy changes.

## Brand snapshot

- Demo slug: \`${slug}\`
- Preview: \`/demo/${slug === "monarch-hills-education" ? "monarch-hills" : slug}\`
- Positioning (from config hero): ${headline || "—"}
- Subhead: ${subhead || "—"}

## Bright demo palette mapping

| Demo token | Config field | Current hex |
|---|---|---|
| Primary CTA accent | \`theme.primary\` | ${primary || "—"} |
| Ink band / dark pills | \`theme.dark\` | ${dark || "—"} |
| Section tint base | bright \`#EEF3EC\` + primary mix | \`var(--demo-section-tint)\` |
| Soft sections | \`theme.lightBg\` | ${lightBg || "—"} |
| Body muted | \`theme.muted\` | ${muted || "—"} |
| Page canvas | \`theme.pageBg\` | #FFFFFF |

## Typography

- Demo shell: Poppins via \`SchoolDemoWebsiteFonts\` (bright layout)
- Headings: \`BOLD_HEADING\` + school \`DEMO_ACCENT_HIGHLIGHT\` on hero accent line

## Content checklist

- [ ] Hero headline accent line index matches bright highlight
- [ ] Programs, FAQ, form copy aligned with live site
- [ ] Stock imagery alt text / disclaimers where used
- [ ] Section toggles (\`sections.*\`) appropriate for bright layout density

## Template

Shared UI: \`WebsiteDashboardDemo\` + \`bright-demo-theme.ts\`. No per-school React forks unless signature section type is required.
`;

  const outPath = path.join(outDir, `${slug}_redesign_guide.md`);
  fs.writeFileSync(outPath, guide);
  rows.push({ slug, schoolName, guide: outPath });
}

const readme = `# Demo school redesign guides

Bright-layout refresh for \`/demo/{slug}\` concept websites. One guide per registry school.

| Slug | School | Guide | Bright refresh |
|---|---|---|---|
${rows.map((r) => `| \`${r.slug}\` | ${r.schoolName} | [${r.slug}_redesign_guide.md](./${r.slug}_redesign_guide.md) | 2026-11-07 |`).join("\n")}
`;

fs.writeFileSync(path.join(outDir, "README.md"), readme);
console.log(`Wrote ${rows.length} guides to guides/demos/`);
