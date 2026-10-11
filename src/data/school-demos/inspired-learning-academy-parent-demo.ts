export {
  INSPIRED_LEARNING_LOGO as INSPIRED_LEARNING_PARENT_LOGO,
  INSPIRED_LEARNING_ADMIN_COLORS,
} from "./inspired-learning-academy-admin-demo";

export const INSPIRED_LEARNING_PARENT_ACCENT = "#B84032";
export const INSPIRED_LEARNING_PARENT_ACCENT_HOVER = "#9A3529";
export const INSPIRED_LEARNING_PARENT_SCHOOL_NAME = "Inspired Learning Academy";
export const INSPIRED_LEARNING_PARENT_SCHOOL_SHORT = "Inspired";
export const INSPIRED_LEARNING_PARENT_OFFICE = "Inspired Learning Academy Office";

import { INSPIRED_LEARNING_ADMIN_LOGO } from "./inspired-learning-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const inspiredLearningParentDemoConfig: SchoolParentDemoConfig = {
  slug: "inspired-learning-academy",
  logo: INSPIRED_LEARNING_ADMIN_LOGO,
  colors: {
    accent: INSPIRED_LEARNING_PARENT_ACCENT,
    accentHover: INSPIRED_LEARNING_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: INSPIRED_LEARNING_PARENT_SCHOOL_NAME,
    schoolShortName: INSPIRED_LEARNING_PARENT_SCHOOL_SHORT,
    officeName: INSPIRED_LEARNING_PARENT_OFFICE,
  },
};
