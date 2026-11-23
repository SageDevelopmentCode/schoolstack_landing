export {
  DESERT_DRAGON_SCHOOL_LOGO as DESERT_DRAGON_SCHOOL_PARENT_LOGO,
  DESERT_DRAGON_SCHOOL_ADMIN_COLORS,
} from "./desert-dragon-school-admin-demo";

export const DESERT_DRAGON_SCHOOL_PARENT_ACCENT = "#28517F";
export const DESERT_DRAGON_SCHOOL_PARENT_ACCENT_HOVER = "#336499";
export const DESERT_DRAGON_SCHOOL_PARENT_SCHOOL_NAME = "Desert Dragon Learning Community";
export const DESERT_DRAGON_SCHOOL_PARENT_SCHOOL_SHORT = "Desert Dragon";
export const DESERT_DRAGON_SCHOOL_PARENT_OFFICE = "Desert Dragon Office";

import { DESERT_DRAGON_SCHOOL_ADMIN_LOGO } from "./desert-dragon-school-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const desertDragonSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "desert-dragon-school",
  logo: DESERT_DRAGON_SCHOOL_ADMIN_LOGO,
  colors: {
    accent: DESERT_DRAGON_SCHOOL_PARENT_ACCENT,
    accentHover: DESERT_DRAGON_SCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: DESERT_DRAGON_SCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: DESERT_DRAGON_SCHOOL_PARENT_SCHOOL_SHORT,
    officeName: DESERT_DRAGON_SCHOOL_PARENT_OFFICE,
  },
};
