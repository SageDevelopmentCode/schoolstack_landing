import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";
import {
  ROOTED_MEADOWS_ADMIN_LOGO as ROOTED_MEADOWS_TEACHER_LOGO,
} from "./rootedmeadows-admin-demo";

export { ROOTED_MEADOWS_TEACHER_LOGO };

export const ROOTED_MEADOWS_TEACHER_OFFICE = "Rooted Meadows Office";
export const ROOTED_MEADOWS_TEACHER_ACCENT = "#827096";
export const ROOTED_MEADOWS_TEACHER_ACCENT_HOVER = "#6E5D7F";

export const ROOTED_MEADOWS_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  summer_26: "Waldorf Core K–8",
  school_year_26_27: "Friday BRANCH Program",
  homeschool_drop_in: "Kindergarten",
  farm_to_table: "Farm-to-Table",
};

export const ROOTED_MEADOWS_TEACHER_PROGRAM_ORDER = [
  "summer_26",
  "school_year_26_27",
  "homeschool_drop_in",
  "farm_to_table",
] as const;

export const rootedMeadowsTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "rooted-meadows",
  logo: ROOTED_MEADOWS_TEACHER_LOGO,
  accent: ROOTED_MEADOWS_TEACHER_ACCENT,
  accentHover: ROOTED_MEADOWS_TEACHER_ACCENT_HOVER,
  programLabels: ROOTED_MEADOWS_TEACHER_PROGRAM_LABELS,
  programOrder: ROOTED_MEADOWS_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: ROOTED_MEADOWS_TEACHER_OFFICE,
  },
};
