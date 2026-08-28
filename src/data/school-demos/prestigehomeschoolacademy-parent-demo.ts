export {
  PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_LOGO as PRESTIGE_HOMESCHOOL_ACADEMY_PARENT_LOGO,
  PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_COLORS,
} from "./prestigehomeschoolacademy-admin-demo";

export const PRESTIGE_HOMESCHOOL_ACADEMY_PARENT_ACCENT = "#1087E5";
export const PRESTIGE_HOMESCHOOL_ACADEMY_PARENT_ACCENT_HOVER = "#0879D4";
export const PRESTIGE_HOMESCHOOL_ACADEMY_PARENT_SCHOOL_NAME =
  "Prestige Homeschool Academy";
export const PRESTIGE_HOMESCHOOL_ACADEMY_PARENT_SCHOOL_SHORT =
  "Prestige Homeschool Academy";
export const PRESTIGE_HOMESCHOOL_ACADEMY_PARENT_OFFICE =
  "Prestige Homeschool Academy Office";


import { PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_LOGO } from "./prestigehomeschoolacademy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const prestigeHomeschoolAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "prestige-homeschool-academy",
  logo: PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: PRESTIGE_HOMESCHOOL_ACADEMY_PARENT_ACCENT,
    accentHover: PRESTIGE_HOMESCHOOL_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: PRESTIGE_HOMESCHOOL_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: PRESTIGE_HOMESCHOOL_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: PRESTIGE_HOMESCHOOL_ACADEMY_PARENT_OFFICE,
  },
};
