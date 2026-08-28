export {
  AUSTIN_MICRO_SCHOOL_LOGO as AUSTIN_MICRO_SCHOOL_PARENT_LOGO,
  AUSTIN_MICRO_SCHOOL_ADMIN_COLORS,
} from "./austin-micro-school-admin-demo";

export const AUSTIN_MICRO_SCHOOL_PARENT_ACCENT = "#0C8A3A";
export const AUSTIN_MICRO_SCHOOL_PARENT_ACCENT_HOVER = "#0A7532";
export const AUSTIN_MICRO_SCHOOL_PARENT_SCHOOL_NAME = "Austin Micro School";
export const AUSTIN_MICRO_SCHOOL_PARENT_SCHOOL_SHORT = "Austin Micro School";
export const AUSTIN_MICRO_SCHOOL_PARENT_OFFICE = "Austin Micro School Office";


import { AUSTIN_MICRO_SCHOOL_ADMIN_LOGO } from "./austin-micro-school-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const austinMicroSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "austin-micro-school",
  logo: AUSTIN_MICRO_SCHOOL_ADMIN_LOGO,
  colors: {
    accent: AUSTIN_MICRO_SCHOOL_PARENT_ACCENT,
    accentHover: AUSTIN_MICRO_SCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: AUSTIN_MICRO_SCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: AUSTIN_MICRO_SCHOOL_PARENT_SCHOOL_SHORT,
    officeName: AUSTIN_MICRO_SCHOOL_PARENT_OFFICE,
  },
};
