export {
  KINDER_ACADEMY_PREP_SCHOOL_LOGO as KINDER_ACADEMY_PREP_SCHOOL_PARENT_LOGO,
  KINDER_ACADEMY_PREP_SCHOOL_ADMIN_COLORS,
} from "./kinder-academy-prep-school-admin-demo";

export const KINDER_ACADEMY_PREP_SCHOOL_PARENT_ACCENT = "#2B6CB0";
export const KINDER_ACADEMY_PREP_SCHOOL_PARENT_ACCENT_HOVER = "#225A94";
export const KINDER_ACADEMY_PREP_SCHOOL_PARENT_SCHOOL_NAME =
  "Kinder Academy Prep School";
export const KINDER_ACADEMY_PREP_SCHOOL_PARENT_SCHOOL_SHORT = "KAPS";
export const KINDER_ACADEMY_PREP_SCHOOL_PARENT_OFFICE =
  "Kinder Academy Prep School Office";


import { KINDER_ACADEMY_PREP_SCHOOL_ADMIN_LOGO } from "./kinder-academy-prep-school-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const kinderAcademyPrepSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "kinder-academy-prep-school",
  logo: KINDER_ACADEMY_PREP_SCHOOL_ADMIN_LOGO,
  colors: {
    accent: KINDER_ACADEMY_PREP_SCHOOL_PARENT_ACCENT,
    accentHover: KINDER_ACADEMY_PREP_SCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: KINDER_ACADEMY_PREP_SCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: KINDER_ACADEMY_PREP_SCHOOL_PARENT_SCHOOL_SHORT,
    officeName: KINDER_ACADEMY_PREP_SCHOOL_PARENT_OFFICE,
  },
};
