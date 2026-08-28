export {
  WONDERING_OAKS_LOGO as WONDERING_OAKS_PARENT_LOGO,
  WONDERING_OAKS_ADMIN_COLORS,
} from "./wondering-oaks-admin-demo";

export const WONDERING_OAKS_PARENT_ACCENT = "#15843C";
export const WONDERING_OAKS_PARENT_ACCENT_HOVER = "#0E5828";
export const WONDERING_OAKS_PARENT_SCHOOL_NAME = "Wondering Oaks Learning";
export const WONDERING_OAKS_PARENT_SCHOOL_SHORT = "Wondering Oaks";
export const WONDERING_OAKS_PARENT_OFFICE = "Wondering Oaks Learning Office";


import { WONDERING_OAKS_ADMIN_LOGO } from "./wondering-oaks-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const wonderingOaksLearningParentDemoConfig: SchoolParentDemoConfig = {
  slug: "wondering-oaks-learning",
  logo: WONDERING_OAKS_ADMIN_LOGO,
  colors: {
    accent: WONDERING_OAKS_PARENT_ACCENT,
    accentHover: WONDERING_OAKS_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: WONDERING_OAKS_PARENT_SCHOOL_NAME,
    schoolShortName: WONDERING_OAKS_PARENT_SCHOOL_SHORT,
    officeName: WONDERING_OAKS_PARENT_OFFICE,
  },
};
