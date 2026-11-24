export {
  GARDEN_SCHOOL_MARIETTA_LOGO as GARDEN_SCHOOL_MARIETTA_TEACHER_LOGO,
} from "./garden-school-marietta-admin-demo";

export const GARDEN_SCHOOL_MARIETTA_TEACHER_OFFICE = "Garden School Office";
export const GARDEN_SCHOOL_MARIETTA_TEACHER_ACCENT = "#4B5F00";
export const GARDEN_SCHOOL_MARIETTA_TEACHER_ACCENT_HOVER = "#5E7510";

export const GARDEN_SCHOOL_MARIETTA_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  joyful: "Joyful Beginnings (2–3)",
  kindergarten: "Forest Kindergarten (4–6)",
  grades: "Grades 1–8",
};

export const GARDEN_SCHOOL_MARIETTA_TEACHER_PROGRAM_ORDER = ["joyful", "kindergarten", "grades"] as const;

import { GARDEN_SCHOOL_MARIETTA_ADMIN_LOGO } from "./garden-school-marietta-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const gardenSchoolMariettaTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "garden-school-marietta",
  logo: GARDEN_SCHOOL_MARIETTA_ADMIN_LOGO,
  accent: GARDEN_SCHOOL_MARIETTA_TEACHER_ACCENT,
  accentHover: GARDEN_SCHOOL_MARIETTA_TEACHER_ACCENT_HOVER,
  programLabels: GARDEN_SCHOOL_MARIETTA_TEACHER_PROGRAM_LABELS,
  programOrder: GARDEN_SCHOOL_MARIETTA_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: GARDEN_SCHOOL_MARIETTA_TEACHER_OFFICE,
  },
};
