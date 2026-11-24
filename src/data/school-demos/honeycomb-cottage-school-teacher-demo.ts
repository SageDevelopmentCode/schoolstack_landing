export {
  HONEYCOMB_COTTAGE_SCHOOL_LOGO as HONEYCOMB_COTTAGE_SCHOOL_TEACHER_LOGO,
} from "./honeycomb-cottage-school-admin-demo";

export const HONEYCOMB_COTTAGE_SCHOOL_TEACHER_OFFICE = "Honeycomb Cottage School";
export const HONEYCOMB_COTTAGE_SCHOOL_TEACHER_ACCENT = "#2F5D5B";
export const HONEYCOMB_COTTAGE_SCHOOL_TEACHER_ACCENT_HOVER = "#3B7371";

export const HONEYCOMB_COTTAGE_SCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  early_childhood: "Early Childhood (Pre-K & K)",
  first_grade: "First Grade",
  second_grade: "Second Grade",
  third_grade: "Third Grade",
  fourth_fifth: "Fourth/Fifth Grade",
  seventh_grade: "7th Grade (Traverse Mountain)",
};

export const HONEYCOMB_COTTAGE_SCHOOL_TEACHER_PROGRAM_ORDER = [
  "early_childhood",
  "first_grade",
  "second_grade",
  "third_grade",
  "fourth_fifth",
  "seventh_grade",
] as const;

import { HONEYCOMB_COTTAGE_SCHOOL_ADMIN_LOGO } from "./honeycomb-cottage-school-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const honeycombCottageSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "honeycomb-cottage-school",
  logo: HONEYCOMB_COTTAGE_SCHOOL_ADMIN_LOGO,
  accent: HONEYCOMB_COTTAGE_SCHOOL_TEACHER_ACCENT,
  accentHover: HONEYCOMB_COTTAGE_SCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: HONEYCOMB_COTTAGE_SCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: HONEYCOMB_COTTAGE_SCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: HONEYCOMB_COTTAGE_SCHOOL_TEACHER_OFFICE,
  },
};
