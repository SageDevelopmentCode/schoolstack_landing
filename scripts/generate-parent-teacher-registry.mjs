#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEMO_DIR = path.join(ROOT, "src/components/demo");
const DATA_DIR = path.join(ROOT, "src/data/school-demos");
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

function discoverSchools() {
  const schools = [];
  for (const folder of fs.readdirSync(DEMO_DIR)) {
    const dir = path.join(DEMO_DIR, folder);
    if (!fs.statSync(dir).isDirectory() || ["shared", "mobile"].includes(folder)) continue;
    const websiteFile = fs.readdirSync(dir).find((f) => f.endsWith("WebsiteDashboardDemo.tsx"));
    const parentFile = fs.readdirSync(dir).find((f) => f.endsWith("ParentDashboardDemo.tsx"));
    const teacherFile = fs.readdirSync(dir).find((f) => f.endsWith("TeacherDashboardDemo.tsx"));
    if (!websiteFile || !parentFile || !teacherFile) continue;
    const websiteSrc = read(path.join(dir, websiteFile));
    const parentSrc = read(path.join(dir, parentFile));
    const teacherSrc = read(path.join(dir, teacherFile));
    const slug = websiteSrc.match(/from "@\/data\/school-demos\/([^"]+)";/)?.[1];
    const parentDataFile = parentSrc.match(
      /from "@\/data\/school-demos\/([^"]+-parent-demo)";/,
    )?.[1];
    const teacherDataFile = teacherSrc.match(
      /from "@\/data\/school-demos\/([^"]+-teacher-demo)";/,
    )?.[1];
    if (!slug || !parentDataFile || !teacherDataFile) continue;
    schools.push({ slug, parentDataFile, teacherDataFile, custom: slug === ROOTED_MEADOWS });
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

function parseParentExports(parentDataFile) {
  const src = read(path.join(DATA_DIR, `${parentDataFile}.ts`));
  const accent = src.match(/export const (\w+_PARENT_ACCENT)/)?.[1];
  const accentHover = src.match(/export const (\w+_PARENT_ACCENT_HOVER)/)?.[1];
  const logo =
    src.match(/export const (\w+_PARENT_LOGO)/)?.[1] ??
    src.match(/(\w+_PARENT_LOGO),/)?.[1];
  const schoolName = src.match(/export const (\w+_PARENT_SCHOOL_NAME)/)?.[1];
  const schoolShort = src.match(/export const (\w+_PARENT_SCHOOL_SHORT)/)?.[1];
  const office = src.match(/export const (\w+_PARENT_OFFICE)/)?.[1];
  if (!accent || !accentHover || !logo) {
    throw new Error(`parse parent exports failed: ${parentDataFile}`);
  }
  return { accent, accentHover, logo, schoolName, schoolShort, office };
}

function parseTeacherExports(teacherDataFile) {
  const src = read(path.join(DATA_DIR, `${teacherDataFile}.ts`));
  const logo =
    src.match(/export const (\w+_TEACHER_LOGO)/)?.[1] ??
    src.match(/(\w+_TEACHER_LOGO),/)?.[1] ??
    src.match(/(\w+_TEACHER_LOGO)\s*\}/)?.[1];
  const office = src.match(/export const (\w+_TEACHER_OFFICE)/)?.[1];
  const accent = src.match(/export const (\w+_TEACHER_ACCENT)/)?.[1];
  const accentHover = src.match(/export const (\w+_TEACHER_ACCENT_HOVER)/)?.[1];
  const labels = src.match(/export const (\w+_TEACHER_PROGRAM_LABELS)/)?.[1];
  const order = src.match(/export const (\w+_TEACHER_PROGRAM_ORDER)/)?.[1];
  if (!logo || !office || !accent || !accentHover || !labels || !order) {
    throw new Error(`parse teacher exports failed: ${teacherDataFile}`);
  }
  return { logo, office, accent, accentHover, labels, order };
}

const schools = discoverSchools();

for (const school of schools) {
  if (school.custom) continue;
  const website = parseWebsite(school.slug);
  const parent = parseParentExports(school.parentDataFile);
  const teacher = parseTeacherExports(school.teacherDataFile);
  const camel = slugToCamel(school.slug);

  const parentPath = path.join(DATA_DIR, `${school.parentDataFile}.ts`);
  const parentExisting = read(parentPath);
  if (!parentExisting.includes(`${camel}ParentDemoConfig`)) {
    const parentBlock = `

import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const ${camel}ParentDemoConfig: SchoolParentDemoConfig = {
  slug: "${school.slug}",
  logo: ${parent.logo},
  colors: {
    accent: ${parent.accent},
    accentHover: ${parent.accentHover},
  },
  copy: {
    schoolName: ${parent.schoolName ?? JSON.stringify(website.schoolName)},
    schoolShortName: ${parent.schoolShort ?? JSON.stringify(website.schoolShortName)},
    officeName: ${parent.office ?? JSON.stringify(`${website.schoolName.split("—")[0].trim()} Office`)},
  },
};
`;
    write(parentPath, `${parentExisting.trim()}\n${parentBlock}`);
  }

  const teacherPath = path.join(DATA_DIR, `${school.teacherDataFile}.ts`);
  const teacherExisting = read(teacherPath);
  if (!teacherExisting.includes(`${camel}TeacherDemoConfig`)) {
    const teacherBlock = `

import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const ${camel}TeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "${school.slug}",
  logo: ${teacher.logo},
  accent: ${teacher.accent},
  accentHover: ${teacher.accentHover},
  programLabels: ${teacher.labels},
  programOrder: ${teacher.order},
  copy: {
    officeName: ${teacher.office},
  },
};
`;
    write(teacherPath, `${teacherExisting.trim()}\n${teacherBlock}`);
  }
}

const registry = read(path.join(DATA_DIR, "dashboard-registry.ts"));
const parentImports = [];
const parentEntries = [];
const teacherImports = [];
const teacherEntries = [];

for (const school of schools) {
  if (school.custom) continue;
  const camel = slugToCamel(school.slug);
  parentImports.push(
    `import { ${camel}ParentDemoConfig } from "./${school.parentDataFile}";`,
  );
  parentEntries.push(`  "${school.slug}": ${camel}ParentDemoConfig,`);
  teacherImports.push(
    `import { ${camel}TeacherDemoConfig } from "./${school.teacherDataFile}";`,
  );
  teacherEntries.push(`  "${school.slug}": ${camel}TeacherDemoConfig,`);
}

const extended = `${registry.trim()}

import type { SchoolParentDemoConfig, SchoolTeacherDemoConfig } from "./demo-dashboard-types";
${parentImports.join("\n")}

export const schoolParentDemoConfigs: Record<string, SchoolParentDemoConfig> = {
${parentEntries.join("\n")}
};

${teacherImports.join("\n")}

export const schoolTeacherDemoConfigs: Record<string, SchoolTeacherDemoConfig> = {
${teacherEntries.join("\n")}
};
`;

write(path.join(DATA_DIR, "dashboard-registry.ts"), `${extended}\n`);
console.log(`Extended registry with parent/teacher for ${schools.filter((s) => !s.custom).length} schools`);
