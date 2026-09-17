export {
  THE_FOCUS_ACADEMY_LOGO as THE_FOCUS_ACADEMY_TEACHER_LOGO,
} from "./the-focus-academy-admin-demo";

export const THE_FOCUS_ACADEMY_TEACHER_OFFICE = "The FOCUS Academy Office";
export const THE_FOCUS_ACADEMY_TEACHER_ACCENT = "#2C8C8C";
export const THE_FOCUS_ACADEMY_TEACHER_ACCENT_HOVER = "#173B5B";

export const THE_FOCUS_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  four_day: "4-Day Program",
  two_day: "2-Day Program",
};

export const THE_FOCUS_ACADEMY_TEACHER_PROGRAM_ORDER = [
  "four_day",
  "two_day",
] as const;

import { THE_FOCUS_ACADEMY_ADMIN_LOGO } from "./the-focus-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const theFocusAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "the-focus-academy",
  logo: THE_FOCUS_ACADEMY_ADMIN_LOGO,
  accent: THE_FOCUS_ACADEMY_TEACHER_ACCENT,
  accentHover: THE_FOCUS_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: THE_FOCUS_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: THE_FOCUS_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: THE_FOCUS_ACADEMY_TEACHER_OFFICE,
  },
};
