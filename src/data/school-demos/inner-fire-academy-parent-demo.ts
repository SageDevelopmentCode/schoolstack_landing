export {
  INNER_FIRE_ACADEMY_LOGO as INNER_FIRE_ACADEMY_PARENT_LOGO,
  INNER_FIRE_ACADEMY_ADMIN_COLORS,
} from "./inner-fire-academy-admin-demo";

export const INNER_FIRE_ACADEMY_PARENT_ACCENT = "#222222";
export const INNER_FIRE_ACADEMY_PARENT_ACCENT_HOVER = "#3A3A3A";
export const INNER_FIRE_ACADEMY_PARENT_SCHOOL_NAME = "Inner Fire Academy";
export const INNER_FIRE_ACADEMY_PARENT_SCHOOL_SHORT = "Inner Fire";
export const INNER_FIRE_ACADEMY_PARENT_OFFICE = "Inner Fire Office";

import { INNER_FIRE_ACADEMY_ADMIN_LOGO } from "./inner-fire-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const innerFireAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "inner-fire-academy",
  logo: INNER_FIRE_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: INNER_FIRE_ACADEMY_PARENT_ACCENT,
    accentHover: INNER_FIRE_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: INNER_FIRE_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: INNER_FIRE_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: INNER_FIRE_ACADEMY_PARENT_OFFICE,
  },
};
