export {
  PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_LOGO as PRESTIGE_HOMESCHOOL_ACADEMY_TEACHER_LOGO,
} from "./prestigehomeschoolacademy-admin-demo";

export const PRESTIGE_HOMESCHOOL_ACADEMY_TEACHER_OFFICE =
  "Prestige Homeschool Academy Office";
export const PRESTIGE_HOMESCHOOL_ACADEMY_TEACHER_ACCENT = "#1087E5";
export const PRESTIGE_HOMESCHOOL_ACADEMY_TEACHER_ACCENT_HOVER = "#0879D4";

export const PRESTIGE_HOMESCHOOL_ACADEMY_TEACHER_PROGRAM_LABELS: Record<
  string,
  string
> = {
  "2_day_academics": "2-Day Subject-Based",
  "2_day_life_skills": "2-Day Life Skills / PBL",
  "4_day_combined": "4-Day Combined Program",
};

export const PRESTIGE_HOMESCHOOL_ACADEMY_TEACHER_PROGRAM_ORDER = [
  "2_day_academics",
  "2_day_life_skills",
  "4_day_combined",
] as const;


import { PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_LOGO } from "./prestigehomeschoolacademy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const prestigeHomeschoolAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "prestige-homeschool-academy",
  logo: PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_LOGO,
  accent: PRESTIGE_HOMESCHOOL_ACADEMY_TEACHER_ACCENT,
  accentHover: PRESTIGE_HOMESCHOOL_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: PRESTIGE_HOMESCHOOL_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: PRESTIGE_HOMESCHOOL_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: PRESTIGE_HOMESCHOOL_ACADEMY_TEACHER_OFFICE,
  },
};
