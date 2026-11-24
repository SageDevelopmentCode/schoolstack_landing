export {
  RENEWED_ROOTS_FOREST_SCHOOL_LOGO as RENEWED_ROOTS_FOREST_SCHOOL_TEACHER_LOGO,
} from "./renewed-roots-forest-school-admin-demo";

export const RENEWED_ROOTS_FOREST_SCHOOL_TEACHER_OFFICE = "Renewed Roots Office";
export const RENEWED_ROOTS_FOREST_SCHOOL_TEACHER_ACCENT = "#3D5C4F";
export const RENEWED_ROOTS_FOREST_SCHOOL_TEACHER_ACCENT_HOVER = "#4C6E60";

export const RENEWED_ROOTS_FOREST_SCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  wanderers: "Wanderers (3–5)",
  trailblazers: "Trailblazers (6–11)",
  stewards: "Stewards (12–16)",
};

export const RENEWED_ROOTS_FOREST_SCHOOL_TEACHER_PROGRAM_ORDER = ["wanderers", "trailblazers", "stewards"] as const;

import { RENEWED_ROOTS_FOREST_SCHOOL_ADMIN_LOGO } from "./renewed-roots-forest-school-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const renewedRootsForestSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "renewed-roots-forest-school",
  logo: RENEWED_ROOTS_FOREST_SCHOOL_ADMIN_LOGO,
  accent: RENEWED_ROOTS_FOREST_SCHOOL_TEACHER_ACCENT,
  accentHover: RENEWED_ROOTS_FOREST_SCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: RENEWED_ROOTS_FOREST_SCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: RENEWED_ROOTS_FOREST_SCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: RENEWED_ROOTS_FOREST_SCHOOL_TEACHER_OFFICE,
  },
};
