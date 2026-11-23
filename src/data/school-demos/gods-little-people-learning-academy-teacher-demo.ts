export {
  GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_LOGO as GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_TEACHER_LOGO,
} from "./gods-little-people-learning-academy-admin-demo";

export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_TEACHER_OFFICE = "God's Little People Office";
export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_TEACHER_ACCENT = "#3A3A8C";
export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_TEACHER_ACCENT_HOVER = "#4B4BA6";

export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  prek: "Pre-K",
  kinder: "Kindergarten",
  g12: "1st–2nd",
};

export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_TEACHER_PROGRAM_ORDER = ["prek", "kinder", "g12"] as const;

import { GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_ADMIN_LOGO } from "./gods-little-people-learning-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const godsLittlePeopleLearningAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "gods-little-people-learning-academy",
  logo: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_ADMIN_LOGO,
  accent: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_TEACHER_ACCENT,
  accentHover: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_TEACHER_OFFICE,
  },
};
