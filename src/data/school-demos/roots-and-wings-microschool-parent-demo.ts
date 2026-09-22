export {
  ROOTS_AND_WINGS_LOGO as ROOTS_AND_WINGS_PARENT_LOGO,
  ROOTS_AND_WINGS_ADMIN_COLORS,
} from "./roots-and-wings-microschool-admin-demo";

export const ROOTS_AND_WINGS_PARENT_ACCENT = "#2E6B63";
export const ROOTS_AND_WINGS_PARENT_ACCENT_HOVER = "#1F514A";
export const ROOTS_AND_WINGS_PARENT_SCHOOL_NAME = "Roots and Wings Microschool";
export const ROOTS_AND_WINGS_PARENT_SCHOOL_SHORT = "RAWM";
export const ROOTS_AND_WINGS_PARENT_OFFICE = "Roots and Wings Microschool Office";

import { ROOTS_AND_WINGS_ADMIN_LOGO } from "./roots-and-wings-microschool-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const rootsAndWingsMicroschoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "roots-and-wings-microschool",
  logo: ROOTS_AND_WINGS_ADMIN_LOGO,
  colors: {
    accent: ROOTS_AND_WINGS_PARENT_ACCENT,
    accentHover: ROOTS_AND_WINGS_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: ROOTS_AND_WINGS_PARENT_SCHOOL_NAME,
    schoolShortName: ROOTS_AND_WINGS_PARENT_SCHOOL_SHORT,
    officeName: ROOTS_AND_WINGS_PARENT_OFFICE,
  },
};
