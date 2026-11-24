export {
  JOURNEY_ACADEMY_LOGO as JOURNEY_ACADEMY_PARENT_LOGO,
  JOURNEY_ACADEMY_ADMIN_COLORS,
} from "./journey-academy-admin-demo";

export const JOURNEY_ACADEMY_PARENT_ACCENT = "#1D5A9E";
export const JOURNEY_ACADEMY_PARENT_ACCENT_HOVER = "#297BD3";
export const JOURNEY_ACADEMY_PARENT_SCHOOL_NAME = "Journey Academy";
export const JOURNEY_ACADEMY_PARENT_SCHOOL_SHORT = "Journey";
export const JOURNEY_ACADEMY_PARENT_OFFICE = "Journey Academy Office";

import { JOURNEY_ACADEMY_ADMIN_LOGO } from "./journey-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const journeyAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "journey-academy",
  logo: JOURNEY_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: JOURNEY_ACADEMY_PARENT_ACCENT,
    accentHover: JOURNEY_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: JOURNEY_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: JOURNEY_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: JOURNEY_ACADEMY_PARENT_OFFICE,
  },
};
