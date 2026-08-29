export {
  KATS_COMMUNITY_MICROSCHOOL_LOGO as KATS_COMMUNITY_MICROSCHOOL_TEACHER_LOGO,
} from "./kats-community-microschool-admin-demo";

export const KATS_COMMUNITY_MICROSCHOOL_TEACHER_OFFICE = "Kat's Community Microschool Office";
export const KATS_COMMUNITY_MICROSCHOOL_TEACHER_ACCENT = "#285943";
export const KATS_COMMUNITY_MICROSCHOOL_TEACHER_ACCENT_HOVER = "#1f4535";

export const KATS_COMMUNITY_MICROSCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  grades_3_4: "Grades 3–4",
  grades_5_6: "Grades 5–6",
};

export const KATS_COMMUNITY_MICROSCHOOL_TEACHER_PROGRAM_ORDER = [
  "grades_3_4",
  "grades_5_6",
] as const;


import { KATS_COMMUNITY_MICROSCHOOL_ADMIN_LOGO } from "./kats-community-microschool-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const katsCommunityMicroschoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "kats-community-microschool",
  logo: KATS_COMMUNITY_MICROSCHOOL_ADMIN_LOGO,
  accent: KATS_COMMUNITY_MICROSCHOOL_TEACHER_ACCENT,
  accentHover: KATS_COMMUNITY_MICROSCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: KATS_COMMUNITY_MICROSCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: KATS_COMMUNITY_MICROSCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: KATS_COMMUNITY_MICROSCHOOL_TEACHER_OFFICE,
  },
};
