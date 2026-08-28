export {
  KINEO_SCHOOL_LOGO as KINEO_SCHOOL_PARENT_LOGO,
  KINEO_SCHOOL_ADMIN_COLORS,
} from "./kineo-school-admin-demo";

export const KINEO_SCHOOL_PARENT_ACCENT = "#5BB7B0";
export const KINEO_SCHOOL_PARENT_ACCENT_HOVER = "#4AA39C";
export const KINEO_SCHOOL_PARENT_SCHOOL_NAME = "The Kineo School";
export const KINEO_SCHOOL_PARENT_SCHOOL_SHORT = "Kineo School";
export const KINEO_SCHOOL_PARENT_OFFICE = "Kineo School Office";


import { KINEO_SCHOOL_ADMIN_LOGO } from "./kineo-school-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const kineoSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "kineo-school",
  logo: KINEO_SCHOOL_ADMIN_LOGO,
  colors: {
    accent: KINEO_SCHOOL_PARENT_ACCENT,
    accentHover: KINEO_SCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: KINEO_SCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: KINEO_SCHOOL_PARENT_SCHOOL_SHORT,
    officeName: KINEO_SCHOOL_PARENT_OFFICE,
  },
};
