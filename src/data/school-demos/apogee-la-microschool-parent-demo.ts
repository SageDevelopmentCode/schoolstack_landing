export {
  APOGEE_LA_MICROSCHOOL_LOGO as APOGEE_LA_MICROSCHOOL_PARENT_LOGO,
  APOGEE_LA_MICROSCHOOL_ADMIN_COLORS,
} from "./apogee-la-microschool-admin-demo";

export const APOGEE_LA_MICROSCHOOL_PARENT_ACCENT = "#131B32";
export const APOGEE_LA_MICROSCHOOL_PARENT_ACCENT_HOVER = "#24305A";
export const APOGEE_LA_MICROSCHOOL_PARENT_SCHOOL_NAME = "Apogee LA";
export const APOGEE_LA_MICROSCHOOL_PARENT_SCHOOL_SHORT = "Apogee";
export const APOGEE_LA_MICROSCHOOL_PARENT_OFFICE = "Apogee LA Office";

import { APOGEE_LA_MICROSCHOOL_ADMIN_LOGO } from "./apogee-la-microschool-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const apogeeLaMicroschoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "apogee-la-microschool",
  logo: APOGEE_LA_MICROSCHOOL_ADMIN_LOGO,
  colors: {
    accent: APOGEE_LA_MICROSCHOOL_PARENT_ACCENT,
    accentHover: APOGEE_LA_MICROSCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: APOGEE_LA_MICROSCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: APOGEE_LA_MICROSCHOOL_PARENT_SCHOOL_SHORT,
    officeName: APOGEE_LA_MICROSCHOOL_PARENT_OFFICE,
  },
};
