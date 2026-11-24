export {
  SAGE_MONTESSORI_NASHVILLE_LOGO as SAGE_MONTESSORI_NASHVILLE_TEACHER_LOGO,
} from "./sage-montessori-nashville-admin-demo";

export const SAGE_MONTESSORI_NASHVILLE_TEACHER_OFFICE = "Sage Montessori Office";
export const SAGE_MONTESSORI_NASHVILLE_TEACHER_ACCENT = "#553F71";
export const SAGE_MONTESSORI_NASHVILLE_TEACHER_ACCENT_HOVER = "#6A5089";

export const SAGE_MONTESSORI_NASHVILLE_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  primary: "Primary (3–6)",
};

export const SAGE_MONTESSORI_NASHVILLE_TEACHER_PROGRAM_ORDER = ["primary"] as const;

import { SAGE_MONTESSORI_NASHVILLE_ADMIN_LOGO } from "./sage-montessori-nashville-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const sageMontessoriNashvilleTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "sage-montessori-nashville",
  logo: SAGE_MONTESSORI_NASHVILLE_ADMIN_LOGO,
  accent: SAGE_MONTESSORI_NASHVILLE_TEACHER_ACCENT,
  accentHover: SAGE_MONTESSORI_NASHVILLE_TEACHER_ACCENT_HOVER,
  programLabels: SAGE_MONTESSORI_NASHVILLE_TEACHER_PROGRAM_LABELS,
  programOrder: SAGE_MONTESSORI_NASHVILLE_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: SAGE_MONTESSORI_NASHVILLE_TEACHER_OFFICE,
  },
};
