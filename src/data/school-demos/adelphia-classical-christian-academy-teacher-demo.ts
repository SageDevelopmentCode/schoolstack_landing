export {
  ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_LOGO as ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_TEACHER_LOGO,
} from "./adelphia-classical-christian-academy-admin-demo";

export const ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_TEACHER_OFFICE = "Adelphia Office";
export const ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_TEACHER_ACCENT = "#16284C";
export const ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_TEACHER_ACCENT_HOVER = "#263C68";

export const ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  grammar: "K–4th (Grammar)",
  middle: "5th–8th (Middle)",
  high: "9th–12th (High school)",
};

export const ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_TEACHER_PROGRAM_ORDER = ["grammar", "middle", "high"] as const;

import { ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_ADMIN_LOGO } from "./adelphia-classical-christian-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const adelphiaClassicalChristianAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "adelphia-classical-christian-academy",
  logo: ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_ADMIN_LOGO,
  accent: ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_TEACHER_ACCENT,
  accentHover: ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_TEACHER_OFFICE,
  },
};
