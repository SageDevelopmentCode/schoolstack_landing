export {
  SPYRJA_ACADEMY_NEW_BRAUNFELS_LOGO as SPYRJA_ACADEMY_NEW_BRAUNFELS_TEACHER_LOGO,
} from "./spyrja-academy-new-braunfels-admin-demo";

export const SPYRJA_ACADEMY_NEW_BRAUNFELS_TEACHER_OFFICE = "Spyrja Office";
export const SPYRJA_ACADEMY_NEW_BRAUNFELS_TEACHER_ACCENT = "#0A6966";
export const SPYRJA_ACADEMY_NEW_BRAUNFELS_TEACHER_ACCENT_HOVER = "#0D807C";

export const SPYRJA_ACADEMY_NEW_BRAUNFELS_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  middle: "Middle grades (6th–8th)",
  high: "High school (9th–12th)",
};

export const SPYRJA_ACADEMY_NEW_BRAUNFELS_TEACHER_PROGRAM_ORDER = ["middle", "high"] as const;

import { SPYRJA_ACADEMY_NEW_BRAUNFELS_ADMIN_LOGO } from "./spyrja-academy-new-braunfels-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const spyrjaAcademyNewBraunfelsTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "spyrja-academy-new-braunfels",
  logo: SPYRJA_ACADEMY_NEW_BRAUNFELS_ADMIN_LOGO,
  accent: SPYRJA_ACADEMY_NEW_BRAUNFELS_TEACHER_ACCENT,
  accentHover: SPYRJA_ACADEMY_NEW_BRAUNFELS_TEACHER_ACCENT_HOVER,
  programLabels: SPYRJA_ACADEMY_NEW_BRAUNFELS_TEACHER_PROGRAM_LABELS,
  programOrder: SPYRJA_ACADEMY_NEW_BRAUNFELS_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: SPYRJA_ACADEMY_NEW_BRAUNFELS_TEACHER_OFFICE,
  },
};
