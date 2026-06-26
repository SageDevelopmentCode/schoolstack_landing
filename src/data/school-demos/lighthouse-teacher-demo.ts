export {
  LIGHTHOUSE_LOGO as LIGHTHOUSE_TEACHER_LOGO,
} from "./lighthouse-admin-demo";

export const LIGHTHOUSE_TEACHER_OFFICE = "Lighthouse Homeschool Academy Office";
export const LIGHTHOUSE_TEACHER_ACCENT = "#336699";
export const LIGHTHOUSE_TEACHER_ACCENT_HOVER = "#1d519d";

export const LIGHTHOUSE_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  hybrid_full: "Hybrid Full Program",
  elementary: "Elementary Grades",
  middle: "Middle School",
  high: "High School",
};

export const LIGHTHOUSE_TEACHER_PROGRAM_ORDER = [
  "hybrid_full",
  "elementary",
  "middle",
  "high",
] as const;
