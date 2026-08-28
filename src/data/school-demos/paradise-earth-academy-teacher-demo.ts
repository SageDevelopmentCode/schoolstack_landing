export {
  PARADISE_EARTH_ACADEMY_LOGO as PARADISE_EARTH_ACADEMY_TEACHER_LOGO,
} from "./paradise-earth-academy-admin-demo";

export const PARADISE_EARTH_ACADEMY_TEACHER_OFFICE = "Paradise Earth Academy Office";
export const PARADISE_EARTH_ACADEMY_TEACHER_ACCENT = "#EB8444";
export const PARADISE_EARTH_ACADEMY_TEACHER_ACCENT_HOVER = "#D9732F";

export const PARADISE_EARTH_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  academic_program: "Academic Program",
  nature_day: "Nature Day",
  horsemanship: "Horsemanship",
  electives: "Electives",
};

export const PARADISE_EARTH_ACADEMY_TEACHER_PROGRAM_ORDER = [
  "academic_program",
  "nature_day",
  "horsemanship",
  "electives",
] as const;


import { PARADISE_EARTH_ACADEMY_ADMIN_LOGO } from "./paradise-earth-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const paradiseEarthAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "paradise-earth-academy",
  logo: PARADISE_EARTH_ACADEMY_ADMIN_LOGO,
  accent: PARADISE_EARTH_ACADEMY_TEACHER_ACCENT,
  accentHover: PARADISE_EARTH_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: PARADISE_EARTH_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: PARADISE_EARTH_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: PARADISE_EARTH_ACADEMY_TEACHER_OFFICE,
  },
};
