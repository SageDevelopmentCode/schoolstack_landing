export {
  MICAH_MISSION_ADMIN_LOGO as MICAH_MISSION_PARENT_LOGO,
  MICAH_MISSION_ADMIN_COLORS,
} from "./micahmission-admin-demo";

export const MICAH_MISSION_PARENT_ACCENT = "#2F5496";
export const MICAH_MISSION_PARENT_ACCENT_HOVER = "#244273";
export const MICAH_MISSION_PARENT_SCHOOL_NAME = "Micah's Mission School, Inc.";
export const MICAH_MISSION_PARENT_SCHOOL_SHORT = "Micah's Mission";
export const MICAH_MISSION_PARENT_OFFICE = "Micah's Mission School Office";


import { MICAH_MISSION_ADMIN_LOGO } from "./micahmission-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const micahsMissionSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "micahs-mission-school",
  logo: MICAH_MISSION_ADMIN_LOGO,
  colors: {
    accent: MICAH_MISSION_PARENT_ACCENT,
    accentHover: MICAH_MISSION_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: MICAH_MISSION_PARENT_SCHOOL_NAME,
    schoolShortName: MICAH_MISSION_PARENT_SCHOOL_SHORT,
    officeName: MICAH_MISSION_PARENT_OFFICE,
  },
};
