export {
  DESERT_DRAGON_SCHOOL_LOGO as DESERT_DRAGON_SCHOOL_TEACHER_LOGO,
} from "./desert-dragon-school-admin-demo";

export const DESERT_DRAGON_SCHOOL_TEACHER_OFFICE = "Desert Dragon Office";
export const DESERT_DRAGON_SCHOOL_TEACHER_ACCENT = "#28517F";
export const DESERT_DRAGON_SCHOOL_TEACHER_ACCENT_HOVER = "#336499";

export const DESERT_DRAGON_SCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  lower: "Elementary (K–5)",
  upper: "Middle school (6–8)",
};

export const DESERT_DRAGON_SCHOOL_TEACHER_PROGRAM_ORDER = ["lower", "upper"] as const;

import { DESERT_DRAGON_SCHOOL_ADMIN_LOGO } from "./desert-dragon-school-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const desertDragonSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "desert-dragon-school",
  logo: DESERT_DRAGON_SCHOOL_ADMIN_LOGO,
  accent: DESERT_DRAGON_SCHOOL_TEACHER_ACCENT,
  accentHover: DESERT_DRAGON_SCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: DESERT_DRAGON_SCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: DESERT_DRAGON_SCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: DESERT_DRAGON_SCHOOL_TEACHER_OFFICE,
  },
};
