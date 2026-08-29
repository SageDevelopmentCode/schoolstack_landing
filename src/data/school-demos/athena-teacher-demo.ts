export {
  ATHENA_ADMIN_LOGO as ATHENA_TEACHER_LOGO,
} from "./athena-admin-demo";

export const ATHENA_TEACHER_OFFICE = "Athena Micro-academy Office";
export const ATHENA_TEACHER_ACCENT = "#173B5C";
export const ATHENA_TEACHER_ACCENT_HOVER = "#122D47";

export const ATHENA_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  summer_26: "Full-Time Program",
  school_year_26_27: "Part-Time · 5 Days",
  homeschool_drop_in: "Part-Time · 4 Days",
};

export const ATHENA_TEACHER_PROGRAM_ORDER = [
  "summer_26",
  "school_year_26_27",
  "homeschool_drop_in",
] as const;


import { ATHENA_ADMIN_LOGO } from "./athena-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const athenaMicroacademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "athena-microacademy",
  logo: ATHENA_ADMIN_LOGO,
  accent: ATHENA_TEACHER_ACCENT,
  accentHover: ATHENA_TEACHER_ACCENT_HOVER,
  programLabels: ATHENA_TEACHER_PROGRAM_LABELS,
  programOrder: ATHENA_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: ATHENA_TEACHER_OFFICE,
  },
};
