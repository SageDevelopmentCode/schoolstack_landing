export {
  THE_WOODLANDS_LOGO as THE_WOODLANDS_TEACHER_LOGO,
} from "./the-woodlands-admin-demo";

export const THE_WOODLANDS_TEACHER_OFFICE = "The Woodlands Microschool Office";
export const THE_WOODLANDS_TEACHER_ACCENT = "#335A39";
export const THE_WOODLANDS_TEACHER_ACCENT_HOVER = "#213B27";

export const THE_WOODLANDS_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  high_school: "High School Program",
  elementary_jr_high: "3rd–6th Grade & Jr High",
  hybrid_private: "Hybrid Private School",
  credit_recovery_tutoring: "Credit Recovery & Tutoring",
};

export const THE_WOODLANDS_TEACHER_PROGRAM_ORDER = [
  "high_school",
  "elementary_jr_high",
  "hybrid_private",
  "credit_recovery_tutoring",
] as const;
