export {
  GIFTED_COLLECTIVE_MICROSCHOOL_LOGO as GIFTED_COLLECTIVE_MICROSCHOOL_TEACHER_LOGO,
} from "./gifted-collective-microschool-admin-demo";

export const GIFTED_COLLECTIVE_MICROSCHOOL_TEACHER_OFFICE = "Gifted Collective Office";
export const GIFTED_COLLECTIVE_MICROSCHOOL_TEACHER_ACCENT = "#2E1A47";
export const GIFTED_COLLECTIVE_MICROSCHOOL_TEACHER_ACCENT_HOVER = "#432A63";

export const GIFTED_COLLECTIVE_MICROSCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  lower: "Advanced Learners Academy",
  upper: "Unique Learners 2e Academy",
};

export const GIFTED_COLLECTIVE_MICROSCHOOL_TEACHER_PROGRAM_ORDER = ["lower", "upper"] as const;

import { GIFTED_COLLECTIVE_MICROSCHOOL_ADMIN_LOGO } from "./gifted-collective-microschool-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const giftedCollectiveMicroschoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "gifted-collective-microschool",
  logo: GIFTED_COLLECTIVE_MICROSCHOOL_ADMIN_LOGO,
  accent: GIFTED_COLLECTIVE_MICROSCHOOL_TEACHER_ACCENT,
  accentHover: GIFTED_COLLECTIVE_MICROSCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: GIFTED_COLLECTIVE_MICROSCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: GIFTED_COLLECTIVE_MICROSCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: GIFTED_COLLECTIVE_MICROSCHOOL_TEACHER_OFFICE,
  },
};
