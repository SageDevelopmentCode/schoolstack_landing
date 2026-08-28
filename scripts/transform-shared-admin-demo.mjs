#!/usr/bin/env node
/** One-shot transform for SchoolAdminDashboardDemo.tsx */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/demo/shared/SchoolAdminDashboardDemo.tsx",
);

let src = fs.readFileSync(file, "utf8");

src = src.replace(
  `import {
  LUFF_LEARNING_ADMIN_COLORS,
  LUFF_LEARNING_ADMIN_COMPACT_ROWS,
  LUFF_LEARNING_ADMIN_LOGO,
} from "@/data/school-demos/luff-learning-admin-demo";`,
  `import type { SchoolAdminDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import {
  ADMIN_DEMO_COLORS,
  ADMIN_DEMO_COPY,
  applyAdminDemoRuntime,
  getAdminDemoLogo,
  getAdminCompactRows,
} from "@/components/demo/shared/admin-demo-runtime";`,
);

src = src.replaceAll("LUFF_LEARNING_ADMIN_COLORS.", "ADMIN_DEMO_COLORS.");

src = src.replace(
  `const C_LIGHT = {
  bg: ADMIN_DEMO_COLORS.bg,
  surface: "#FFFFFF",
  elevated: "#FDFCFB",
  input: "#FAFAFA",
  inputBorder: "#E4E4E7",
  border: ADMIN_DEMO_COLORS.border,
  borderStrong: ADMIN_DEMO_COLORS.borderStrong,
  accent: ADMIN_DEMO_COLORS.accent,
  accentBright: ADMIN_DEMO_COLORS.accentBright,
  accentLight: ADMIN_DEMO_COLORS.accentLight,
  secondaryBtnBorder: ADMIN_DEMO_COLORS.secondaryBtnBorder,
  accentGlow: ADMIN_DEMO_COLORS.accentGlow,
  accentMid: ADMIN_DEMO_COLORS.accentMid,
  accentDark: ADMIN_DEMO_COLORS.accentDark,
  clay: ADMIN_DEMO_COLORS.clay,
  clayBg: ADMIN_DEMO_COLORS.clayBg,
  clayBorder: ADMIN_DEMO_COLORS.clayBorder,
  textPrimary: ADMIN_DEMO_COLORS.textPrimary,
  textSecondary: ADMIN_DEMO_COLORS.textSecondary,
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

// mutable — set before each render so all sub-components pick it up
const C = C_LIGHT;`,
  `function buildCLight() {
  return {
    bg: ADMIN_DEMO_COLORS.bg,
    surface: "#FFFFFF",
    elevated: "#FDFCFB",
    input: "#FAFAFA",
    inputBorder: "#E4E4E7",
    border: ADMIN_DEMO_COLORS.border,
    borderStrong: ADMIN_DEMO_COLORS.borderStrong,
    accent: ADMIN_DEMO_COLORS.accent,
    accentBright: ADMIN_DEMO_COLORS.accentBright,
    accentLight: ADMIN_DEMO_COLORS.accentLight,
    secondaryBtnBorder: ADMIN_DEMO_COLORS.secondaryBtnBorder,
    accentGlow: ADMIN_DEMO_COLORS.accentGlow,
    accentMid: ADMIN_DEMO_COLORS.accentMid,
    accentDark: ADMIN_DEMO_COLORS.accentDark,
    clay: ADMIN_DEMO_COLORS.clay,
    clayBg: ADMIN_DEMO_COLORS.clayBg,
    clayBorder: ADMIN_DEMO_COLORS.clayBorder,
    textPrimary: ADMIN_DEMO_COLORS.textPrimary,
    textSecondary: ADMIN_DEMO_COLORS.textSecondary,
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
}

// mutable — updated before each render via syncAdminDemoPalette
const C = buildCLight();

function syncAdminDemoPalette() {
  Object.assign(C, buildCLight());
}`,
);

