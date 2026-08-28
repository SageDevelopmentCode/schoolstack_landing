export {
  LAB_LEARNING_ADMIN_LOGO as LAB_LEARNING_PARENT_LOGO,
  LAB_LEARNING_ADMIN_COLORS,
} from "./lablearning-admin-demo";

export const LAB_LEARNING_PARENT_ACCENT = "#6f8f3a";
export const LAB_LEARNING_PARENT_ACCENT_HOVER = "#5a7530";
export const LAB_LEARNING_PARENT_SCHOOL_NAME = "The Lab Learning Space";
export const LAB_LEARNING_PARENT_SCHOOL_SHORT = "The Lab";
export const LAB_LEARNING_PARENT_OFFICE = "The Lab Learning Space Office";


import { LAB_LEARNING_ADMIN_LOGO } from "./lablearning-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const labLearningParentDemoConfig: SchoolParentDemoConfig = {
  slug: "lab-learning",
  logo: LAB_LEARNING_ADMIN_LOGO,
  colors: {
    accent: LAB_LEARNING_PARENT_ACCENT,
    accentHover: LAB_LEARNING_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: LAB_LEARNING_PARENT_SCHOOL_NAME,
    schoolShortName: LAB_LEARNING_PARENT_SCHOOL_SHORT,
    officeName: LAB_LEARNING_PARENT_OFFICE,
  },
};
