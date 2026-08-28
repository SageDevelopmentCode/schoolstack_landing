export {
  MICAH_MISSION_ADMIN_LOGO as MICAH_MISSION_TEACHER_LOGO,
} from "./micahmission-admin-demo";

export const MICAH_MISSION_TEACHER_OFFICE = "Micah's Mission School Office";
export const MICAH_MISSION_TEACHER_ACCENT = "#2F5496";
export const MICAH_MISSION_TEACHER_ACCENT_HOVER = "#244273";

export const MICAH_MISSION_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  summer_26: "Private Microschool",
  school_year_26_27: "Hybrid Homeschool",
  homeschool_drop_in: "Online Learning",
};

export const MICAH_MISSION_TEACHER_PROGRAM_ORDER = [
  "summer_26",
  "school_year_26_27",
  "homeschool_drop_in",
] as const;


import { MICAH_MISSION_ADMIN_LOGO } from "./micahmission-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const micahsMissionSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "micahs-mission-school",
  logo: MICAH_MISSION_ADMIN_LOGO,
  accent: MICAH_MISSION_TEACHER_ACCENT,
  accentHover: MICAH_MISSION_TEACHER_ACCENT_HOVER,
  programLabels: MICAH_MISSION_TEACHER_PROGRAM_LABELS,
  programOrder: MICAH_MISSION_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: MICAH_MISSION_TEACHER_OFFICE,
  },
};
