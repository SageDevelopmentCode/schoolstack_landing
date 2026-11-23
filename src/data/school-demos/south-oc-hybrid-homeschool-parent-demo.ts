export {
  SOUTH_OC_HYBRID_HOMESCHOOL_LOGO as SOUTH_OC_HYBRID_HOMESCHOOL_PARENT_LOGO,
  SOUTH_OC_HYBRID_HOMESCHOOL_ADMIN_COLORS,
} from "./south-oc-hybrid-homeschool-admin-demo";

export const SOUTH_OC_HYBRID_HOMESCHOOL_PARENT_ACCENT = "#0A2550";
export const SOUTH_OC_HYBRID_HOMESCHOOL_PARENT_ACCENT_HOVER = "#1B3B72";
export const SOUTH_OC_HYBRID_HOMESCHOOL_PARENT_SCHOOL_NAME = "South OC Hybrid Homeschool";
export const SOUTH_OC_HYBRID_HOMESCHOOL_PARENT_SCHOOL_SHORT = "SOCHH";
export const SOUTH_OC_HYBRID_HOMESCHOOL_PARENT_OFFICE = "SOCHH Office";

import { SOUTH_OC_HYBRID_HOMESCHOOL_ADMIN_LOGO } from "./south-oc-hybrid-homeschool-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const southOcHybridHomeschoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "south-oc-hybrid-homeschool",
  logo: SOUTH_OC_HYBRID_HOMESCHOOL_ADMIN_LOGO,
  colors: {
    accent: SOUTH_OC_HYBRID_HOMESCHOOL_PARENT_ACCENT,
    accentHover: SOUTH_OC_HYBRID_HOMESCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: SOUTH_OC_HYBRID_HOMESCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: SOUTH_OC_HYBRID_HOMESCHOOL_PARENT_SCHOOL_SHORT,
    officeName: SOUTH_OC_HYBRID_HOMESCHOOL_PARENT_OFFICE,
  },
};
