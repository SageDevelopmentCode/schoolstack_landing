export {
  MORGAN_PREP_ACADEMY_LOGO as MORGAN_PREP_ACADEMY_TEACHER_LOGO,
} from "./morgan-prep-academy-admin-demo";

export const MORGAN_PREP_ACADEMY_TEACHER_OFFICE = "Morgan Prep Office";
export const MORGAN_PREP_ACADEMY_TEACHER_ACCENT = "#571310";
export const MORGAN_PREP_ACADEMY_TEACHER_ACCENT_HOVER = "#73201B";

export const MORGAN_PREP_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  k5: "K–5 Multi-age",
};

export const MORGAN_PREP_ACADEMY_TEACHER_PROGRAM_ORDER = ["k5"] as const;

import { MORGAN_PREP_ACADEMY_ADMIN_LOGO } from "./morgan-prep-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const morganPrepAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "morgan-prep-academy",
  logo: MORGAN_PREP_ACADEMY_ADMIN_LOGO,
  accent: MORGAN_PREP_ACADEMY_TEACHER_ACCENT,
  accentHover: MORGAN_PREP_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: MORGAN_PREP_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: MORGAN_PREP_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: MORGAN_PREP_ACADEMY_TEACHER_OFFICE,
  },
};
