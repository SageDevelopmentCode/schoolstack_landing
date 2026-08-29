export {
  AUSTIN_MICRO_SCHOOL_LOGO as AUSTIN_MICRO_SCHOOL_TEACHER_LOGO,
} from "./austin-micro-school-admin-demo";

export const AUSTIN_MICRO_SCHOOL_TEACHER_OFFICE = "Austin Micro School Office";
export const AUSTIN_MICRO_SCHOOL_TEACHER_ACCENT = "#0C8A3A";
export const AUSTIN_MICRO_SCHOOL_TEACHER_ACCENT_HOVER = "#0A7532";

export const AUSTIN_MICRO_SCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  full_time: "Full-Time Program",
  hybrid: "Hybrid Program",
  adolescent: "Adolescent Program",
  remote: "Remote Program",
};

export const AUSTIN_MICRO_SCHOOL_TEACHER_PROGRAM_ORDER = [
  "full_time",
  "hybrid",
  "adolescent",
  "remote",
] as const;


import { AUSTIN_MICRO_SCHOOL_ADMIN_LOGO } from "./austin-micro-school-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const austinMicroSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "austin-micro-school",
  logo: AUSTIN_MICRO_SCHOOL_ADMIN_LOGO,
  accent: AUSTIN_MICRO_SCHOOL_TEACHER_ACCENT,
  accentHover: AUSTIN_MICRO_SCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: AUSTIN_MICRO_SCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: AUSTIN_MICRO_SCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: AUSTIN_MICRO_SCHOOL_TEACHER_OFFICE,
  },
};
