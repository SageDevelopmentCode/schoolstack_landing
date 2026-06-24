export {
  WONDERING_OAKS_LOGO as WONDERING_OAKS_TEACHER_LOGO,
} from "./wondering-oaks-admin-demo";

export const WONDERING_OAKS_TEACHER_OFFICE = "Wondering Oaks Learning Office";
export const WONDERING_OAKS_TEACHER_ACCENT = "#15843C";
export const WONDERING_OAKS_TEACHER_ACCENT_HOVER = "#0E5828";

export const WONDERING_OAKS_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  full_time: "Full-Time (3–4 Days)",
  part_time: "Part-Time (1–2 Days)",
  foundational_core: "Foundational Core (Mon/Wed)",
  science_projects: "Science & Special Projects (Tue/Thu)",
};

export const WONDERING_OAKS_TEACHER_PROGRAM_ORDER = [
  "full_time",
  "part_time",
  "foundational_core",
  "science_projects",
] as const;
