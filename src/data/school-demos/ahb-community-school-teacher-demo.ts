export {
  AHB_COMMUNITY_SCHOOL_LOGO as AHB_COMMUNITY_SCHOOL_TEACHER_LOGO,
} from "./ahb-community-school-admin-demo";

export const AHB_COMMUNITY_SCHOOL_TEACHER_OFFICE = "AHB Office";
export const AHB_COMMUNITY_SCHOOL_TEACHER_ACCENT = "#0076B4";
export const AHB_COMMUNITY_SCHOOL_TEACHER_ACCENT_HOVER = "#005E92";

export const AHB_COMMUNITY_SCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  elementary: "Elementary (K–4)",
  middle: "Middle school (5–8)",
};

export const AHB_COMMUNITY_SCHOOL_TEACHER_PROGRAM_ORDER = ["elementary", "middle"] as const;

import { AHB_COMMUNITY_SCHOOL_ADMIN_LOGO } from "./ahb-community-school-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const ahbCommunitySchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "ahb-community-school",
  logo: AHB_COMMUNITY_SCHOOL_ADMIN_LOGO,
  accent: AHB_COMMUNITY_SCHOOL_TEACHER_ACCENT,
  accentHover: AHB_COMMUNITY_SCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: AHB_COMMUNITY_SCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: AHB_COMMUNITY_SCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: AHB_COMMUNITY_SCHOOL_TEACHER_OFFICE,
  },
};
