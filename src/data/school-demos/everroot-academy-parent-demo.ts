export {
  EVERROOT_ACADEMY_LOGO as EVERROOT_ACADEMY_PARENT_LOGO,
  EVERROOT_ACADEMY_ADMIN_COLORS,
} from "./everroot-academy-admin-demo";

export const EVERROOT_ACADEMY_PARENT_ACCENT = "#154A47";
export const EVERROOT_ACADEMY_PARENT_ACCENT_HOVER = "#1F615D";
export const EVERROOT_ACADEMY_PARENT_SCHOOL_NAME = "EverRoot Academy";
export const EVERROOT_ACADEMY_PARENT_SCHOOL_SHORT = "EverRoot";
export const EVERROOT_ACADEMY_PARENT_OFFICE = "EverRoot Academy Office";

import { EVERROOT_ACADEMY_ADMIN_LOGO } from "./everroot-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const everrootAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "everroot-academy",
  logo: EVERROOT_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: EVERROOT_ACADEMY_PARENT_ACCENT,
    accentHover: EVERROOT_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: EVERROOT_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: EVERROOT_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: EVERROOT_ACADEMY_PARENT_OFFICE,
  },
};
