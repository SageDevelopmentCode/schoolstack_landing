export {
  WILDCAT_MICROSCHOOL_LOGO as WILDCAT_MICROSCHOOL_PARENT_LOGO,
  WILDCAT_MICROSCHOOL_ADMIN_COLORS,
} from "./wildcat-microschool-admin-demo";

export const WILDCAT_MICROSCHOOL_PARENT_ACCENT = "#071C37";
export const WILDCAT_MICROSCHOOL_PARENT_ACCENT_HOVER = "#123056";
export const WILDCAT_MICROSCHOOL_PARENT_SCHOOL_NAME = "Wildcat Microschool";
export const WILDCAT_MICROSCHOOL_PARENT_SCHOOL_SHORT = "Wildcat";
export const WILDCAT_MICROSCHOOL_PARENT_OFFICE = "Wildcat Microschool Office";

import { WILDCAT_MICROSCHOOL_ADMIN_LOGO } from "./wildcat-microschool-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const wildcatMicroschoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "wildcat-microschool",
  logo: WILDCAT_MICROSCHOOL_ADMIN_LOGO,
  colors: {
    accent: WILDCAT_MICROSCHOOL_PARENT_ACCENT,
    accentHover: WILDCAT_MICROSCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: WILDCAT_MICROSCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: WILDCAT_MICROSCHOOL_PARENT_SCHOOL_SHORT,
    officeName: WILDCAT_MICROSCHOOL_PARENT_OFFICE,
  },
};
