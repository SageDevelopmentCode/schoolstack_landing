export {
  NAPLES_MICROSCHOOLS_LOGO as NAPLES_MICROSCHOOLS_PARENT_LOGO,
  NAPLES_MICROSCHOOLS_ADMIN_COLORS,
} from "./naples-microschools-admin-demo";

export const NAPLES_MICROSCHOOLS_PARENT_ACCENT = "#4F7B50";
export const NAPLES_MICROSCHOOLS_PARENT_ACCENT_HOVER = "#244D3D";
export const NAPLES_MICROSCHOOLS_PARENT_SCHOOL_NAME = "Naples MicroSchools";
export const NAPLES_MICROSCHOOLS_PARENT_SCHOOL_SHORT = "NMS";
export const NAPLES_MICROSCHOOLS_PARENT_OFFICE = "Naples MicroSchools Office";

import { NAPLES_MICROSCHOOLS_ADMIN_LOGO } from "./naples-microschools-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const naplesMicroschoolsParentDemoConfig: SchoolParentDemoConfig = {
  slug: "naples-microschools",
  logo: NAPLES_MICROSCHOOLS_ADMIN_LOGO,
  colors: {
    accent: NAPLES_MICROSCHOOLS_PARENT_ACCENT,
    accentHover: NAPLES_MICROSCHOOLS_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: NAPLES_MICROSCHOOLS_PARENT_SCHOOL_NAME,
    schoolShortName: NAPLES_MICROSCHOOLS_PARENT_SCHOOL_SHORT,
    officeName: NAPLES_MICROSCHOOLS_PARENT_OFFICE,
  },
};
