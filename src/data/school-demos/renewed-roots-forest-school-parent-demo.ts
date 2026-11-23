export {
  RENEWED_ROOTS_FOREST_SCHOOL_LOGO as RENEWED_ROOTS_FOREST_SCHOOL_PARENT_LOGO,
  RENEWED_ROOTS_FOREST_SCHOOL_ADMIN_COLORS,
} from "./renewed-roots-forest-school-admin-demo";

export const RENEWED_ROOTS_FOREST_SCHOOL_PARENT_ACCENT = "#3D5C4F";
export const RENEWED_ROOTS_FOREST_SCHOOL_PARENT_ACCENT_HOVER = "#4C6E60";
export const RENEWED_ROOTS_FOREST_SCHOOL_PARENT_SCHOOL_NAME = "Renewed Roots Forest School";
export const RENEWED_ROOTS_FOREST_SCHOOL_PARENT_SCHOOL_SHORT = "Renewed Roots";
export const RENEWED_ROOTS_FOREST_SCHOOL_PARENT_OFFICE = "Renewed Roots Office";

import { RENEWED_ROOTS_FOREST_SCHOOL_ADMIN_LOGO } from "./renewed-roots-forest-school-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const renewedRootsForestSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "renewed-roots-forest-school",
  logo: RENEWED_ROOTS_FOREST_SCHOOL_ADMIN_LOGO,
  colors: {
    accent: RENEWED_ROOTS_FOREST_SCHOOL_PARENT_ACCENT,
    accentHover: RENEWED_ROOTS_FOREST_SCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: RENEWED_ROOTS_FOREST_SCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: RENEWED_ROOTS_FOREST_SCHOOL_PARENT_SCHOOL_SHORT,
    officeName: RENEWED_ROOTS_FOREST_SCHOOL_PARENT_OFFICE,
  },
};
