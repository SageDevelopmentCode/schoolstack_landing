export {
  TRUE_NORTH_ADMIN_LOGO as TRUE_NORTH_TEACHER_LOGO,
} from "./truenorth-admin-demo";

export const TRUE_NORTH_TEACHER_OFFICE = "True North Office";
export const TRUE_NORTH_TEACHER_ACCENT = "#254EDB";
export const TRUE_NORTH_TEACHER_ACCENT_HOVER = "#1D3FB0";

export const TRUE_NORTH_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  summer_26: "Lower School · Grades 1–4",
  school_year_26_27: "Middle School · Grades 5–8",
  homeschool_drop_in: "High School · Grades 9–12",
};

export const TRUE_NORTH_TEACHER_PROGRAM_ORDER = [
  "summer_26",
  "school_year_26_27",
  "homeschool_drop_in",
] as const;


import { TRUE_NORTH_ADMIN_LOGO } from "./truenorth-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const trueNorthTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "true-north",
  logo: TRUE_NORTH_ADMIN_LOGO,
  accent: TRUE_NORTH_TEACHER_ACCENT,
  accentHover: TRUE_NORTH_TEACHER_ACCENT_HOVER,
  programLabels: TRUE_NORTH_TEACHER_PROGRAM_LABELS,
  programOrder: TRUE_NORTH_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: TRUE_NORTH_TEACHER_OFFICE,
  },
};
