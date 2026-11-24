export {
  MORGAN_PREP_ACADEMY_LOGO as MORGAN_PREP_ACADEMY_PARENT_LOGO,
  MORGAN_PREP_ACADEMY_ADMIN_COLORS,
} from "./morgan-prep-academy-admin-demo";

export const MORGAN_PREP_ACADEMY_PARENT_ACCENT = "#571310";
export const MORGAN_PREP_ACADEMY_PARENT_ACCENT_HOVER = "#73201B";
export const MORGAN_PREP_ACADEMY_PARENT_SCHOOL_NAME = "Morgan Preparatory Academy for Boys";
export const MORGAN_PREP_ACADEMY_PARENT_SCHOOL_SHORT = "Morgan Prep";
export const MORGAN_PREP_ACADEMY_PARENT_OFFICE = "Morgan Prep Office";

import { MORGAN_PREP_ACADEMY_ADMIN_LOGO } from "./morgan-prep-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const morganPrepAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "morgan-prep-academy",
  logo: MORGAN_PREP_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: MORGAN_PREP_ACADEMY_PARENT_ACCENT,
    accentHover: MORGAN_PREP_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: MORGAN_PREP_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: MORGAN_PREP_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: MORGAN_PREP_ACADEMY_PARENT_OFFICE,
  },
};
