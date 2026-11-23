export {
  BEACON_OF_HOPE_ACADEMY_LOGO as BEACON_OF_HOPE_ACADEMY_PARENT_LOGO,
  BEACON_OF_HOPE_ACADEMY_ADMIN_COLORS,
} from "./beacon-of-hope-academy-admin-demo";

export const BEACON_OF_HOPE_ACADEMY_PARENT_ACCENT = "#163A59";
export const BEACON_OF_HOPE_ACADEMY_PARENT_ACCENT_HOVER = "#24527A";
export const BEACON_OF_HOPE_ACADEMY_PARENT_SCHOOL_NAME = "Beacon of Hope Academy";
export const BEACON_OF_HOPE_ACADEMY_PARENT_SCHOOL_SHORT = "Beacon of Hope";
export const BEACON_OF_HOPE_ACADEMY_PARENT_OFFICE = "Beacon of Hope Academy Office";

import { BEACON_OF_HOPE_ACADEMY_ADMIN_LOGO } from "./beacon-of-hope-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const beaconOfHopeAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "beacon-of-hope-academy",
  logo: BEACON_OF_HOPE_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: BEACON_OF_HOPE_ACADEMY_PARENT_ACCENT,
    accentHover: BEACON_OF_HOPE_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: BEACON_OF_HOPE_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: BEACON_OF_HOPE_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: BEACON_OF_HOPE_ACADEMY_PARENT_OFFICE,
  },
};
