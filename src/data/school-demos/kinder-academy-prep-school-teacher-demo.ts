export {
  KINDER_ACADEMY_PREP_SCHOOL_LOGO as KINDER_ACADEMY_PREP_SCHOOL_TEACHER_LOGO,
} from "./kinder-academy-prep-school-admin-demo";

export const KINDER_ACADEMY_PREP_SCHOOL_TEACHER_OFFICE =
  "Kinder Academy Prep School Office";
export const KINDER_ACADEMY_PREP_SCHOOL_TEACHER_ACCENT = "#2B6CB0";
export const KINDER_ACADEMY_PREP_SCHOOL_TEACHER_ACCENT_HOVER = "#225A94";

export const KINDER_ACADEMY_PREP_SCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  prek_k: "Pre-K & Kindergarten",
  grades_1_3: "Grades 1–3",
};

export const KINDER_ACADEMY_PREP_SCHOOL_TEACHER_PROGRAM_ORDER = [
  "prek_k",
  "grades_1_3",
] as const;


import { KINDER_ACADEMY_PREP_SCHOOL_ADMIN_LOGO } from "./kinder-academy-prep-school-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const kinderAcademyPrepSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "kinder-academy-prep-school",
  logo: KINDER_ACADEMY_PREP_SCHOOL_ADMIN_LOGO,
  accent: KINDER_ACADEMY_PREP_SCHOOL_TEACHER_ACCENT,
  accentHover: KINDER_ACADEMY_PREP_SCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: KINDER_ACADEMY_PREP_SCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: KINDER_ACADEMY_PREP_SCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: KINDER_ACADEMY_PREP_SCHOOL_TEACHER_OFFICE,
  },
};
