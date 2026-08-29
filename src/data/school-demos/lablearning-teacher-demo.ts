export {
  LAB_LEARNING_ADMIN_LOGO as LAB_LEARNING_TEACHER_LOGO,
} from "./lablearning-admin-demo";

export const LAB_LEARNING_TEACHER_OFFICE = "The Lab Learning Space Office";
export const LAB_LEARNING_TEACHER_ACCENT = "#6f8f3a";
export const LAB_LEARNING_TEACHER_ACCENT_HOVER = "#5a7530";

export const LAB_LEARNING_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  summer_26: "WOW! 2-Day Homeschool Enrichment",
  school_year_26_27: "A La Carte Classes",
  homeschool_drop_in: "Global Literacy Program & Tutoring",
};

export const LAB_LEARNING_TEACHER_PROGRAM_ORDER = [
  "summer_26",
  "school_year_26_27",
  "homeschool_drop_in",
] as const;


import { LAB_LEARNING_ADMIN_LOGO } from "./lablearning-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const labLearningTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "lab-learning",
  logo: LAB_LEARNING_ADMIN_LOGO,
  accent: LAB_LEARNING_TEACHER_ACCENT,
  accentHover: LAB_LEARNING_TEACHER_ACCENT_HOVER,
  programLabels: LAB_LEARNING_TEACHER_PROGRAM_LABELS,
  programOrder: LAB_LEARNING_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: LAB_LEARNING_TEACHER_OFFICE,
  },
};
