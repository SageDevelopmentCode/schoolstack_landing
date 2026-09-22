export {
  RIVER_OAK_ACADEMY_LOGO as RIVER_OAK_ACADEMY_TEACHER_LOGO,
} from "./river-oak-academy-admin-demo";

export const RIVER_OAK_ACADEMY_TEACHER_OFFICE = "River Oak Academy Office";
export const RIVER_OAK_ACADEMY_TEACHER_ACCENT = "#496846";
export const RIVER_OAK_ACADEMY_TEACHER_ACCENT_HOVER = "#24372B";

export const RIVER_OAK_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  spark_studio: "Spark Studio",
  elementary_studio: "Elementary Studio",
  middle_school_studio: "Middle School Studio",
  future_launch_pad: "Future Launch Pad",
};

export const RIVER_OAK_ACADEMY_TEACHER_PROGRAM_ORDER = [
  "spark_studio",
  "elementary_studio",
  "middle_school_studio",
  "future_launch_pad",
] as const;

import { RIVER_OAK_ACADEMY_ADMIN_LOGO } from "./river-oak-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const riverOakAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "river-oak-academy",
  logo: RIVER_OAK_ACADEMY_ADMIN_LOGO,
  accent: RIVER_OAK_ACADEMY_TEACHER_ACCENT,
  accentHover: RIVER_OAK_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: RIVER_OAK_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: RIVER_OAK_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: RIVER_OAK_ACADEMY_TEACHER_OFFICE,
  },
};
