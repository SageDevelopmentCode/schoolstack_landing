export {
  STEPS_LEARNING_CENTER_LOGO as STEPS_LEARNING_CENTER_PARENT_LOGO,
  STEPS_LEARNING_CENTER_ADMIN_COLORS,
} from "./steps-learning-center-admin-demo";

export const STEPS_LEARNING_CENTER_PARENT_ACCENT = "#3B2F7A";
export const STEPS_LEARNING_CENTER_PARENT_ACCENT_HOVER = "#4E4196";
export const STEPS_LEARNING_CENTER_PARENT_SCHOOL_NAME = "Steps Learning Center";
export const STEPS_LEARNING_CENTER_PARENT_SCHOOL_SHORT = "Steps";
export const STEPS_LEARNING_CENTER_PARENT_OFFICE = "Steps Office";

import { STEPS_LEARNING_CENTER_ADMIN_LOGO } from "./steps-learning-center-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const stepsLearningCenterParentDemoConfig: SchoolParentDemoConfig = {
  slug: "steps-learning-center",
  logo: STEPS_LEARNING_CENTER_ADMIN_LOGO,
  colors: {
    accent: STEPS_LEARNING_CENTER_PARENT_ACCENT,
    accentHover: STEPS_LEARNING_CENTER_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: STEPS_LEARNING_CENTER_PARENT_SCHOOL_NAME,
    schoolShortName: STEPS_LEARNING_CENTER_PARENT_SCHOOL_SHORT,
    officeName: STEPS_LEARNING_CENTER_PARENT_OFFICE,
  },
};
