export {
  ROOTS_AND_WINGS_LOGO as ROOTS_AND_WINGS_TEACHER_LOGO,
} from "./roots-and-wings-microschool-admin-demo";

export const ROOTS_AND_WINGS_TEACHER_OFFICE = "Roots and Wings Microschool Office";
export const ROOTS_AND_WINGS_TEACHER_ACCENT = "#2E6B63";
export const ROOTS_AND_WINGS_TEACHER_ACCENT_HOVER = "#1F514A";

export const ROOTS_AND_WINGS_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  grades_k2: "K–2 Program",
  grades_38: "Grades 3–8",
};

export const ROOTS_AND_WINGS_TEACHER_PROGRAM_ORDER = [
  "grades_k2",
  "grades_38",
] as const;

import { ROOTS_AND_WINGS_ADMIN_LOGO } from "./roots-and-wings-microschool-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const rootsAndWingsMicroschoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "roots-and-wings-microschool",
  logo: ROOTS_AND_WINGS_ADMIN_LOGO,
  accent: ROOTS_AND_WINGS_TEACHER_ACCENT,
  accentHover: ROOTS_AND_WINGS_TEACHER_ACCENT_HOVER,
  programLabels: ROOTS_AND_WINGS_TEACHER_PROGRAM_LABELS,
  programOrder: ROOTS_AND_WINGS_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: ROOTS_AND_WINGS_TEACHER_OFFICE,
  },
};
