export {
  SPRING_RIVER_SCHOOL_ADMIN_LOGO as SPRING_RIVER_SCHOOL_PARENT_LOGO,
  SPRING_RIVER_SCHOOL_ADMIN_COLORS,
} from "./springriverschool-admin-demo";

export const SPRING_RIVER_SCHOOL_PARENT_ACCENT = "#2F3D34";
export const SPRING_RIVER_SCHOOL_PARENT_ACCENT_HOVER = "#243028";
export const SPRING_RIVER_SCHOOL_PARENT_SCHOOL_NAME = "Spring River School";
export const SPRING_RIVER_SCHOOL_PARENT_SCHOOL_SHORT = "Spring River";
export const SPRING_RIVER_SCHOOL_PARENT_OFFICE = "Spring River School Office";


import { SPRING_RIVER_SCHOOL_ADMIN_LOGO } from "./springriverschool-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const springRiverSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "spring-river-school",
  logo: SPRING_RIVER_SCHOOL_ADMIN_LOGO,
  colors: {
    accent: SPRING_RIVER_SCHOOL_PARENT_ACCENT,
    accentHover: SPRING_RIVER_SCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: SPRING_RIVER_SCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: SPRING_RIVER_SCHOOL_PARENT_SCHOOL_SHORT,
    officeName: SPRING_RIVER_SCHOOL_PARENT_OFFICE,
  },
};
