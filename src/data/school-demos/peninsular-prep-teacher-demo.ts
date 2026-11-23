export {
  PENINSULAR_PREP_LOGO as PENINSULAR_PREP_TEACHER_LOGO,
} from "./peninsular-prep-admin-demo";

export const PENINSULAR_PREP_TEACHER_OFFICE = "Pen Prep Front Office";
export const PENINSULAR_PREP_TEACHER_ACCENT = "#29457D";
export const PENINSULAR_PREP_TEACHER_ACCENT_HOVER = "#365A9C";

export const PENINSULAR_PREP_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  elementary: "Elementary Division (K–5)",
  middle: "Middle Division (6–8)",
};

export const PENINSULAR_PREP_TEACHER_PROGRAM_ORDER = ["elementary", "middle"] as const;

import { PENINSULAR_PREP_ADMIN_LOGO } from "./peninsular-prep-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const peninsularPrepTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "peninsular-prep",
  logo: PENINSULAR_PREP_ADMIN_LOGO,
  accent: PENINSULAR_PREP_TEACHER_ACCENT,
  accentHover: PENINSULAR_PREP_TEACHER_ACCENT_HOVER,
  programLabels: PENINSULAR_PREP_TEACHER_PROGRAM_LABELS,
  programOrder: PENINSULAR_PREP_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: PENINSULAR_PREP_TEACHER_OFFICE,
  },
};
