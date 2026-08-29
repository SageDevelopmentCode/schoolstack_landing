export {
  HILTON_HORIZON_ADMIN_LOGO as HILTON_HORIZON_TEACHER_LOGO,
} from "./hiltonhorizon-admin-demo";

export const HILTON_HORIZON_TEACHER_OFFICE = "Hilton Horizons Academy Office";
export const HILTON_HORIZON_TEACHER_ACCENT = "#1B3664";
export const HILTON_HORIZON_TEACHER_ACCENT_HOVER = "#152A52";

export const HILTON_HORIZON_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  summer_26: "Category III Private School",
  school_year_26_27: "Hybrid Microschool · Kingsport",
  homeschool_drop_in: "Hybrid Microschool · Johnson City",
};

export const HILTON_HORIZON_TEACHER_PROGRAM_ORDER = [
  "summer_26",
  "school_year_26_27",
  "homeschool_drop_in",
] as const;


import { HILTON_HORIZON_ADMIN_LOGO } from "./hiltonhorizon-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const hiltonHorizonsAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "hilton-horizons-academy",
  logo: HILTON_HORIZON_ADMIN_LOGO,
  accent: HILTON_HORIZON_TEACHER_ACCENT,
  accentHover: HILTON_HORIZON_TEACHER_ACCENT_HOVER,
  programLabels: HILTON_HORIZON_TEACHER_PROGRAM_LABELS,
  programOrder: HILTON_HORIZON_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: HILTON_HORIZON_TEACHER_OFFICE,
  },
};
