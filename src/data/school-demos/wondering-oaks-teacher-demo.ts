export {
  WONDERING_OAKS_LOGO as WONDERING_OAKS_TEACHER_LOGO,
} from "./wondering-oaks-admin-demo";

export const WONDERING_OAKS_TEACHER_OFFICE = "Wondering Oaks Learning Office";
export const WONDERING_OAKS_TEACHER_ACCENT = "#15843C";
export const WONDERING_OAKS_TEACHER_ACCENT_HOVER = "#0E5828";

export const WONDERING_OAKS_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  full_time: "Full-Time (3–4 Days)",
  part_time: "Part-Time (1–2 Days)",
  foundational_core: "Foundational Core (Mon/Wed)",
  science_projects: "Science & Special Projects (Tue/Thu)",
};

export const WONDERING_OAKS_TEACHER_PROGRAM_ORDER = [
  "full_time",
  "part_time",
  "foundational_core",
  "science_projects",
] as const;


import { WONDERING_OAKS_ADMIN_LOGO } from "./wondering-oaks-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const wonderingOaksLearningTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "wondering-oaks-learning",
  logo: WONDERING_OAKS_ADMIN_LOGO,
  accent: WONDERING_OAKS_TEACHER_ACCENT,
  accentHover: WONDERING_OAKS_TEACHER_ACCENT_HOVER,
  programLabels: WONDERING_OAKS_TEACHER_PROGRAM_LABELS,
  programOrder: WONDERING_OAKS_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: WONDERING_OAKS_TEACHER_OFFICE,
  },
};
