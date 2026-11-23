export {
  COASTAL_SAGE_MONTESSORI_LOGO as COASTAL_SAGE_MONTESSORI_TEACHER_LOGO,
} from "./coastal-sage-montessori-admin-demo";

export const COASTAL_SAGE_MONTESSORI_TEACHER_OFFICE = "Coastal Sage Montessori Office";
export const COASTAL_SAGE_MONTESSORI_TEACHER_ACCENT = "#1F3856";
export const COASTAL_SAGE_MONTESSORI_TEACHER_ACCENT_HOVER = "#2E4D72";

export const COASTAL_SAGE_MONTESSORI_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  primary: "Primary (3–6)",
  elementary: "Elementary (6–12)",
  adolescent: "Middle & High School",
};

export const COASTAL_SAGE_MONTESSORI_TEACHER_PROGRAM_ORDER = ["primary", "elementary", "adolescent"] as const;

import { COASTAL_SAGE_MONTESSORI_ADMIN_LOGO } from "./coastal-sage-montessori-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const coastalSageMontessoriTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "coastal-sage-montessori",
  logo: COASTAL_SAGE_MONTESSORI_ADMIN_LOGO,
  accent: COASTAL_SAGE_MONTESSORI_TEACHER_ACCENT,
  accentHover: COASTAL_SAGE_MONTESSORI_TEACHER_ACCENT_HOVER,
  programLabels: COASTAL_SAGE_MONTESSORI_TEACHER_PROGRAM_LABELS,
  programOrder: COASTAL_SAGE_MONTESSORI_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: COASTAL_SAGE_MONTESSORI_TEACHER_OFFICE,
  },
};
