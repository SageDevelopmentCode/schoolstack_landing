export {
  DESERT_SUN_RANCH_ACADEMY_LOGO as DESERT_SUN_RANCH_ACADEMY_TEACHER_LOGO,
} from "./desert-sun-ranch-academy-admin-demo";

export const DESERT_SUN_RANCH_ACADEMY_TEACHER_OFFICE = "Desert Sun Ranch Office";
export const DESERT_SUN_RANCH_ACADEMY_TEACHER_ACCENT = "#2F6E3B";
export const DESERT_SUN_RANCH_ACADEMY_TEACHER_ACCENT_HOVER = "#3B8549";

export const DESERT_SUN_RANCH_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  lower: "K–4th grade",
  upper: "5th–8th grade",
};

export const DESERT_SUN_RANCH_ACADEMY_TEACHER_PROGRAM_ORDER = ["lower", "upper"] as const;

import { DESERT_SUN_RANCH_ACADEMY_ADMIN_LOGO } from "./desert-sun-ranch-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const desertSunRanchAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "desert-sun-ranch-academy",
  logo: DESERT_SUN_RANCH_ACADEMY_ADMIN_LOGO,
  accent: DESERT_SUN_RANCH_ACADEMY_TEACHER_ACCENT,
  accentHover: DESERT_SUN_RANCH_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: DESERT_SUN_RANCH_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: DESERT_SUN_RANCH_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: DESERT_SUN_RANCH_ACADEMY_TEACHER_OFFICE,
  },
};
