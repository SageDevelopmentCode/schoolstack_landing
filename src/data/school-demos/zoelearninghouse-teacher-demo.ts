export {
  ZOE_LEARNING_HOUSE_ADMIN_LOGO as ZOE_LEARNING_HOUSE_TEACHER_LOGO,
} from "./zoelearninghouse-admin-demo";

export const ZOE_LEARNING_HOUSE_TEACHER_OFFICE = "Zoe Learning House Office";
export const ZOE_LEARNING_HOUSE_TEACHER_ACCENT = "#5F8A7A";
export const ZOE_LEARNING_HOUSE_TEACHER_ACCENT_HOVER = "#4A7568";

export const ZOE_LEARNING_HOUSE_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  summer_26: "Full-Time · 5 Days",
  school_year_26_27: "Part-Time · 3 Days",
  homeschool_drop_in: "Part-Time · 1–2 Days",
};

export const ZOE_LEARNING_HOUSE_TEACHER_PROGRAM_ORDER = [
  "summer_26",
  "school_year_26_27",
  "homeschool_drop_in",
] as const;


import { ZOE_LEARNING_HOUSE_ADMIN_LOGO } from "./zoelearninghouse-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const zoeLearningHouseTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "zoe-learning-house",
  logo: ZOE_LEARNING_HOUSE_ADMIN_LOGO,
  accent: ZOE_LEARNING_HOUSE_TEACHER_ACCENT,
  accentHover: ZOE_LEARNING_HOUSE_TEACHER_ACCENT_HOVER,
  programLabels: ZOE_LEARNING_HOUSE_TEACHER_PROGRAM_LABELS,
  programOrder: ZOE_LEARNING_HOUSE_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: ZOE_LEARNING_HOUSE_TEACHER_OFFICE,
  },
};
