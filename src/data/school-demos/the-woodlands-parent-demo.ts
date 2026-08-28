export {
  THE_WOODLANDS_LOGO as THE_WOODLANDS_PARENT_LOGO,
  THE_WOODLANDS_ADMIN_COLORS,
} from "./the-woodlands-admin-demo";

export const THE_WOODLANDS_PARENT_ACCENT = "#335A39";
export const THE_WOODLANDS_PARENT_ACCENT_HOVER = "#213B27";
export const THE_WOODLANDS_PARENT_SCHOOL_NAME = "The Woodlands Microschool";
export const THE_WOODLANDS_PARENT_SCHOOL_SHORT = "The Woodlands Microschool";
export const THE_WOODLANDS_PARENT_OFFICE = "The Woodlands Microschool Office";


import { THE_WOODLANDS_ADMIN_LOGO } from "./the-woodlands-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const theWoodlandsMicroschoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "the-woodlands-microschool",
  logo: THE_WOODLANDS_ADMIN_LOGO,
  colors: {
    accent: THE_WOODLANDS_PARENT_ACCENT,
    accentHover: THE_WOODLANDS_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: THE_WOODLANDS_PARENT_SCHOOL_NAME,
    schoolShortName: THE_WOODLANDS_PARENT_SCHOOL_SHORT,
    officeName: THE_WOODLANDS_PARENT_OFFICE,
  },
};
