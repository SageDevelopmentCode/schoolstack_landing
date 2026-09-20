export {
  FAMILY_LYCEUM_LOGO as FAMILY_LYCEUM_TEACHER_LOGO,
} from "./family-lyceum-admin-demo";

export const FAMILY_LYCEUM_TEACHER_OFFICE = "Family Lyceum Office";
export const FAMILY_LYCEUM_TEACHER_ACCENT = "#20364A";
export const FAMILY_LYCEUM_TEACHER_ACCENT_HOVER = "#122534";

export const FAMILY_LYCEUM_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  firefly: "FIREFLY Preschool",
  elementary: "Elementary (SPARK–EMBER)",
  junior_high: "Junior High (FLARE & TORCH)",
};

export const FAMILY_LYCEUM_TEACHER_PROGRAM_ORDER = [
  "firefly",
  "elementary",
  "junior_high",
] as const;

import { FAMILY_LYCEUM_ADMIN_LOGO } from "./family-lyceum-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const familyLyceumTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "family-lyceum",
  logo: FAMILY_LYCEUM_ADMIN_LOGO,
  accent: FAMILY_LYCEUM_TEACHER_ACCENT,
  accentHover: FAMILY_LYCEUM_TEACHER_ACCENT_HOVER,
  programLabels: FAMILY_LYCEUM_TEACHER_PROGRAM_LABELS,
  programOrder: FAMILY_LYCEUM_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: FAMILY_LYCEUM_TEACHER_OFFICE,
  },
};
