export {
  FOOTHILL_CHRISTIAN_ACADEMY_LOGO as FOOTHILL_CHRISTIAN_ACADEMY_TEACHER_LOGO,
} from "./foothill-christian-academy-admin-demo";

export const FOOTHILL_CHRISTIAN_ACADEMY_TEACHER_OFFICE = "FCA Office";
export const FOOTHILL_CHRISTIAN_ACADEMY_TEACHER_ACCENT = "#1E3556";
export const FOOTHILL_CHRISTIAN_ACADEMY_TEACHER_ACCENT_HOVER = "#2C4A73";

export const FOOTHILL_CHRISTIAN_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  lower: "Pre-K–5th grade",
  upper: "6th–9th grade",
};

export const FOOTHILL_CHRISTIAN_ACADEMY_TEACHER_PROGRAM_ORDER = ["lower", "upper"] as const;

import { FOOTHILL_CHRISTIAN_ACADEMY_ADMIN_LOGO } from "./foothill-christian-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const foothillChristianAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "foothill-christian-academy",
  logo: FOOTHILL_CHRISTIAN_ACADEMY_ADMIN_LOGO,
  accent: FOOTHILL_CHRISTIAN_ACADEMY_TEACHER_ACCENT,
  accentHover: FOOTHILL_CHRISTIAN_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: FOOTHILL_CHRISTIAN_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: FOOTHILL_CHRISTIAN_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: FOOTHILL_CHRISTIAN_ACADEMY_TEACHER_OFFICE,
  },
};
