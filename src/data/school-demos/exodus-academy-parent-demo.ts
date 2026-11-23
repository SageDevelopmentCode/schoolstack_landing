export {
  EXODUS_ACADEMY_LOGO as EXODUS_ACADEMY_PARENT_LOGO,
  EXODUS_ACADEMY_ADMIN_COLORS,
} from "./exodus-academy-admin-demo";

export const EXODUS_ACADEMY_PARENT_ACCENT = "#4F0A62";
export const EXODUS_ACADEMY_PARENT_ACCENT_HOVER = "#651C7A";
export const EXODUS_ACADEMY_PARENT_SCHOOL_NAME = "Exodus Academy";
export const EXODUS_ACADEMY_PARENT_SCHOOL_SHORT = "Exodus";
export const EXODUS_ACADEMY_PARENT_OFFICE = "Exodus Office";

import { EXODUS_ACADEMY_ADMIN_LOGO } from "./exodus-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const exodusAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "exodus-academy",
  logo: EXODUS_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: EXODUS_ACADEMY_PARENT_ACCENT,
    accentHover: EXODUS_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: EXODUS_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: EXODUS_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: EXODUS_ACADEMY_PARENT_OFFICE,
  },
};
