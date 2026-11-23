export {
  ELITE_PERFORMANCE_PREP_FREEPORT_LOGO as ELITE_PERFORMANCE_PREP_FREEPORT_PARENT_LOGO,
  ELITE_PERFORMANCE_PREP_FREEPORT_ADMIN_COLORS,
} from "./elite-performance-prep-freeport-admin-demo";

export const ELITE_PERFORMANCE_PREP_FREEPORT_PARENT_ACCENT = "#0F172A";
export const ELITE_PERFORMANCE_PREP_FREEPORT_PARENT_ACCENT_HOVER = "#1E293B";
export const ELITE_PERFORMANCE_PREP_FREEPORT_PARENT_SCHOOL_NAME = "Elite Performance Prep Academy Freeport";
export const ELITE_PERFORMANCE_PREP_FREEPORT_PARENT_SCHOOL_SHORT = "Elite Freeport";
export const ELITE_PERFORMANCE_PREP_FREEPORT_PARENT_OFFICE = "Elite Freeport Office";

import { ELITE_PERFORMANCE_PREP_FREEPORT_ADMIN_LOGO } from "./elite-performance-prep-freeport-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const elitePerformancePrepFreeportParentDemoConfig: SchoolParentDemoConfig = {
  slug: "elite-performance-prep-freeport",
  logo: ELITE_PERFORMANCE_PREP_FREEPORT_ADMIN_LOGO,
  colors: {
    accent: ELITE_PERFORMANCE_PREP_FREEPORT_PARENT_ACCENT,
    accentHover: ELITE_PERFORMANCE_PREP_FREEPORT_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: ELITE_PERFORMANCE_PREP_FREEPORT_PARENT_SCHOOL_NAME,
    schoolShortName: ELITE_PERFORMANCE_PREP_FREEPORT_PARENT_SCHOOL_SHORT,
    officeName: ELITE_PERFORMANCE_PREP_FREEPORT_PARENT_OFFICE,
  },
};
