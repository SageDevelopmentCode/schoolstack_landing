export {
  WONDERHERE_LOGO as WONDERHERE_PARENT_LOGO,
  WONDERHERE_ADMIN_COLORS,
} from "./wonderhere-admin-demo";

export const WONDERHERE_PARENT_ACCENT = "#3D5A45";
export const WONDERHERE_PARENT_ACCENT_HOVER = "#2D4533";
export const WONDERHERE_PARENT_SCHOOL_NAME = "WonderHere Lakeland";
export const WONDERHERE_PARENT_SCHOOL_SHORT = "WonderHere Lakeland";
export const WONDERHERE_PARENT_OFFICE = "WonderHere Lakeland Office";


import { WONDERHERE_ADMIN_LOGO } from "./wonderhere-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const wonderhereLakelandParentDemoConfig: SchoolParentDemoConfig = {
  slug: "wonderhere-lakeland",
  logo: WONDERHERE_ADMIN_LOGO,
  colors: {
    accent: WONDERHERE_PARENT_ACCENT,
    accentHover: WONDERHERE_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: WONDERHERE_PARENT_SCHOOL_NAME,
    schoolShortName: WONDERHERE_PARENT_SCHOOL_SHORT,
    officeName: WONDERHERE_PARENT_OFFICE,
  },
};
