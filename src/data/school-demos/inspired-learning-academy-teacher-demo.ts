export {
  INSPIRED_LEARNING_LOGO as INSPIRED_LEARNING_TEACHER_LOGO,
} from "./inspired-learning-academy-admin-demo";

export const INSPIRED_LEARNING_TEACHER_OFFICE = "Inspired Learning Academy Office";
export const INSPIRED_LEARNING_TEACHER_ACCENT = "#B84032";
export const INSPIRED_LEARNING_TEACHER_ACCENT_HOVER = "#9A3529";

export const INSPIRED_LEARNING_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  middle_school: "Middle School",
  high_school: "High School",
  passion_projects: "Passion Projects",
  mentoring: "Mentoring",
};

export const INSPIRED_LEARNING_TEACHER_PROGRAM_ORDER = [
  "middle_school",
  "high_school",
  "passion_projects",
  "mentoring",
] as const;

import { INSPIRED_LEARNING_ADMIN_LOGO } from "./inspired-learning-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const inspiredLearningTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "inspired-learning-academy",
  logo: INSPIRED_LEARNING_ADMIN_LOGO,
  accent: INSPIRED_LEARNING_TEACHER_ACCENT,
  accentHover: INSPIRED_LEARNING_TEACHER_ACCENT_HOVER,
  programLabels: INSPIRED_LEARNING_TEACHER_PROGRAM_LABELS,
  programOrder: INSPIRED_LEARNING_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: INSPIRED_LEARNING_TEACHER_OFFICE,
  },
};
