export {
  SPRING_RIVER_SCHOOL_ADMIN_LOGO as SPRING_RIVER_SCHOOL_TEACHER_LOGO,
} from "./springriverschool-admin-demo";

export const SPRING_RIVER_SCHOOL_TEACHER_OFFICE = "Spring River School Office";
export const SPRING_RIVER_SCHOOL_TEACHER_ACCENT = "#2F3D34";
export const SPRING_RIVER_SCHOOL_TEACHER_ACCENT_HOVER = "#243028";

export const SPRING_RIVER_SCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  four_day_outdoor: "4-Day All-Outdoor Program (K-8)",
  two_day_enrichment: "2-Day Homeschool Enrichment (1-5)",
  forest_school: "Forest School Nature Immersion (K-8)",
  high_school: "High School Program (9-12)",
  summer_26: "4-Day All-Outdoor Program (K-8)",
  school_year_26_27: "Forest School Nature Immersion (K-8)",
  homeschool_drop_in: "2-Day Homeschool Enrichment (1-5)",
};

export const SPRING_RIVER_SCHOOL_TEACHER_PROGRAM_ORDER = [
  "school_year_26_27",
  "four_day_outdoor",
] as const;


import { SPRING_RIVER_SCHOOL_ADMIN_LOGO } from "./springriverschool-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const springRiverSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "spring-river-school",
  logo: SPRING_RIVER_SCHOOL_ADMIN_LOGO,
  accent: SPRING_RIVER_SCHOOL_TEACHER_ACCENT,
  accentHover: SPRING_RIVER_SCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: SPRING_RIVER_SCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: SPRING_RIVER_SCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: SPRING_RIVER_SCHOOL_TEACHER_OFFICE,
  },
};