for (const name of ["DEMO_EVENTS", "DEMO_LEADS", "DEMO_EMAILS"]) {
  src = src.replace(`const ${name} =`, `let ${name} =`);
}

src = src.replaceAll("LUFF_LEARNING_ADMIN_COMPACT_ROWS", "getAdminCompactRows()");

src = src.replace(
  `const ACTIVE_DEMO_STUDENTS: DemoStudent[] = DEMO_STUDENTS_P2.slice(0, getAdminCompactRows());
const ACTIVE_DEMO_PARENTS: DemoParent[] = DEMO_PARENTS.slice(0, getAdminCompactRows());
const ACTIVE_DEMO_FAMILIES: DemoFamilyBilling[] = DEMO_FAMILY_BILLING.slice(0, getAdminCompactRows());
const ACTIVE_DEMO_LEADS: DemoLead[] = DEMO_LEADS.slice(0, getAdminCompactRows());`,
  `let ACTIVE_DEMO_STUDENTS: DemoStudent[] = DEMO_STUDENTS_P2.slice(0, getAdminCompactRows());
let ACTIVE_DEMO_PARENTS: DemoParent[] = DEMO_PARENTS.slice(0, getAdminCompactRows());
let ACTIVE_DEMO_FAMILIES: DemoFamilyBilling[] = DEMO_FAMILY_BILLING.slice(0, getAdminCompactRows());
let ACTIVE_DEMO_LEADS: DemoLead[] = DEMO_LEADS.slice(0, getAdminCompactRows());

function syncActiveDemoRows() {
  const rows = getAdminCompactRows();
  ACTIVE_DEMO_STUDENTS = DEMO_STUDENTS_P2.slice(0, rows);
  ACTIVE_DEMO_PARENTS = DEMO_PARENTS.slice(0, rows);
  ACTIVE_DEMO_FAMILIES = DEMO_FAMILY_BILLING.slice(0, rows);
  ACTIVE_DEMO_LEADS = DEMO_LEADS.slice(0, rows);
}

function applySchoolAdminDemoConfig(config: SchoolAdminDemoConfig) {
  applyAdminDemoRuntime(config);
  syncAdminDemoPalette();
  const overrides = config.contentOverrides;
  if (overrides?.demoEvents) DEMO_EVENTS = overrides.demoEvents as typeof DEMO_EVENTS;
  if (overrides?.demoLeads) DEMO_LEADS = overrides.demoLeads as typeof DEMO_LEADS;
  if (overrides?.demoEmails) DEMO_EMAILS = overrides.demoEmails as typeof DEMO_EMAILS;
  syncActiveDemoRows();
}`,
);

src = src.replace(
  `src={LUFF_LEARNING_ADMIN_LOGO.src}
          alt={LUFF_LEARNING_ADMIN_LOGO.alt}
          width={isExpanded ? (LUFF_LEARNING_ADMIN_LOGO.width ?? 160) : 36}
          height={LUFF_LEARNING_ADMIN_LOGO.height ?? 40}`,
  `src={getAdminDemoLogo().src}
          alt={getAdminDemoLogo().alt}
          width={isExpanded ? (getAdminDemoLogo().width ?? 160) : 36}
          height={getAdminDemoLogo().height ?? 40}`,
);

src = src.replace(
  'subtitle="Luff Learning Fine Arts Academy — Spring, TX · 2026–27 Enrollment"',
  "subtitle={ADMIN_DEMO_COPY.locationSubtitle}",
);

src = src.replace(
  "export default function LuffLearningAdminDashboardDemo({",
  "export default function SchoolAdminDashboardDemo({\n  config,",
);

src = src.replace(
  `}: {
  disableTour?: boolean`,
  `}: {
  config: SchoolAdminDemoConfig;
  disableTour?: boolean`,
);

src = src.replace(
  /export default function SchoolAdminDashboardDemo\(\{\n  config,\n([\s\S]*?)\) \{\n/,
  (match) => `${match}  applySchoolAdminDemoConfig(config);\n`,
);

fs.writeFileSync(file, src);
console.log("Transformed", file);
