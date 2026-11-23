export {
  MADRONA_SCHOOL_LOGO as MADRONA_SCHOOL_TEACHER_LOGO,
} from "./madrona-school-admin-demo";

export const MADRONA_SCHOOL_TEACHER_OFFICE = "Madrona School Office";
export const MADRONA_SCHOOL_TEACHER_ACCENT = "#073F2C";
export const MADRONA_SCHOOL_TEACHER_ACCENT_HOVER = "#14573F";

export const MADRONA_SCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  parent_child: "Parent-Child",
  huckleberry_preschool: "Huckleberry Preschool",
  salmonberry_kindergarten: "Salmonberry Kindergarten",
  grades: "Grades 1–6",
};

export const MADRONA_SCHOOL_TEACHER_PROGRAM_ORDER = [
  "parent_child",
  "huckleberry_preschool",
  "salmonberry_kindergarten",
  "grades",
] as const;

import { MADRONA_SCHOOL_ADMIN_LOGO } from "./madrona-school-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const madronaSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "madrona-school",
  logo: MADRONA_SCHOOL_ADMIN_LOGO,
  accent: MADRONA_SCHOOL_TEACHER_ACCENT,
  accentHover: MADRONA_SCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: MADRONA_SCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: MADRONA_SCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: MADRONA_SCHOOL_TEACHER_OFFICE,
  },
};
