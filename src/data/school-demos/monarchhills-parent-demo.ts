export {
  MONARCH_HILLS_ADMIN_LOGO as MONARCH_HILLS_PARENT_LOGO,
  MONARCH_HILLS_ADMIN_COLORS,
} from "./monarchhills-admin-demo";

export const MONARCH_HILLS_PARENT_ACCENT = "#233975";
export const MONARCH_HILLS_PARENT_ACCENT_HOVER = "#1B2D5C";
export const MONARCH_HILLS_PARENT_SCHOOL_NAME = "Monarch Hills Education";
export const MONARCH_HILLS_PARENT_SCHOOL_SHORT = "Monarch Hills";
export const MONARCH_HILLS_PARENT_OFFICE = "Monarch Hills Education Office";


import { MONARCH_HILLS_ADMIN_LOGO } from "./monarchhills-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const monarchHillsEducationParentDemoConfig: SchoolParentDemoConfig = {
  slug: "monarch-hills-education",
  logo: MONARCH_HILLS_ADMIN_LOGO,
  colors: {
    accent: MONARCH_HILLS_PARENT_ACCENT,
    accentHover: MONARCH_HILLS_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: MONARCH_HILLS_PARENT_SCHOOL_NAME,
    schoolShortName: MONARCH_HILLS_PARENT_SCHOOL_SHORT,
    officeName: MONARCH_HILLS_PARENT_OFFICE,
  },
};
