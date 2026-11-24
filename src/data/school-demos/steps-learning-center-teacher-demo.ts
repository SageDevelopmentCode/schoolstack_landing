export {
  STEPS_LEARNING_CENTER_LOGO as STEPS_LEARNING_CENTER_TEACHER_LOGO,
} from "./steps-learning-center-admin-demo";

export const STEPS_LEARNING_CENTER_TEACHER_OFFICE = "Steps Office";
export const STEPS_LEARNING_CENTER_TEACHER_ACCENT = "#3B2F7A";
export const STEPS_LEARNING_CENTER_TEACHER_ACCENT_HOVER = "#4E4196";

export const STEPS_LEARNING_CENTER_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  fourDay: "4-Day (Mon–Thu)",
  threeDayMw: "3-Day (Mon–Wed)",
  threeDayTt: "3-Day (Tue–Thu)",
};

export const STEPS_LEARNING_CENTER_TEACHER_PROGRAM_ORDER = ["fourDay", "threeDayMw", "threeDayTt"] as const;

import { STEPS_LEARNING_CENTER_ADMIN_LOGO } from "./steps-learning-center-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const stepsLearningCenterTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "steps-learning-center",
  logo: STEPS_LEARNING_CENTER_ADMIN_LOGO,
  accent: STEPS_LEARNING_CENTER_TEACHER_ACCENT,
  accentHover: STEPS_LEARNING_CENTER_TEACHER_ACCENT_HOVER,
  programLabels: STEPS_LEARNING_CENTER_TEACHER_PROGRAM_LABELS,
  programOrder: STEPS_LEARNING_CENTER_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: STEPS_LEARNING_CENTER_TEACHER_OFFICE,
  },
};
