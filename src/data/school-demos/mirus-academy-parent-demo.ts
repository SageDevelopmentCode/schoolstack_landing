export {
  MIRUS_ACADEMY_LOGO as MIRUS_ACADEMY_PARENT_LOGO,
  MIRUS_ACADEMY_ADMIN_COLORS,
} from "./mirus-academy-admin-demo";

export const MIRUS_ACADEMY_PARENT_ACCENT = "#132460";
export const MIRUS_ACADEMY_PARENT_ACCENT_HOVER = "#24398A";
export const MIRUS_ACADEMY_PARENT_SCHOOL_NAME = "Mirus Academy";
export const MIRUS_ACADEMY_PARENT_SCHOOL_SHORT = "Mirus";
export const MIRUS_ACADEMY_PARENT_OFFICE = "Mirus Office";

import { MIRUS_ACADEMY_ADMIN_LOGO } from "./mirus-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const mirusAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "mirus-academy",
  logo: MIRUS_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: MIRUS_ACADEMY_PARENT_ACCENT,
    accentHover: MIRUS_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: MIRUS_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: MIRUS_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: MIRUS_ACADEMY_PARENT_OFFICE,
  },
};
