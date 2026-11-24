export {
  HEARTSONG_COTTAGE_SCHOOL_LOGO as HEARTSONG_COTTAGE_SCHOOL_TEACHER_LOGO,
} from "./heartsong-cottage-school-admin-demo";

export const HEARTSONG_COTTAGE_SCHOOL_TEACHER_OFFICE = "Heartsong Cottage School";
export const HEARTSONG_COTTAGE_SCHOOL_TEACHER_ACCENT = "#213472";
export const HEARTSONG_COTTAGE_SCHOOL_TEACHER_ACCENT_HOVER = "#2F4691";

export const HEARTSONG_COTTAGE_SCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  first_second: "First/Second Grade",
  third_fourth: "Third/Fourth Grade",
  fifth_sixth: "Fifth/Sixth Grade",
};

export const HEARTSONG_COTTAGE_SCHOOL_TEACHER_PROGRAM_ORDER = ["first_second", "third_fourth", "fifth_sixth"] as const;

import { HEARTSONG_COTTAGE_SCHOOL_ADMIN_LOGO } from "./heartsong-cottage-school-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const heartsongCottageSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "heartsong-cottage-school",
  logo: HEARTSONG_COTTAGE_SCHOOL_ADMIN_LOGO,
  accent: HEARTSONG_COTTAGE_SCHOOL_TEACHER_ACCENT,
  accentHover: HEARTSONG_COTTAGE_SCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: HEARTSONG_COTTAGE_SCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: HEARTSONG_COTTAGE_SCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: HEARTSONG_COTTAGE_SCHOOL_TEACHER_OFFICE,
  },
};
