export {
  PRAXIS_ELITE_SPORTS_ACADEMY_LOGO as PRAXIS_ELITE_SPORTS_ACADEMY_PARENT_LOGO,
  PRAXIS_ELITE_SPORTS_ACADEMY_ADMIN_COLORS,
} from "./praxis-elite-sports-academy-admin-demo";

export const PRAXIS_ELITE_SPORTS_ACADEMY_PARENT_ACCENT = "#161616";
export const PRAXIS_ELITE_SPORTS_ACADEMY_PARENT_ACCENT_HOVER = "#333333";
export const PRAXIS_ELITE_SPORTS_ACADEMY_PARENT_SCHOOL_NAME = "Praxis Elite Sports Academy";
export const PRAXIS_ELITE_SPORTS_ACADEMY_PARENT_SCHOOL_SHORT = "Praxis Elite";
export const PRAXIS_ELITE_SPORTS_ACADEMY_PARENT_OFFICE = "Praxis Elite Office";

import { PRAXIS_ELITE_SPORTS_ACADEMY_ADMIN_LOGO } from "./praxis-elite-sports-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const praxisEliteSportsAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "praxis-elite-sports-academy",
  logo: PRAXIS_ELITE_SPORTS_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: PRAXIS_ELITE_SPORTS_ACADEMY_PARENT_ACCENT,
    accentHover: PRAXIS_ELITE_SPORTS_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: PRAXIS_ELITE_SPORTS_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: PRAXIS_ELITE_SPORTS_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: PRAXIS_ELITE_SPORTS_ACADEMY_PARENT_OFFICE,
  },
};
