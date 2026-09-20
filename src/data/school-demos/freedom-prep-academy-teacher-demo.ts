export {
  FREEDOM_PREP_ACADEMY_LOGO as FREEDOM_PREP_ACADEMY_TEACHER_LOGO,
} from "./freedom-prep-academy-admin-demo";

export const FREEDOM_PREP_ACADEMY_TEACHER_OFFICE = "Freedom Prep Academy Office";
export const FREEDOM_PREP_ACADEMY_TEACHER_ACCENT = "#1467B9";
export const FREEDOM_PREP_ACADEMY_TEACHER_ACCENT_HOVER = "#0D2F5D";

export const FREEDOM_PREP_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  online_guided: "Online Guided",
  learning_centers: "Learning Centers",
  microschools: "Microschools",
};

export const FREEDOM_PREP_ACADEMY_TEACHER_PROGRAM_ORDER = [
  "online_guided",
  "learning_centers",
  "microschools",
] as const;

import { FREEDOM_PREP_ACADEMY_ADMIN_LOGO } from "./freedom-prep-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const freedomPrepAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "freedom-prep-academy",
  logo: FREEDOM_PREP_ACADEMY_ADMIN_LOGO,
  accent: FREEDOM_PREP_ACADEMY_TEACHER_ACCENT,
  accentHover: FREEDOM_PREP_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: FREEDOM_PREP_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: FREEDOM_PREP_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: FREEDOM_PREP_ACADEMY_TEACHER_OFFICE,
  },
};
