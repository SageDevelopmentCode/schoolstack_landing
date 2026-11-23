export {
  THE_WILD_SCHOOL_LOGO as THE_WILD_SCHOOL_TEACHER_LOGO,
} from "./the-wild-school-admin-demo";

export const THE_WILD_SCHOOL_TEACHER_OFFICE = "Wild School Family Experience";
export const THE_WILD_SCHOOL_TEACHER_ACCENT = "#3E5A3A";
export const THE_WILD_SCHOOL_TEACHER_ACCENT_HOVER = "#4D6E48";

export const THE_WILD_SCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  preschool: "Wild Preschool (3–5)",
  kindergarten: "Forest Kindergarten (5–6)",
  forestSchool: "Forest School (6–12)",
};

export const THE_WILD_SCHOOL_TEACHER_PROGRAM_ORDER = ["preschool", "kindergarten", "forestSchool"] as const;

import { THE_WILD_SCHOOL_ADMIN_LOGO } from "./the-wild-school-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const theWildSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "the-wild-school",
  logo: THE_WILD_SCHOOL_ADMIN_LOGO,
  accent: THE_WILD_SCHOOL_TEACHER_ACCENT,
  accentHover: THE_WILD_SCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: THE_WILD_SCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: THE_WILD_SCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: THE_WILD_SCHOOL_TEACHER_OFFICE,
  },
};
