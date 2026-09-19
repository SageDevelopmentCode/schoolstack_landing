export {
  ASHEBORO_HYBRID_ACADEMY_LOGO as ASHEBORO_HYBRID_ACADEMY_PARENT_LOGO,
  ASHEBORO_HYBRID_ACADEMY_ADMIN_COLORS,
} from "./asheboro-hybrid-academy-admin-demo";

export const ASHEBORO_HYBRID_ACADEMY_PARENT_ACCENT = "#0B2545";
export const ASHEBORO_HYBRID_ACADEMY_PARENT_ACCENT_HOVER = "#07192F";
export const ASHEBORO_HYBRID_ACADEMY_PARENT_SCHOOL_NAME = "Asheboro Hybrid Academy";
export const ASHEBORO_HYBRID_ACADEMY_PARENT_SCHOOL_SHORT = "AHA";
export const ASHEBORO_HYBRID_ACADEMY_PARENT_OFFICE = "Asheboro Hybrid Academy Office";

import { ASHEBORO_HYBRID_ACADEMY_ADMIN_LOGO } from "./asheboro-hybrid-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const asheboroHybridAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "asheboro-hybrid-academy",
  logo: ASHEBORO_HYBRID_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: ASHEBORO_HYBRID_ACADEMY_PARENT_ACCENT,
    accentHover: ASHEBORO_HYBRID_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: ASHEBORO_HYBRID_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: ASHEBORO_HYBRID_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: ASHEBORO_HYBRID_ACADEMY_PARENT_OFFICE,
  },
};
