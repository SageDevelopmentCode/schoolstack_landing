export {
  WONDERHERE_LOGO as WONDERHERE_TEACHER_LOGO,
} from "./wonderhere-admin-demo";

export const WONDERHERE_TEACHER_OFFICE = "WonderHere Lakeland Office";
export const WONDERHERE_TEACHER_ACCENT = "#3D5A45";
export const WONDERHERE_TEACHER_ACCENT_HOVER = "#2D4533";

export const WONDERHERE_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  schoolhouse: "Lakeland Schoolhouse",
  friday_school: "Friday School",
  farm_programs: "Farm Programs",
  summer_camps: "Summer Camps",
};

export const WONDERHERE_TEACHER_PROGRAM_ORDER = [
  "schoolhouse",
  "friday_school",
  "farm_programs",
  "summer_camps",
] as const;


import { WONDERHERE_ADMIN_LOGO } from "./wonderhere-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const wonderhereLakelandTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "wonderhere-lakeland",
  logo: WONDERHERE_ADMIN_LOGO,
  accent: WONDERHERE_TEACHER_ACCENT,
  accentHover: WONDERHERE_TEACHER_ACCENT_HOVER,
  programLabels: WONDERHERE_TEACHER_PROGRAM_LABELS,
  programOrder: WONDERHERE_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: WONDERHERE_TEACHER_OFFICE,
  },
};
