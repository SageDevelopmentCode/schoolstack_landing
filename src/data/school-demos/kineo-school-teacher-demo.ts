export {
  KINEO_SCHOOL_LOGO as KINEO_SCHOOL_TEACHER_LOGO,
} from "./kineo-school-admin-demo";

export const KINEO_SCHOOL_TEACHER_OFFICE = "Kineo School Office";
export const KINEO_SCHOOL_TEACHER_ACCENT = "#5BB7B0";
export const KINEO_SCHOOL_TEACHER_ACCENT_HOVER = "#4AA39C";

export const KINEO_SCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  k5_academics: "K-5 Academics",
  multi_age: "Multi-Age Cohorts",
  sel_choice: "SEL & Choice Time",
  enrichment: "Enrichment",
};

export const KINEO_SCHOOL_TEACHER_PROGRAM_ORDER = [
  "k5_academics",
  "multi_age",
  "sel_choice",
  "enrichment",
] as const;
