export {
  ELITE_PERFORMANCE_PREP_FREEPORT_LOGO as ELITE_PERFORMANCE_PREP_FREEPORT_TEACHER_LOGO,
} from "./elite-performance-prep-freeport-admin-demo";

export const ELITE_PERFORMANCE_PREP_FREEPORT_TEACHER_OFFICE = "Elite Freeport Office";
export const ELITE_PERFORMANCE_PREP_FREEPORT_TEACHER_ACCENT = "#0F172A";
export const ELITE_PERFORMANCE_PREP_FREEPORT_TEACHER_ACCENT_HOVER = "#1E293B";

export const ELITE_PERFORMANCE_PREP_FREEPORT_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  lower: "K–4th grade",
  upper: "5th–8th grade",
};

export const ELITE_PERFORMANCE_PREP_FREEPORT_TEACHER_PROGRAM_ORDER = ["lower", "upper"] as const;

import { ELITE_PERFORMANCE_PREP_FREEPORT_ADMIN_LOGO } from "./elite-performance-prep-freeport-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const elitePerformancePrepFreeportTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "elite-performance-prep-freeport",
  logo: ELITE_PERFORMANCE_PREP_FREEPORT_ADMIN_LOGO,
  accent: ELITE_PERFORMANCE_PREP_FREEPORT_TEACHER_ACCENT,
  accentHover: ELITE_PERFORMANCE_PREP_FREEPORT_TEACHER_ACCENT_HOVER,
  programLabels: ELITE_PERFORMANCE_PREP_FREEPORT_TEACHER_PROGRAM_LABELS,
  programOrder: ELITE_PERFORMANCE_PREP_FREEPORT_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: ELITE_PERFORMANCE_PREP_FREEPORT_TEACHER_OFFICE,
  },
};
