#!/usr/bin/env node
/**
 * Dedupe per-school Admin/Parent/Teacher dashboard demo TSX copies into shared
 * components + per-school config/data files.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEMO_DIR = path.join(ROOT, "src/components/demo");
const DATA_DIR = path.join(ROOT, "src/data/school-demos");
const SHARED_DIR = path.join(DEMO_DIR, "shared");
const CONTENT_DIR = path.join(DATA_DIR, "admin-content");

const ROOTED_MEADOWS_SLUG = "rooted-meadows";
const CANONICAL_FOLDER = "lufflearning";
const CANONICAL_SLUG = "luff-learning";

const CONTENT_CONSTS = [
  "DEMO_EVENTS",
  "DEMO_LEADS",
  "DEMO_EMAILS",
];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function extractConstBlock(source, constName) {
  const marker = `const ${constName}`;
  const start = source.indexOf(marker);
  if (start === -1) return null;

  const eqIndex = source.indexOf("=", start);
  if (eqIndex === -1) return null;

  let i = eqIndex + 1;
  while (i < source.length && /\s/.test(source[i])) i++;

  const open = source[i];
  if (open !== "[" && open !== "{") return null;

  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let j = i; j < source.length; j++) {
    const ch = source[j];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === stringChar) inString = false;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === open) depth++;
    if (ch === close) {
      depth--;
      if (depth === 0) {
        let end = j + 1;
        while (end < source.length && source[end] === ";") end++;
        return source.slice(start, end);
      }
    }
  }

  return null;
}

function normalizeForCompare(text, replacements) {
  let out = text;
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  return out.replace(/\s+/g, " ").trim();
}

function discoverSchools() {
  const schools = [];
  for (const folder of fs.readdirSync(DEMO_DIR)) {
    const folderPath = path.join(DEMO_DIR, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    if (folder === "shared" || folder === "mobile" || folder === "rootedmeadows") {
      if (folder === "rootedmeadows") {
        schools.push({
          folder,
          slug: ROOTED_MEADOWS_SLUG,
          custom: true,
        });
      }
      continue;
    }

    const adminFiles = fs
      .readdirSync(folderPath)
      .filter((f) => f.endsWith("AdminDashboardDemo.tsx"));
    if (adminFiles.length !== 1) continue;

    const adminFile = adminFiles[0];
    const slug = inferSlugFromDataFiles(folder, adminFile);
    schools.push({ folder, slug, adminFile, custom: false });
  }
  return schools.sort((a, b) => a.slug.localeCompare(b.slug));
}

function inferSlugFromDataFiles(folder, adminFile) {
  const brand = adminFile.replace("AdminDashboardDemo.tsx", "");
  const kebab = brand
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/Microschool/g, "-microschool")
    .replace(/MicroSchool/g, "-micro-school")
    .toLowerCase();

  const candidates = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith("-admin-demo.ts"))
    .map((f) => f.replace("-admin-demo.ts", ""));

  const exact = candidates.find((c) => c.replace(/-/g, "") === folder.replace(/-/g, ""));
  if (exact) return exact;

  const fuzzy = candidates.find((c) => c.includes(kebab) || kebab.includes(c.replace(/-/g, "")));
  if (fuzzy) return fuzzy;

  throw new Error(`Could not infer slug for folder ${folder}`);
}

function transformAdminToShared(source) {
  let out = source;

  out = out.replace(
    /import \{\s*LUFF_LEARNING_ADMIN_COLORS,\s*LUFF_LEARNING_ADMIN_COMPACT_ROWS,\s*LUFF_LEARNING_ADMIN_LOGO,\s*\} from "@\/data\/school-demos\/luff-learning-admin-demo";\n/,
    `import type { SchoolAdminDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import {
  applyAdminDemoRuntime,
  getAdminDemoLogo,
  getAdminCompactRows,
} from "@/components/demo/shared/admin-demo-runtime";
`,
  );

  out = out.replace(/LUFF_LEARNING_ADMIN_COLORS\./g, "ADMIN_DEMO_COLORS.");

  out = out.replace(
    /const C_LIGHT = \{[\s\S]*?r: \{ sm: "3px", md: "5px", lg: "6px", xl: "8px", full: "9999px" \},\n\};/,
    `function buildCLight(adminColors: typeof ADMIN_DEMO_COLORS) {
  return {
    bg: adminColors.bg,
    surface: "#FFFFFF",
    elevated: "#FDFCFB",
    input: "#FAFAFA",
    inputBorder: "#E4E4E7",
    border: adminColors.border,
    borderStrong: adminColors.borderStrong,
    accent: adminColors.accent,
    accentBright: adminColors.accentBright,
    accentLight: adminColors.accentLight,
    secondaryBtnBorder: adminColors.secondaryBtnBorder,
    accentGlow: adminColors.accentGlow,
    accentMid: adminColors.accentMid,
    accentDark: adminColors.accentDark,
    clay: adminColors.clay,
    clayBg: adminColors.clayBg,
    clayBorder: adminColors.clayBorder,
    textPrimary: adminColors.textPrimary,
    textSecondary: adminColors.textSecondary,
    textTertiary: "#8A7B6E",
    textQuaternary: "#B8A898",
    success: "#16A34A",
    successBg: "rgba(22, 163, 74, 0.08)",
    successBorder: "rgba(22, 163, 74, 0.25)",
    warning: "#D97706",
    warningBg: "rgba(217, 119, 6, 0.08)",
    warningBorder: "rgba(217, 119, 6, 0.25)",
    error: "#DC2626",
    errorBg: "rgba(220, 38, 38, 0.08)",
    errorBorder: "rgba(220, 38, 38, 0.25)",
    info: "#0284C7",
    infoBg: "rgba(2, 132, 199, 0.08)",
    infoBorder: "rgba(2, 132, 199, 0.25)",
    purple: "#7C3AED",
    purpleBg: "rgba(124, 58, 237, 0.08)",
    purpleBorder: "rgba(124, 58, 237, 0.25)",
    shadowCard: "0 1px 3px rgba(43,36,29,0.06), 0 1px 2px rgba(43,36,29,0.04)",
    shadowMedium: "0 4px 16px rgba(43,36,29,0.08)",
    r: { sm: "3px", md: "5px", lg: "6px", xl: "8px", full: "9999px" },
  };
}`,
  );

  out = out.replace(
    /\/\/ mutable — set before each render so all sub-components pick it up\nconst C = C_LIGHT;/,
    `// mutable — updated before each render via applyAdminDemoRuntime
let C = buildCLight(ADMIN_DEMO_COLORS);`,
  );

  out = out.replace(/LUFF_LEARNING_ADMIN_COMPACT_ROWS/g, "getAdminCompactRows()");

  out = out.replace(
    /src=\{LUFF_LEARNING_ADMIN_LOGO\.src\}[\s\S]*?height=\{LUFF_LEARNING_ADMIN_LOGO\.height \?\? 40\}/,
    `src={getAdminDemoLogo().src}
          alt={getAdminDemoLogo().alt}
          width={isExpanded ? (getAdminDemoLogo().width ?? 160) : 36}
          height={getAdminDemoLogo().height ?? 40}`,
  );

  out = out.replace(
    /export default function LuffLearningAdminDashboardDemo\(\{/,
    `export default function SchoolAdminDashboardDemo({
  config,
`,
  );

  out = out.replace(
    /}: \{\n  disableTour\?: boolean/,
    `}: {
  config: SchoolAdminDemoConfig;
  disableTour?: boolean`,
  );

  out = out.replace(
    /export default function SchoolAdminDashboardDemo\(\{\n  config,\n  disableTour/,
    `export default function SchoolAdminDashboardDemo({
  config,
  disableTour`,
  );

  const insertRuntime = `
  applyAdminDemoRuntime(config);
`;

  out = out.replace(
    /(export default function SchoolAdminDashboardDemo\(\{[\s\S]*?\}\) \{\n)/,
    `$1${insertRuntime}`,
  );

  for (const constName of CONTENT_CONSTS) {
    out = out.replace(
      new RegExp(`const ${constName} =`, "g"),
      `let ${constName} =`,
    );
  }

  out = out.replace(
    'subtitle="Luff Learning Fine Arts Academy — Spring, TX · 2026–27 Enrollment"',
    "subtitle={ADMIN_DEMO_COPY.locationSubtitle}",
  );

  return out;
}

function transformParentToShared(source, prefix, parentDataImport) {
  let out = source;
  out = out.replace(
    new RegExp(`import \\{ ${prefix}_PARENT_LOGO \\} from "@/data/school-demos/[^"]+";\\n`),
    `import type { SchoolParentDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import { getParentDemoLogo } from "@/components/demo/shared/parent-demo-runtime";
`,
  );
  out = out.replace(new RegExp(`${prefix}_PARENT_LOGO`, "g"), "getParentDemoLogo()");
  out = out.replace(
    /export default function \w+ParentDashboardDemo\(\{/,
    `export default function SchoolParentDashboardDemo({
  config,
`,
  );
  out = out.replace(
    /}: \{\n  disableTour/,
    `}: {
  config: SchoolParentDemoConfig;
  disableTour`,
  );
  out = out.replace(
    /(export default function SchoolParentDashboardDemo\(\{[\s\S]*?\}\) \{\n)/,
    `$1  applyParentDemoRuntime(config);\n`,
  );
  out = out.replace(
    /import type \{ SchoolParentDemoConfig \} from "@\/data\/school-demos\/demo-dashboard-types";\nimport \{ getParentDemoLogo \} from "@\/components\/demo\/shared\/parent-demo-runtime";\n/,
    `import type { SchoolParentDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import {
  applyParentDemoRuntime,
  getParentDemoLogo,
} from "@/components/demo/shared/parent-demo-runtime";
`,
  );
  return out;
}

function transformTeacherToShared(source, prefix) {
  let out = source;
  out = out.replace(
    new RegExp(`import \\{[\\s\\S]*?\\} from "@/data/school-demos/[^"]+-teacher-demo";\\n`),
    `import type { SchoolTeacherDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import { applyTeacherDemoRuntime } from "@/components/demo/shared/teacher-demo-runtime";
`,
  );
  out = out.replace(
    /export default function \w+TeacherDashboardDemo\(\{/,
    `export default function SchoolTeacherDashboardDemo({
  config,
`,
  );
  out = out.replace(
    /}: \{\n  disableTour/,
    `}: {
  config: SchoolTeacherDemoConfig;
  disableTour`,
  );
  out = out.replace(
    /(export default function SchoolTeacherDashboardDemo\(\{[\s\S]*?\}\) \{\n)/,
    `$1  applyTeacherDemoRuntime(config);\n`,
  );
  return out;
}

function parseAdminDemoExports(adminDemoPath) {
  const src = read(adminDemoPath);
  const logoMatch = src.match(/export const \w+_LOGO = (\{[\s\S]*?\}) as const;/);
  const colorsMatch = src.match(/export const \w+_ADMIN_COLORS = (\{[\s\S]*?\}) as const;/);
  const compactMatch = src.match(/export const \w+_ADMIN_COMPACT_ROWS = (\d+);/);
  if (!logoMatch || !colorsMatch || !compactMatch) {
    throw new Error(`Could not parse admin demo exports in ${adminDemoPath}`);
  }
  return {
    logo: logoMatch[1],
    colors: colorsMatch[1],
    compactRows: compactMatch[1],
  };
}

function parseParentDemoExports(parentDemoPath) {
  const src = read(parentDemoPath);
  const accentMatch = src.match(/export const \w+_PARENT_ACCENT = "([^"]+)";/);
  const hoverMatch = src.match(/export const \w+_PARENT_ACCENT_HOVER = "([^"]+)";/);
  const nameMatch = src.match(/export const \w+_PARENT_SCHOOL_NAME = "([^"]+)";/);
  const shortMatch = src.match(/export const \w+_PARENT_SCHOOL_SHORT = "([^"]+)";/);
  const officeMatch = src.match(/export const \w+_PARENT_OFFICE = "([^"]+)";/);
  return {
    accent: accentMatch?.[1] ?? "#769a61",
    accentHover: hoverMatch?.[1] ?? "#5f824f",
    schoolName: nameMatch?.[1] ?? "School",
    schoolShortName: shortMatch?.[1] ?? "School",
    officeName: officeMatch?.[1] ?? "School Office",
  };
}

function parseTeacherDemoExports(teacherDemoPath) {
  const src = read(teacherDemoPath);
  const officeMatch = src.match(/export const \w+_TEACHER_OFFICE = "([^"]+)";/);
  const accentMatch = src.match(/export const \w+_TEACHER_ACCENT = "([^"]+)";/);
  const hoverMatch = src.match(/export const \w+_TEACHER_ACCENT_HOVER = "([^"]+)";/);
  const labelsMatch = src.match(
    /export const \w+_TEACHER_PROGRAM_LABELS: Record<string, string> = (\{[\s\S]*?\});/,
  );
  const orderMatch = src.match(
    /export const \w+_TEACHER_PROGRAM_ORDER = (\[[\s\S]*?\]) as const;/,
  );
  return {
    officeName: officeMatch?.[1] ?? "School Office",
    accent: accentMatch?.[1] ?? "#769a61",
    accentHover: hoverMatch?.[1] ?? "#5f824f",
    programLabels: labelsMatch?.[1] ?? "{}",
    programOrder: orderMatch?.[1] ?? "[]",
  };
}

function buildAdminConfigExport(slug, websiteConfig, adminParsed, contentOverrides) {
  const copy = {
    schoolName: websiteConfig.schoolName,
    schoolShortName:
      websiteConfig.schoolName.split(" ")[0] +
      (websiteConfig.schoolName.includes("Learning") ? " Learning" : ""),
    officeName: `${websiteConfig.schoolName.split("—")[0].trim()} Office`,
    locationSubtitle: `${websiteConfig.schoolName} — ${websiteConfig.hero?.subheadline?.includes("TX") ? "Spring, TX" : websiteConfig.form?.heading ? "" : ""}2026–27 Enrollment`.replace(
      " — 2026",
      " — 2026",
    ),
  };

  // Try to read subtitle from school's admin demo if present
  const adminDemoFile = findAdminDemoFileForSlug(slug);
  if (adminDemoFile) {
    const src = read(adminDemoFile);
    const subtitleMatch = src.match(/subtitle="([^"]+)"/);
    if (subtitleMatch) copy.locationSubtitle = subtitleMatch[1];
  }

  const overrideBlock = contentOverrides
    ? `,\n  contentOverrides: ${JSON.stringify(contentOverrides, null, 2).replace(/"([^"]+)":/g, "$1:")}`
    : "";

  return `import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const ${toCamelCase(slug)}AdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "${slug}",
  logo: ${adminParsed.logo} as const,
  colors: ${adminParsed.colors} as const,
  compactRows: ${adminParsed.compactRows},
  copy: ${JSON.stringify(copy, null, 2)}${overrideBlock},
};
`;
}

function findAdminDemoFileForSlug(slug) {
  for (const school of discoverSchools()) {
    if (school.slug === slug && school.adminFile) {
      return path.join(DEMO_DIR, school.folder, school.adminFile);
    }
  }
  return null;
}

function toCamelCase(slug) {
  return slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function loadWebsiteConfig(slug) {
  const configPath = path.join(DATA_DIR, `${slug}.ts`);
  const src = read(configPath);
  const nameMatch = src.match(/schoolName:\s*"([^"]+)"/);
  const heroMatch = src.match(/subheadline:\s*"([^"]+)"/);
  return {
    schoolName: nameMatch?.[1] ?? slug,
    hero: { subheadline: heroMatch?.[1] ?? "" },
    form: {},
  };
}

function extractContentOverrides(schoolSource, canonicalSource, replacements) {
  const overrides = {};
  for (const constName of CONTENT_CONSTS) {
    const schoolBlock = extractConstBlock(schoolSource, constName);
    const canonicalBlock = extractConstBlock(canonicalSource, constName);
    if (!schoolBlock || !canonicalBlock) continue;
    const normalizedSchool = normalizeForCompare(schoolBlock, replacements);
    const normalizedCanonical = normalizeForCompare(canonicalBlock, []);
    if (normalizedSchool !== normalizedCanonical) {
      const value = schoolBlock.replace(/^const \w+ = /, "").replace(/;$/, "");
      overrides[constName.replace("DEMO_", "demo").replace(/_([a-z])/g, (_, c) => c.toUpperCase())] =
        `__INJECT__${value}`;
    }
  }
  return overrides;
}

function buildContentOverrideFile(slug, overrides) {
  if (Object.keys(overrides).length === 0) return null;
  const lines = [`/** Content overrides for ${slug} admin demo. */`, ""];
  const exportFields = [];
  for (const [key, value] of Object.entries(overrides)) {
    if (typeof value === "string" && value.startsWith("__INJECT__")) {
      const raw = value.replace("__INJECT__", "");
      const constName = key.replace(/([A-Z])/g, "_$1").toUpperCase();
      lines.push(`export const ${constName} = ${raw};`);
      exportFields.push(key);
    }
  }
  lines.push("");
  lines.push("export const adminContentOverrides = {");
  for (const key of exportFields) {
    const constName = key.replace(/([A-Z])/g, "_$1").toUpperCase();
    lines.push(`  ${key}: ${constName},`);
  }
  lines.push("};");
  lines.push("");
  return lines.join("\n");
}

function appendConfigExport(adminDemoPath, configExportName, configVar) {
  const src = read(adminDemoPath);
  if (src.includes(configExportName)) return;
  write(
    adminDemoPath,
    `${src.trim()}\n\nimport { ${configVar} } from "./demo-dashboard-configs";\nexport { ${configVar} as ${configExportName} };\n`,
  );
}

function main() {
  const schools = discoverSchools();
  const canonicalAdminPath = path.join(
    DEMO_DIR,
    CANONICAL_FOLDER,
    "LuffLearningAdminDashboardDemo.tsx",
  );
  const canonicalAdminSource = read(canonicalAdminPath);

  fs.mkdirSync(SHARED_DIR, { recursive: true });
  fs.mkdirSync(CONTENT_DIR, { recursive: true });

  const sharedAdmin = transformAdminToShared(canonicalAdminSource);
  write(path.join(SHARED_DIR, "SchoolAdminDashboardDemo.tsx"), sharedAdmin);

  const canonicalParentPath = path.join(
    DEMO_DIR,
    CANONICAL_FOLDER,
    "LuffLearningParentDashboardDemo.tsx",
  );
  const sharedParent = transformParentToShared(
    read(canonicalParentPath),
    "LUFF_LEARNING",
  );
  write(path.join(SHARED_DIR, "SchoolParentDashboardDemo.tsx"), sharedParent);

  const canonicalTeacherPath = path.join(
    DEMO_DIR,
    CANONICAL_FOLDER,
    "LuffLearningTeacherDashboardDemo.tsx",
  );
  const sharedTeacher = transformTeacherToShared(
    read(canonicalTeacherPath),
    "LUFF_LEARNING",
  );
  write(path.join(SHARED_DIR, "SchoolTeacherDashboardDemo.tsx"), sharedTeacher);

  const adminConfigs = [];
  const parentConfigs = [];
  const teacherConfigs = [];

  for (const school of schools) {
    if (school.custom) continue;

    const adminDemoPath = path.join(DATA_DIR, `${school.slug}-admin-demo.ts`);
    const parentDemoPath = path.join(DATA_DIR, `${school.slug}-parent-demo.ts`);
    const teacherDemoPath = path.join(DATA_DIR, `${school.slug}-teacher-demo.ts`);
    const website = loadWebsiteConfig(school.slug);
    const adminParsed = parseAdminDemoExports(adminDemoPath);

    const schoolAdminSource = read(
      path.join(DEMO_DIR, school.folder, school.adminFile),
    );

    const replacements = [
      // generic normalization - school-specific replacements handled per file in real extraction
    ];

    const overrides = extractContentOverrides(
      schoolAdminSource,
      canonicalAdminSource,
      replacements,
    );

    let contentImport = "";
    const contentFile = buildContentOverrideFile(school.slug, overrides);
    if (contentFile) {
      const contentPath = path.join(CONTENT_DIR, `${school.slug}.ts`);
      write(contentPath, contentFile);
      contentImport = `\nimport { adminContentOverrides } from "./admin-content/${school.slug}";`;
    }

    const camel = toCamelCase(school.slug);
    adminConfigs.push({ slug: school.slug, var: `${camel}AdminDemoConfig` });
  }

  console.log(`Processed ${adminConfigs.length} schools for admin config extraction`);
  console.log(`Wrote shared components to ${SHARED_DIR}`);
  console.log("Run phase 2 manually to wire registry and delete old files.");
}

main();
