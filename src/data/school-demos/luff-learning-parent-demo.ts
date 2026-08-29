export {
  LUFF_LEARNING_LOGO as LUFF_LEARNING_PARENT_LOGO,
  LUFF_LEARNING_ADMIN_COLORS,
} from "./luff-learning-admin-demo";

export const LUFF_LEARNING_PARENT_ACCENT = "#769a61";
export const LUFF_LEARNING_PARENT_ACCENT_HOVER = "#5f824f";
export const LUFF_LEARNING_PARENT_SCHOOL_NAME = "Luff Learning Fine Arts Academy";
export const LUFF_LEARNING_PARENT_SCHOOL_SHORT = "Luff Learning";
export const LUFF_LEARNING_PARENT_OFFICE = "Luff Learning Office";


import { LUFF_LEARNING_ADMIN_LOGO } from "./luff-learning-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const luffLearningParentDemoConfig: SchoolParentDemoConfig = {
  slug: "luff-learning",
  logo: LUFF_LEARNING_ADMIN_LOGO,
  colors: {
    accent: LUFF_LEARNING_PARENT_ACCENT,
    accentHover: LUFF_LEARNING_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: LUFF_LEARNING_PARENT_SCHOOL_NAME,
    schoolShortName: LUFF_LEARNING_PARENT_SCHOOL_SHORT,
    officeName: LUFF_LEARNING_PARENT_OFFICE,
  },
};
