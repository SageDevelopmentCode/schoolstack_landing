export {
  FREEDOM_PREP_ACADEMY_LOGO as FREEDOM_PREP_ACADEMY_PARENT_LOGO,
  FREEDOM_PREP_ACADEMY_ADMIN_COLORS,
} from "./freedom-prep-academy-admin-demo";

export const FREEDOM_PREP_ACADEMY_PARENT_ACCENT = "#1467B9";
export const FREEDOM_PREP_ACADEMY_PARENT_ACCENT_HOVER = "#0D2F5D";
export const FREEDOM_PREP_ACADEMY_PARENT_SCHOOL_NAME = "Freedom Prep Academy";
export const FREEDOM_PREP_ACADEMY_PARENT_SCHOOL_SHORT = "Freedom Prep";
export const FREEDOM_PREP_ACADEMY_PARENT_OFFICE = "Freedom Prep Academy Office";

import { FREEDOM_PREP_ACADEMY_ADMIN_LOGO } from "./freedom-prep-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const freedomPrepAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "freedom-prep-academy",
  logo: FREEDOM_PREP_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: FREEDOM_PREP_ACADEMY_PARENT_ACCENT,
    accentHover: FREEDOM_PREP_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: FREEDOM_PREP_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: FREEDOM_PREP_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: FREEDOM_PREP_ACADEMY_PARENT_OFFICE,
  },
};
