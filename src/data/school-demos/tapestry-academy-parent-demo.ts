export {
  TAPESTRY_ACADEMY_LOGO as TAPESTRY_ACADEMY_PARENT_LOGO,
  TAPESTRY_ACADEMY_ADMIN_COLORS,
} from "./tapestry-academy-admin-demo";

export const TAPESTRY_ACADEMY_PARENT_ACCENT = "#2E7D7B";
export const TAPESTRY_ACADEMY_PARENT_ACCENT_HOVER = "#256A68";
export const TAPESTRY_ACADEMY_PARENT_SCHOOL_NAME = "Tapestry Academy";
export const TAPESTRY_ACADEMY_PARENT_SCHOOL_SHORT = "Tapestry";
export const TAPESTRY_ACADEMY_PARENT_OFFICE = "Tapestry Academy Office";

import { TAPESTRY_ACADEMY_ADMIN_LOGO } from "./tapestry-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const tapestryAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "tapestry-academy",
  logo: TAPESTRY_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: TAPESTRY_ACADEMY_PARENT_ACCENT,
    accentHover: TAPESTRY_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: TAPESTRY_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: TAPESTRY_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: TAPESTRY_ACADEMY_PARENT_OFFICE,
  },
};
