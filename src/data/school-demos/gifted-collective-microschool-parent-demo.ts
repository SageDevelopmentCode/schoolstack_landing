export {
  GIFTED_COLLECTIVE_MICROSCHOOL_LOGO as GIFTED_COLLECTIVE_MICROSCHOOL_PARENT_LOGO,
  GIFTED_COLLECTIVE_MICROSCHOOL_ADMIN_COLORS,
} from "./gifted-collective-microschool-admin-demo";

export const GIFTED_COLLECTIVE_MICROSCHOOL_PARENT_ACCENT = "#2E1A47";
export const GIFTED_COLLECTIVE_MICROSCHOOL_PARENT_ACCENT_HOVER = "#432A63";
export const GIFTED_COLLECTIVE_MICROSCHOOL_PARENT_SCHOOL_NAME = "Gifted Microschool at The Gifted Collective";
export const GIFTED_COLLECTIVE_MICROSCHOOL_PARENT_SCHOOL_SHORT = "Gifted Microschool";
export const GIFTED_COLLECTIVE_MICROSCHOOL_PARENT_OFFICE = "Gifted Collective Office";

import { GIFTED_COLLECTIVE_MICROSCHOOL_ADMIN_LOGO } from "./gifted-collective-microschool-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const giftedCollectiveMicroschoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "gifted-collective-microschool",
  logo: GIFTED_COLLECTIVE_MICROSCHOOL_ADMIN_LOGO,
  colors: {
    accent: GIFTED_COLLECTIVE_MICROSCHOOL_PARENT_ACCENT,
    accentHover: GIFTED_COLLECTIVE_MICROSCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: GIFTED_COLLECTIVE_MICROSCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: GIFTED_COLLECTIVE_MICROSCHOOL_PARENT_SCHOOL_SHORT,
    officeName: GIFTED_COLLECTIVE_MICROSCHOOL_PARENT_OFFICE,
  },
};
