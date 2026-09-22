import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";
import {
  SAGEFIELD_ADMIN_LOGO as SAGEFIELD_TEACHER_LOGO,
} from "./sagefield-admin-demo";

export { SAGEFIELD_TEACHER_LOGO };

export const SAGEFIELD_TEACHER_OFFICE = "Sage Field Office";
export const SAGEFIELD_TEACHER_ACCENT = "#5E7C68";
export const SAGEFIELD_TEACHER_ACCENT_HOVER = "#374B3F";
export const SAGEFIELD_TEACHER_CORAL = "#f29a8f";

export const SAGEFIELD_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  summer_26: "Summer Program",
  school_year_26_27: "Primary Program · Ages 4–11",
  homeschool_drop_in: "Forest School Drop-In",
};

export const SAGEFIELD_TEACHER_PROGRAM_ORDER = [
  "summer_26",
  "school_year_26_27",
  "homeschool_drop_in",
] as const;

export const sagefieldTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "sagefield",
  logo: SAGEFIELD_TEACHER_LOGO,
  accent: SAGEFIELD_TEACHER_ACCENT,
  accentHover: SAGEFIELD_TEACHER_ACCENT_HOVER,
  programLabels: SAGEFIELD_TEACHER_PROGRAM_LABELS,
  programOrder: SAGEFIELD_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: SAGEFIELD_TEACHER_OFFICE,
  },
};
