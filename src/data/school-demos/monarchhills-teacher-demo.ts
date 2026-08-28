export {
  MONARCH_HILLS_ADMIN_LOGO as MONARCH_HILLS_TEACHER_LOGO,
} from "./monarchhills-admin-demo";

export const MONARCH_HILLS_TEACHER_OFFICE = "Monarch Hills Education Office";
export const MONARCH_HILLS_TEACHER_ACCENT = "#233975";
export const MONARCH_HILLS_TEACHER_ACCENT_HOVER = "#1B2D5C";

export const MONARCH_HILLS_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  summer_26: "Full-Time · 5 Days",
  school_year_26_27: "Part-Time · 4 Days",
  homeschool_drop_in: "Part-Time · 3 Days",
};

export const MONARCH_HILLS_TEACHER_PROGRAM_ORDER = [
  "summer_26",
  "school_year_26_27",
  "homeschool_drop_in",
] as const;


import { MONARCH_HILLS_ADMIN_LOGO } from "./monarchhills-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const monarchHillsEducationTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "monarch-hills-education",
  logo: MONARCH_HILLS_ADMIN_LOGO,
  accent: MONARCH_HILLS_TEACHER_ACCENT,
  accentHover: MONARCH_HILLS_TEACHER_ACCENT_HOVER,
  programLabels: MONARCH_HILLS_TEACHER_PROGRAM_LABELS,
  programOrder: MONARCH_HILLS_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: MONARCH_HILLS_TEACHER_OFFICE,
  },
};
