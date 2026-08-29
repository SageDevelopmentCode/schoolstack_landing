#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEMO_DIR = path.join(ROOT, "src/components/demo");
const DATA_DIR = path.join(ROOT, "src/data/school-demos");
const CONTENT_DIR = path.join(DATA_DIR, "admin-content");
const CANONICAL = path.join(DEMO_DIR, "lufflearning/LuffLearningAdminDashboardDemo.tsx");
const ROOTED_MEADOWS = "rooted-meadows";

function read(p) {
  return fs.readFileSync(p, "utf8");
}
function write(p, c) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, c);
}
function slugToCamel(slug) {
  return slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function extractConst(source, name) {
  const marker = `const ${name} =`;
  const start = source.indexOf(marker);
  if (start === -1) return null;
  const eq = source.indexOf("=", start);
  let i = eq + 1;
  while (i < source.length && /\s/.test(source[i])) i++;
  const open = source[i];
  if (open !== "[" && open !== "{") return null;
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let inStr = false;
  let q = "";
  let esc = false;
  for (let j = i; j < source.length; j++) {
    const ch = source[j];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (ch === q) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = true;
      q = ch;
      continue;
    }
    if (ch === open) depth++;
    if (ch === close) {
      depth--;
      if (depth === 0) {
        let end = j + 1;
        while (end < source.length && source[end] === ";") end++;
        return source.slice(i, end);
      }
    }
  }
  return null;
}

function discoverSchools() {
  const schools = [];
  for (const folder of fs.readdirSync(DEMO_DIR)) {
    const dir = path.join(DEMO_DIR, folder);
    if (!fs.statSync(dir).isDirectory() || ["shared", "mobile"].includes(folder)) continue;
    const websiteFile = fs.readdirSync(dir).find((f) => f.endsWith("WebsiteDashboardDemo.tsx"));
    const adminFile = fs.readdirSync(dir).find((f) => f.endsWith("AdminDashboardDemo.tsx"));
    if (!websiteFile || !adminFile) continue;
    const websiteSrc = read(path.join(dir, websiteFile));
    const adminSrc = read(path.join(dir, adminFile));
    const slug = websiteSrc.match(/from "@\/data\/school-demos\/([^"]+)";/)?.[1];
    const adminDataFile = adminSrc.match(
      /from "@\/data\/school-demos\/([^"]+-admin-demo)";/,
    )?.[1];
    if (!slug || !adminDataFile) continue;
    schools.push({ folder, slug, adminDataFile, adminFile, custom: slug === ROOTED_MEADOWS });
  }
  return schools.sort((a, b) => a.slug.localeCompare(b.slug));
}

function parseWebsite(slug) {
  const src = read(path.join(DATA_DIR, `${slug}.ts`));
  const schoolName = src.match(/schoolName:\s*"([^"]+)"/)?.[1] ?? slug;
  const schoolShortName =
    src.match(/schoolShortName:\s*"([^"]+)"/)?.[1] ??
    schoolName.split(" ").slice(0, 2).join(" ");
  return { schoolName, schoolShortName };
}

function parseAdminExportNames(adminDataFile) {
  const src = read(path.join(DATA_DIR, `${adminDataFile}.ts`));
  const logo = src.match(/export const (\w+_ADMIN_LOGO)/)?.[1];
  const colors = src.match(/export const (\w+_ADMIN_COLORS)/)?.[1];
  const compact = src.match(/export const (\w+_ADMIN_COMPACT_ROWS)/)?.[1];
  if (!logo || !colors || !compact) {
    throw new Error(`parse admin exports failed: ${adminDataFile}`);
  }
  return { logo, colors, compact };
}

const canonical = read(CANONICAL);
const canonicalEvents = extractConst(canonical, "DEMO_EVENTS");
const canonicalLeads = extractConst(canonical, "DEMO_LEADS");
const canonicalEmails = extractConst(canonical, "DEMO_EMAILS");

const schools = discoverSchools();

for (const school of schools) {
  if (school.custom) continue;

  const website = parseWebsite(school.slug);
  const exports = parseAdminExportNames(school.adminDataFile);
  const adminSrc = read(path.join(DEMO_DIR, school.folder, school.adminFile));
  const subtitle =
    adminSrc.match(/subtitle="([^"]+)"/)?.[1] ??
    `${website.schoolName} — 2026–27 Enrollment`;

  const overrides = {};
  const schoolEvents = extractConst(adminSrc, "DEMO_EVENTS");
  const schoolLeads = extractConst(adminSrc, "DEMO_LEADS");
  const schoolEmails = extractConst(adminSrc, "DEMO_EMAILS");
  if (schoolEvents && schoolEvents !== canonicalEvents) overrides.demoEvents = schoolEvents;
  if (schoolLeads && schoolLeads !== canonicalLeads) overrides.demoLeads = schoolLeads;
  if (schoolEmails && schoolEmails !== canonicalEmails) overrides.demoEmails = schoolEmails;

  const camel = slugToCamel(school.slug);
  let contentImport = "";
  let contentField = "";
  if (Object.keys(overrides).length > 0) {
    const lines = [`/** Admin content overrides for ${school.slug}. */`, ""];
    const fields = [];
    if (overrides.demoEvents) {
      lines.push(`export const demoEvents = ${overrides.demoEvents};`);
      fields.push("demoEvents");
    }
    if (overrides.demoLeads) {
      lines.push(`export const demoLeads = ${overrides.demoLeads};`);
      fields.push("demoLeads");
    }
    if (overrides.demoEmails) {
      lines.push(`export const demoEmails = ${overrides.demoEmails};`);
      fields.push("demoEmails");
    }
    lines.push("", "export const adminContentOverrides = {");
    for (const f of fields) lines.push(`  ${f},`);
    lines.push("};", "");
    write(path.join(CONTENT_DIR, `${school.slug}.ts`), lines.join("\n"));
    contentImport = `\nimport { adminContentOverrides as ${camel}AdminContentOverrides } from "./admin-content/${school.slug}";`;
    contentField = `\n  contentOverrides: ${camel}AdminContentOverrides,`;
  }

  const configPath = path.join(DATA_DIR, `${school.adminDataFile}.ts`);
  const existing = read(configPath);
  if (existing.includes(`${camel}AdminDemoConfig`)) continue;

  const block = `${contentImport}

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const ${camel}AdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "${school.slug}",
  logo: ${exports.logo},
  colors: ${exports.colors},
  compactRows: ${exports.compact},
  copy: {
    schoolName: ${JSON.stringify(website.schoolName)},
    schoolShortName: ${JSON.stringify(website.schoolShortName)},
    officeName: ${JSON.stringify(`${website.schoolName.split("—")[0].trim()} Office`)},
    locationSubtitle: ${JSON.stringify(subtitle)},
  },${contentField}
};
`;

  write(configPath, `${existing.trim()}\n${block}`);
}

const registry = [
  `import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";`,
  "",
];
for (const school of schools) {
  if (school.custom) continue;
  const camel = slugToCamel(school.slug);
  registry.push(
    `import { ${camel}AdminDemoConfig } from "./${school.adminDataFile}";`,
  );
}
registry.push(
  "",
  "export const schoolAdminDemoConfigs: Record<string, SchoolAdminDemoConfig> = {",
);
for (const school of schools) {
  if (school.custom) continue;
  registry.push(`  "${school.slug}": ${slugToCamel(school.slug)}AdminDemoConfig,`);
}
registry.push("};", "");
write(path.join(DATA_DIR, "dashboard-registry.ts"), registry.join("\n"));

console.log(`Generated admin registry for ${schools.filter((s) => !s.custom).length} schools`);
