export {
  ASHEBORO_HYBRID_ACADEMY_LOGO as ASHEBORO_HYBRID_ACADEMY_TEACHER_LOGO,
} from "./asheboro-hybrid-academy-admin-demo";

export const ASHEBORO_HYBRID_ACADEMY_TEACHER_OFFICE = "Asheboro Hybrid Academy Office";
export const ASHEBORO_HYBRID_ACADEMY_TEACHER_ACCENT = "#0B2545";
export const ASHEBORO_HYBRID_ACADEMY_TEACHER_ACCENT_HOVER = "#07192F";

export const ASHEBORO_HYBRID_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  elementary: "Elementary School",
  middle_school: "Middle School",
  high_school: "High School",
};

export const ASHEBORO_HYBRID_ACADEMY_TEACHER_PROGRAM_ORDER = [
  "elementary",
  "middle_school",
  "high_school",
] as const;

import { ASHEBORO_HYBRID_ACADEMY_ADMIN_LOGO } from "./asheboro-hybrid-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const asheboroHybridAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "asheboro-hybrid-academy",
  logo: ASHEBORO_HYBRID_ACADEMY_ADMIN_LOGO,
  accent: ASHEBORO_HYBRID_ACADEMY_TEACHER_ACCENT,
  accentHover: ASHEBORO_HYBRID_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: ASHEBORO_HYBRID_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: ASHEBORO_HYBRID_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: ASHEBORO_HYBRID_ACADEMY_TEACHER_OFFICE,
  },
};
