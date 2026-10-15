export {
  WILDCAT_MICROSCHOOL_LOGO as WILDCAT_MICROSCHOOL_TEACHER_LOGO,
} from "./wildcat-microschool-admin-demo";

export const WILDCAT_MICROSCHOOL_TEACHER_OFFICE = "Wildcat Microschool Office";
export const WILDCAT_MICROSCHOOL_TEACHER_ACCENT = "#071C37";
export const WILDCAT_MICROSCHOOL_TEACHER_ACCENT_HOVER = "#123056";

export const WILDCAT_MICROSCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  student_driven: "Student-driven learning",
  hands_on: "Hands-on projects",
  nature_based: "Nature-based learning",
  collaborative: "Collaborative learning",
};

export const WILDCAT_MICROSCHOOL_TEACHER_PROGRAM_ORDER = [
  "student_driven",
  "hands_on",
  "nature_based",
  "collaborative",
] as const;

import { WILDCAT_MICROSCHOOL_ADMIN_LOGO } from "./wildcat-microschool-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const wildcatMicroschoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "wildcat-microschool",
  logo: WILDCAT_MICROSCHOOL_ADMIN_LOGO,
  accent: WILDCAT_MICROSCHOOL_TEACHER_ACCENT,
  accentHover: WILDCAT_MICROSCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: WILDCAT_MICROSCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: WILDCAT_MICROSCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: WILDCAT_MICROSCHOOL_TEACHER_OFFICE,
  },
};
