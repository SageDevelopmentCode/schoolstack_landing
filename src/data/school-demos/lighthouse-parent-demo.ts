export {
  LIGHTHOUSE_LOGO as LIGHTHOUSE_PARENT_LOGO,
  LIGHTHOUSE_ADMIN_COLORS,
} from "./lighthouse-admin-demo";

export const LIGHTHOUSE_PARENT_ACCENT = "#336699";
export const LIGHTHOUSE_PARENT_ACCENT_HOVER = "#1d519d";
export const LIGHTHOUSE_PARENT_SCHOOL_NAME = "Lighthouse Homeschool Academy";
export const LIGHTHOUSE_PARENT_SCHOOL_SHORT = "Lighthouse Homeschool";
export const LIGHTHOUSE_PARENT_OFFICE = "Lighthouse Homeschool Academy Office";


import { LIGHTHOUSE_ADMIN_LOGO } from "./lighthouse-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const lighthouseHomeschoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "lighthouse-homeschool",
  logo: LIGHTHOUSE_ADMIN_LOGO,
  colors: {
    accent: LIGHTHOUSE_PARENT_ACCENT,
    accentHover: LIGHTHOUSE_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: LIGHTHOUSE_PARENT_SCHOOL_NAME,
    schoolShortName: LIGHTHOUSE_PARENT_SCHOOL_SHORT,
    officeName: LIGHTHOUSE_PARENT_OFFICE,
  },
};
