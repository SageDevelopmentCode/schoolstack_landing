export {
  TRUE_NORTH_ADMIN_LOGO as TRUE_NORTH_PARENT_LOGO,
  TRUE_NORTH_ADMIN_COLORS,
} from "./truenorth-admin-demo";

export const TRUE_NORTH_PARENT_ACCENT = "#254EDB";
export const TRUE_NORTH_PARENT_ACCENT_HOVER = "#1D3FB0";
export const TRUE_NORTH_PARENT_SCHOOL_NAME = "True North";
export const TRUE_NORTH_PARENT_SCHOOL_SHORT = "True North";
export const TRUE_NORTH_PARENT_OFFICE = "True North Office";


import { TRUE_NORTH_ADMIN_LOGO } from "./truenorth-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const trueNorthParentDemoConfig: SchoolParentDemoConfig = {
  slug: "true-north",
  logo: TRUE_NORTH_ADMIN_LOGO,
  colors: {
    accent: TRUE_NORTH_PARENT_ACCENT,
    accentHover: TRUE_NORTH_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: TRUE_NORTH_PARENT_SCHOOL_NAME,
    schoolShortName: TRUE_NORTH_PARENT_SCHOOL_SHORT,
    officeName: TRUE_NORTH_PARENT_OFFICE,
  },
};
