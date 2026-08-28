export {
  ARIZONA_GIFTED_ACADEMY_ADMIN_LOGO as ARIZONA_GIFTED_ACADEMY_PARENT_LOGO,
  ARIZONA_GIFTED_ACADEMY_ADMIN_COLORS,
} from "./arizonagiftedacademy-admin-demo";

export const ARIZONA_GIFTED_ACADEMY_PARENT_ACCENT = "#1B3147";
export const ARIZONA_GIFTED_ACADEMY_PARENT_ACCENT_HOVER = "#142638";
export const ARIZONA_GIFTED_ACADEMY_PARENT_SCHOOL_NAME = "Arizona Gifted Academy";
export const ARIZONA_GIFTED_ACADEMY_PARENT_SCHOOL_SHORT = "Arizona Gifted Academy";
export const ARIZONA_GIFTED_ACADEMY_PARENT_OFFICE = "Arizona Gifted Academy Office";


import { ARIZONA_GIFTED_ACADEMY_ADMIN_LOGO } from "./arizonagiftedacademy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const arizonaGiftedAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "arizona-gifted-academy",
  logo: ARIZONA_GIFTED_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: ARIZONA_GIFTED_ACADEMY_PARENT_ACCENT,
    accentHover: ARIZONA_GIFTED_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: ARIZONA_GIFTED_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: ARIZONA_GIFTED_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: ARIZONA_GIFTED_ACADEMY_PARENT_OFFICE,
  },
};
