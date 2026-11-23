export {
  DESERT_SUN_RANCH_ACADEMY_LOGO as DESERT_SUN_RANCH_ACADEMY_PARENT_LOGO,
  DESERT_SUN_RANCH_ACADEMY_ADMIN_COLORS,
} from "./desert-sun-ranch-academy-admin-demo";

export const DESERT_SUN_RANCH_ACADEMY_PARENT_ACCENT = "#2F6E3B";
export const DESERT_SUN_RANCH_ACADEMY_PARENT_ACCENT_HOVER = "#3B8549";
export const DESERT_SUN_RANCH_ACADEMY_PARENT_SCHOOL_NAME = "Desert Sun Ranch Academy";
export const DESERT_SUN_RANCH_ACADEMY_PARENT_SCHOOL_SHORT = "Desert Sun Ranch";
export const DESERT_SUN_RANCH_ACADEMY_PARENT_OFFICE = "Desert Sun Ranch Office";

import { DESERT_SUN_RANCH_ACADEMY_ADMIN_LOGO } from "./desert-sun-ranch-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const desertSunRanchAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "desert-sun-ranch-academy",
  logo: DESERT_SUN_RANCH_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: DESERT_SUN_RANCH_ACADEMY_PARENT_ACCENT,
    accentHover: DESERT_SUN_RANCH_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: DESERT_SUN_RANCH_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: DESERT_SUN_RANCH_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: DESERT_SUN_RANCH_ACADEMY_PARENT_OFFICE,
  },
};
