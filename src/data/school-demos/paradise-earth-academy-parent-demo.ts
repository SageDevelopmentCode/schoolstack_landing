export {
  PARADISE_EARTH_ACADEMY_LOGO as PARADISE_EARTH_ACADEMY_PARENT_LOGO,
  PARADISE_EARTH_ACADEMY_ADMIN_COLORS,
} from "./paradise-earth-academy-admin-demo";

export const PARADISE_EARTH_ACADEMY_PARENT_ACCENT = "#EB8444";
export const PARADISE_EARTH_ACADEMY_PARENT_ACCENT_HOVER = "#D9732F";
export const PARADISE_EARTH_ACADEMY_PARENT_SCHOOL_NAME = "Paradise Earth Academy";
export const PARADISE_EARTH_ACADEMY_PARENT_SCHOOL_SHORT = "PEA";
export const PARADISE_EARTH_ACADEMY_PARENT_OFFICE = "Paradise Earth Academy Office";


import { PARADISE_EARTH_ACADEMY_ADMIN_LOGO } from "./paradise-earth-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const paradiseEarthAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "paradise-earth-academy",
  logo: PARADISE_EARTH_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: PARADISE_EARTH_ACADEMY_PARENT_ACCENT,
    accentHover: PARADISE_EARTH_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: PARADISE_EARTH_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: PARADISE_EARTH_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: PARADISE_EARTH_ACADEMY_PARENT_OFFICE,
  },
};
