export {
  IGNITE_MICROSCHOOL_LOGO as IGNITE_MICROSCHOOL_TEACHER_LOGO,
} from "./ignite-microschool-admin-demo";

export const IGNITE_MICROSCHOOL_TEACHER_OFFICE = "Ignite Office";
export const IGNITE_MICROSCHOOL_TEACHER_ACCENT = "#16649F";
export const IGNITE_MICROSCHOOL_TEACHER_ACCENT_HOVER = "#1B75BC";

export const IGNITE_MICROSCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  younger: "Ages 6–8 (mornings)",
  older: "Ages 9–12 (afternoons)",
};

export const IGNITE_MICROSCHOOL_TEACHER_PROGRAM_ORDER = ["younger", "older"] as const;

import { IGNITE_MICROSCHOOL_ADMIN_LOGO } from "./ignite-microschool-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const igniteMicroschoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "ignite-microschool",
  logo: IGNITE_MICROSCHOOL_ADMIN_LOGO,
  accent: IGNITE_MICROSCHOOL_TEACHER_ACCENT,
  accentHover: IGNITE_MICROSCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: IGNITE_MICROSCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: IGNITE_MICROSCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: IGNITE_MICROSCHOOL_TEACHER_OFFICE,
  },
};
