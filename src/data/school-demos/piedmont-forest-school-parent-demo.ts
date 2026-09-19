export {
  PIEDMONT_FOREST_SCHOOL_LOGO as PIEDMONT_FOREST_SCHOOL_PARENT_LOGO,
  PIEDMONT_FOREST_SCHOOL_ADMIN_COLORS,
} from "./piedmont-forest-school-admin-demo";

export const PIEDMONT_FOREST_SCHOOL_PARENT_ACCENT = "#355B3A";
export const PIEDMONT_FOREST_SCHOOL_PARENT_ACCENT_HOVER = "#1F3D2A";
export const PIEDMONT_FOREST_SCHOOL_PARENT_SCHOOL_NAME = "Piedmont Forest School";
export const PIEDMONT_FOREST_SCHOOL_PARENT_SCHOOL_SHORT = "PFS";
export const PIEDMONT_FOREST_SCHOOL_PARENT_OFFICE = "Piedmont Forest School Office";

import { PIEDMONT_FOREST_SCHOOL_ADMIN_LOGO } from "./piedmont-forest-school-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const piedmontForestSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "piedmont-forest-school",
  logo: PIEDMONT_FOREST_SCHOOL_ADMIN_LOGO,
  colors: {
    accent: PIEDMONT_FOREST_SCHOOL_PARENT_ACCENT,
    accentHover: PIEDMONT_FOREST_SCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: PIEDMONT_FOREST_SCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: PIEDMONT_FOREST_SCHOOL_PARENT_SCHOOL_SHORT,
    officeName: PIEDMONT_FOREST_SCHOOL_PARENT_OFFICE,
  },
};
