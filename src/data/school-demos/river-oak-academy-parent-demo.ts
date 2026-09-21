export {
  RIVER_OAK_ACADEMY_LOGO as RIVER_OAK_ACADEMY_PARENT_LOGO,
  RIVER_OAK_ACADEMY_ADMIN_COLORS,
} from "./river-oak-academy-admin-demo";

export const RIVER_OAK_ACADEMY_PARENT_ACCENT = "#496846";
export const RIVER_OAK_ACADEMY_PARENT_ACCENT_HOVER = "#24372B";
export const RIVER_OAK_ACADEMY_PARENT_SCHOOL_NAME = "River Oak Academy";
export const RIVER_OAK_ACADEMY_PARENT_SCHOOL_SHORT = "River Oak";
export const RIVER_OAK_ACADEMY_PARENT_OFFICE = "River Oak Academy Office";

import { RIVER_OAK_ACADEMY_ADMIN_LOGO } from "./river-oak-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const riverOakAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "river-oak-academy",
  logo: RIVER_OAK_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: RIVER_OAK_ACADEMY_PARENT_ACCENT,
    accentHover: RIVER_OAK_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: RIVER_OAK_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: RIVER_OAK_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: RIVER_OAK_ACADEMY_PARENT_OFFICE,
  },
};
