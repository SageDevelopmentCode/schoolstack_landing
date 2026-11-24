export {
  PRESTIGE_WISDOM_ACADEMY_LOGO as PRESTIGE_WISDOM_ACADEMY_PARENT_LOGO,
  PRESTIGE_WISDOM_ACADEMY_ADMIN_COLORS,
} from "./prestige-wisdom-academy-admin-demo";

export const PRESTIGE_WISDOM_ACADEMY_PARENT_ACCENT = "#0C1C45";
export const PRESTIGE_WISDOM_ACADEMY_PARENT_ACCENT_HOVER = "#1C3060";
export const PRESTIGE_WISDOM_ACADEMY_PARENT_SCHOOL_NAME = "Prestige Wisdom Academy";
export const PRESTIGE_WISDOM_ACADEMY_PARENT_SCHOOL_SHORT = "PWA";
export const PRESTIGE_WISDOM_ACADEMY_PARENT_OFFICE = "PWA Office";

import { PRESTIGE_WISDOM_ACADEMY_ADMIN_LOGO } from "./prestige-wisdom-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const prestigeWisdomAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "prestige-wisdom-academy",
  logo: PRESTIGE_WISDOM_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: PRESTIGE_WISDOM_ACADEMY_PARENT_ACCENT,
    accentHover: PRESTIGE_WISDOM_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: PRESTIGE_WISDOM_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: PRESTIGE_WISDOM_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: PRESTIGE_WISDOM_ACADEMY_PARENT_OFFICE,
  },
};
