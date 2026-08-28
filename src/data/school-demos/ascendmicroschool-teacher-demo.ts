export {
  ASCEND_MICROSCHOOL_ADMIN_LOGO as ASCEND_MICROSCHOOL_TEACHER_LOGO,
} from "./ascendmicroschool-admin-demo";

export const ASCEND_MICROSCHOOL_TEACHER_OFFICE = "Ascend Micro School Office";
export const ASCEND_MICROSCHOOL_TEACHER_ACCENT = "#165C9A";
export const ASCEND_MICROSCHOOL_TEACHER_ACCENT_HOVER = "#124A7C";

export const ASCEND_MICROSCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  school_year_26_27: "Hybrid 2-Day Program (Tues/Thurs)",
  homeschool_drop_in: "Curriculum Consulting",
  summer_26: "Independent Instruction",
};

export const ASCEND_MICROSCHOOL_TEACHER_PROGRAM_ORDER = [
  "school_year_26_27",
  "homeschool_drop_in",
  "summer_26",
] as const;


import { ASCEND_MICROSCHOOL_ADMIN_LOGO } from "./ascendmicroschool-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const ascendMicroSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "ascend-micro-school",
  logo: ASCEND_MICROSCHOOL_ADMIN_LOGO,
  accent: ASCEND_MICROSCHOOL_TEACHER_ACCENT,
  accentHover: ASCEND_MICROSCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: ASCEND_MICROSCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: ASCEND_MICROSCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: ASCEND_MICROSCHOOL_TEACHER_OFFICE,
  },
};
