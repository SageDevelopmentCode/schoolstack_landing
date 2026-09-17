export {
  THE_FOCUS_ACADEMY_LOGO as THE_FOCUS_ACADEMY_PARENT_LOGO,
  THE_FOCUS_ACADEMY_ADMIN_COLORS,
} from "./the-focus-academy-admin-demo";

export const THE_FOCUS_ACADEMY_PARENT_ACCENT = "#2C8C8C";
export const THE_FOCUS_ACADEMY_PARENT_ACCENT_HOVER = "#173B5B";
export const THE_FOCUS_ACADEMY_PARENT_SCHOOL_NAME = "The FOCUS Academy";
export const THE_FOCUS_ACADEMY_PARENT_SCHOOL_SHORT = "FOCUS";
export const THE_FOCUS_ACADEMY_PARENT_OFFICE = "The FOCUS Academy Office";

import { THE_FOCUS_ACADEMY_ADMIN_LOGO } from "./the-focus-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const theFocusAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "the-focus-academy",
  logo: THE_FOCUS_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: THE_FOCUS_ACADEMY_PARENT_ACCENT,
    accentHover: THE_FOCUS_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: THE_FOCUS_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: THE_FOCUS_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: THE_FOCUS_ACADEMY_PARENT_OFFICE,
  },
};
