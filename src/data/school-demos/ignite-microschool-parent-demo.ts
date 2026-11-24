export {
  IGNITE_MICROSCHOOL_LOGO as IGNITE_MICROSCHOOL_PARENT_LOGO,
  IGNITE_MICROSCHOOL_ADMIN_COLORS,
} from "./ignite-microschool-admin-demo";

export const IGNITE_MICROSCHOOL_PARENT_ACCENT = "#16649F";
export const IGNITE_MICROSCHOOL_PARENT_ACCENT_HOVER = "#1B75BC";
export const IGNITE_MICROSCHOOL_PARENT_SCHOOL_NAME = "Ignite Microschool";
export const IGNITE_MICROSCHOOL_PARENT_SCHOOL_SHORT = "Ignite";
export const IGNITE_MICROSCHOOL_PARENT_OFFICE = "Ignite Office";

import { IGNITE_MICROSCHOOL_ADMIN_LOGO } from "./ignite-microschool-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const igniteMicroschoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "ignite-microschool",
  logo: IGNITE_MICROSCHOOL_ADMIN_LOGO,
  colors: {
    accent: IGNITE_MICROSCHOOL_PARENT_ACCENT,
    accentHover: IGNITE_MICROSCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: IGNITE_MICROSCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: IGNITE_MICROSCHOOL_PARENT_SCHOOL_SHORT,
    officeName: IGNITE_MICROSCHOOL_PARENT_OFFICE,
  },
};
