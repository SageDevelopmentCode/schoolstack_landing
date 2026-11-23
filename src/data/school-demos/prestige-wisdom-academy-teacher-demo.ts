export {
  PRESTIGE_WISDOM_ACADEMY_LOGO as PRESTIGE_WISDOM_ACADEMY_TEACHER_LOGO,
} from "./prestige-wisdom-academy-admin-demo";

export const PRESTIGE_WISDOM_ACADEMY_TEACHER_OFFICE = "PWA Office";
export const PRESTIGE_WISDOM_ACADEMY_TEACHER_ACCENT = "#0C1C45";
export const PRESTIGE_WISDOM_ACADEMY_TEACHER_ACCENT_HOVER = "#1C3060";

export const PRESTIGE_WISDOM_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  elementary: "Elementary",
  middle: "Middle School",
};

export const PRESTIGE_WISDOM_ACADEMY_TEACHER_PROGRAM_ORDER = ["elementary", "middle"] as const;

import { PRESTIGE_WISDOM_ACADEMY_ADMIN_LOGO } from "./prestige-wisdom-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const prestigeWisdomAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "prestige-wisdom-academy",
  logo: PRESTIGE_WISDOM_ACADEMY_ADMIN_LOGO,
  accent: PRESTIGE_WISDOM_ACADEMY_TEACHER_ACCENT,
  accentHover: PRESTIGE_WISDOM_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: PRESTIGE_WISDOM_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: PRESTIGE_WISDOM_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: PRESTIGE_WISDOM_ACADEMY_TEACHER_OFFICE,
  },
};
