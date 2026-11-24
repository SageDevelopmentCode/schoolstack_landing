export {
  EVERROOT_ACADEMY_LOGO as EVERROOT_ACADEMY_TEACHER_LOGO,
} from "./everroot-academy-admin-demo";

export const EVERROOT_ACADEMY_TEACHER_OFFICE = "EverRoot Academy Office";
export const EVERROOT_ACADEMY_TEACHER_ACCENT = "#154A47";
export const EVERROOT_ACADEMY_TEACHER_ACCENT_HOVER = "#1F615D";

export const EVERROOT_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  g35: "3rd–5th",
  g68: "6th–8th",
  tutoring: "Targeted Tutoring",
};

export const EVERROOT_ACADEMY_TEACHER_PROGRAM_ORDER = ["g35", "g68", "tutoring"] as const;

import { EVERROOT_ACADEMY_ADMIN_LOGO } from "./everroot-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const everrootAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "everroot-academy",
  logo: EVERROOT_ACADEMY_ADMIN_LOGO,
  accent: EVERROOT_ACADEMY_TEACHER_ACCENT,
  accentHover: EVERROOT_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: EVERROOT_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: EVERROOT_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: EVERROOT_ACADEMY_TEACHER_OFFICE,
  },
};
