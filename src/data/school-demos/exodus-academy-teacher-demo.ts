export {
  EXODUS_ACADEMY_LOGO as EXODUS_ACADEMY_TEACHER_LOGO,
} from "./exodus-academy-admin-demo";

export const EXODUS_ACADEMY_TEACHER_OFFICE = "Exodus Office";
export const EXODUS_ACADEMY_TEACHER_ACCENT = "#4F0A62";
export const EXODUS_ACADEMY_TEACHER_ACCENT_HOVER = "#651C7A";

export const EXODUS_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  lower: "Genesis Kids–5th grade",
  upper: "6th–12th grade",
};

export const EXODUS_ACADEMY_TEACHER_PROGRAM_ORDER = ["lower", "upper"] as const;

import { EXODUS_ACADEMY_ADMIN_LOGO } from "./exodus-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const exodusAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "exodus-academy",
  logo: EXODUS_ACADEMY_ADMIN_LOGO,
  accent: EXODUS_ACADEMY_TEACHER_ACCENT,
  accentHover: EXODUS_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: EXODUS_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: EXODUS_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: EXODUS_ACADEMY_TEACHER_OFFICE,
  },
};
