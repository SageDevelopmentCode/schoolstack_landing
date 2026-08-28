export {
  LUFF_LEARNING_LOGO as LUFF_LEARNING_TEACHER_LOGO,
} from "./luff-learning-admin-demo";

export const LUFF_LEARNING_TEACHER_OFFICE = "Luff Learning Office";
export const LUFF_LEARNING_TEACHER_ACCENT = "#769a61";
export const LUFF_LEARNING_TEACHER_ACCENT_HOVER = "#5f824f";

export const LUFF_LEARNING_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  virtual_academy: "Virtual Academy",
  aep: "Artistic Evolution (AEP)",
  creative_dramatics: "Creative Dramatics",
  fine_arts_friday: "Fine Arts Friday",
};

export const LUFF_LEARNING_TEACHER_PROGRAM_ORDER = [
  "virtual_academy",
  "aep",
  "creative_dramatics",
  "fine_arts_friday",
] as const;


import { LUFF_LEARNING_ADMIN_LOGO } from "./luff-learning-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const luffLearningTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "luff-learning",
  logo: LUFF_LEARNING_ADMIN_LOGO,
  accent: LUFF_LEARNING_TEACHER_ACCENT,
  accentHover: LUFF_LEARNING_TEACHER_ACCENT_HOVER,
  programLabels: LUFF_LEARNING_TEACHER_PROGRAM_LABELS,
  programOrder: LUFF_LEARNING_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: LUFF_LEARNING_TEACHER_OFFICE,
  },
};
