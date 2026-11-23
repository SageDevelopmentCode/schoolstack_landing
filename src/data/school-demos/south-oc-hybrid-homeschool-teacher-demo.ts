export {
  SOUTH_OC_HYBRID_HOMESCHOOL_LOGO as SOUTH_OC_HYBRID_HOMESCHOOL_TEACHER_LOGO,
} from "./south-oc-hybrid-homeschool-admin-demo";

export const SOUTH_OC_HYBRID_HOMESCHOOL_TEACHER_OFFICE = "SOCHH Office";
export const SOUTH_OC_HYBRID_HOMESCHOOL_TEACHER_ACCENT = "#0A2550";
export const SOUTH_OC_HYBRID_HOMESCHOOL_TEACHER_ACCENT_HOVER = "#1B3B72";

export const SOUTH_OC_HYBRID_HOMESCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  tkk: "TK & Kindergarten",
  core: "CORE 1st–5th",
  middle: "CORE Middle School",
};

export const SOUTH_OC_HYBRID_HOMESCHOOL_TEACHER_PROGRAM_ORDER = ["tkk", "core", "middle"] as const;

import { SOUTH_OC_HYBRID_HOMESCHOOL_ADMIN_LOGO } from "./south-oc-hybrid-homeschool-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const southOcHybridHomeschoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "south-oc-hybrid-homeschool",
  logo: SOUTH_OC_HYBRID_HOMESCHOOL_ADMIN_LOGO,
  accent: SOUTH_OC_HYBRID_HOMESCHOOL_TEACHER_ACCENT,
  accentHover: SOUTH_OC_HYBRID_HOMESCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: SOUTH_OC_HYBRID_HOMESCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: SOUTH_OC_HYBRID_HOMESCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: SOUTH_OC_HYBRID_HOMESCHOOL_TEACHER_OFFICE,
  },
};
