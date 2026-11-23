export {
  FOOTHILL_CHRISTIAN_ACADEMY_LOGO as FOOTHILL_CHRISTIAN_ACADEMY_PARENT_LOGO,
  FOOTHILL_CHRISTIAN_ACADEMY_ADMIN_COLORS,
} from "./foothill-christian-academy-admin-demo";

export const FOOTHILL_CHRISTIAN_ACADEMY_PARENT_ACCENT = "#1E3556";
export const FOOTHILL_CHRISTIAN_ACADEMY_PARENT_ACCENT_HOVER = "#2C4A73";
export const FOOTHILL_CHRISTIAN_ACADEMY_PARENT_SCHOOL_NAME = "Foothill Christian Academy";
export const FOOTHILL_CHRISTIAN_ACADEMY_PARENT_SCHOOL_SHORT = "FCA";
export const FOOTHILL_CHRISTIAN_ACADEMY_PARENT_OFFICE = "FCA Office";

import { FOOTHILL_CHRISTIAN_ACADEMY_ADMIN_LOGO } from "./foothill-christian-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const foothillChristianAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "foothill-christian-academy",
  logo: FOOTHILL_CHRISTIAN_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: FOOTHILL_CHRISTIAN_ACADEMY_PARENT_ACCENT,
    accentHover: FOOTHILL_CHRISTIAN_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: FOOTHILL_CHRISTIAN_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: FOOTHILL_CHRISTIAN_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: FOOTHILL_CHRISTIAN_ACADEMY_PARENT_OFFICE,
  },
};
