export {
  BVHA_LOGO as BVHA_PARENT_LOGO,
  BVHA_ADMIN_COLORS,
} from "./brazos-valley-honor-academy-admin-demo";

export const BVHA_PARENT_ACCENT = "#7B1E2B";
export const BVHA_PARENT_ACCENT_HOVER = "#5E1520";
export const BVHA_PARENT_SCHOOL_NAME = "Brazos Valley Honor Academy";
export const BVHA_PARENT_SCHOOL_SHORT = "BVHA";
export const BVHA_PARENT_OFFICE = "Brazos Valley Honor Academy Office";

import { BVHA_ADMIN_LOGO } from "./brazos-valley-honor-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const brazosValleyHonorAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "brazos-valley-honor-academy",
  logo: BVHA_ADMIN_LOGO,
  colors: {
    accent: BVHA_PARENT_ACCENT,
    accentHover: BVHA_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: BVHA_PARENT_SCHOOL_NAME,
    schoolShortName: BVHA_PARENT_SCHOOL_SHORT,
    officeName: BVHA_PARENT_OFFICE,
  },
};
