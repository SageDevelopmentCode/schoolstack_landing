export {
  INVICTUS_LEANDER_LOGO as INVICTUS_LEANDER_TEACHER_LOGO,
} from "./invictus-leander-admin-demo";

export const INVICTUS_LEANDER_TEACHER_OFFICE = "Invictus Front Desk";
export const INVICTUS_LEANDER_TEACHER_ACCENT = "#5E1A24";
export const INVICTUS_LEANDER_TEACHER_ACCENT_HOVER = "#7A2531";

export const INVICTUS_LEANDER_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  spark: "Spark Studio (3.5–6)",
  discovery: "Discovery Studio (7–11)",
};

export const INVICTUS_LEANDER_TEACHER_PROGRAM_ORDER = ["spark", "discovery"] as const;

import { INVICTUS_LEANDER_ADMIN_LOGO } from "./invictus-leander-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const invictusLeanderTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "invictus-leander",
  logo: INVICTUS_LEANDER_ADMIN_LOGO,
  accent: INVICTUS_LEANDER_TEACHER_ACCENT,
  accentHover: INVICTUS_LEANDER_TEACHER_ACCENT_HOVER,
  programLabels: INVICTUS_LEANDER_TEACHER_PROGRAM_LABELS,
  programOrder: INVICTUS_LEANDER_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: INVICTUS_LEANDER_TEACHER_OFFICE,
  },
};
