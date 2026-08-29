export {
  ZOE_LEARNING_HOUSE_ADMIN_LOGO as ZOE_LEARNING_HOUSE_PARENT_LOGO,
  ZOE_LEARNING_HOUSE_ADMIN_COLORS,
} from "./zoelearninghouse-admin-demo";

export const ZOE_LEARNING_HOUSE_PARENT_ACCENT = "#5F8A7A";
export const ZOE_LEARNING_HOUSE_PARENT_ACCENT_HOVER = "#4A7568";
export const ZOE_LEARNING_HOUSE_PARENT_SCHOOL_NAME = "Zoe Learning House";
export const ZOE_LEARNING_HOUSE_PARENT_SCHOOL_SHORT = "Zoe";
export const ZOE_LEARNING_HOUSE_PARENT_OFFICE = "Zoe Learning House Office";


import { ZOE_LEARNING_HOUSE_ADMIN_LOGO } from "./zoelearninghouse-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const zoeLearningHouseParentDemoConfig: SchoolParentDemoConfig = {
  slug: "zoe-learning-house",
  logo: ZOE_LEARNING_HOUSE_ADMIN_LOGO,
  colors: {
    accent: ZOE_LEARNING_HOUSE_PARENT_ACCENT,
    accentHover: ZOE_LEARNING_HOUSE_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: ZOE_LEARNING_HOUSE_PARENT_SCHOOL_NAME,
    schoolShortName: ZOE_LEARNING_HOUSE_PARENT_SCHOOL_SHORT,
    officeName: ZOE_LEARNING_HOUSE_PARENT_OFFICE,
  },
};
