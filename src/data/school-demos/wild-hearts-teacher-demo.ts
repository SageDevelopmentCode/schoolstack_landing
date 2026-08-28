export {
  WILD_HEARTS_ADVENTURE_LOGO as WILD_HEARTS_TEACHER_LOGO,
} from "./wild-hearts-admin-demo";

export const WILD_HEARTS_TEACHER_OFFICE = "Wild Hearts Adventure Co. Office";
export const WILD_HEARTS_TEACHER_ACCENT = "#1A2E4C";
export const WILD_HEARTS_TEACHER_ACCENT_HOVER = "#121D33";

export const WILD_HEARTS_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  wild_hearts: "Wild Hearts (TK–2nd)",
  true_north: "True North (Grades 6–12)",
  summer_adventures: "Summer Adventures",
  specialty: "Specialty Classes (Dec/June)",
};

export const WILD_HEARTS_TEACHER_PROGRAM_ORDER = [
  "wild_hearts",
  "true_north",
  "summer_adventures",
  "specialty",
] as const;


import { WILD_HEARTS_ADMIN_LOGO } from "./wild-hearts-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const wildHeartsAdventureTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "wild-hearts-adventure",
  logo: WILD_HEARTS_ADMIN_LOGO,
  accent: WILD_HEARTS_TEACHER_ACCENT,
  accentHover: WILD_HEARTS_TEACHER_ACCENT_HOVER,
  programLabels: WILD_HEARTS_TEACHER_PROGRAM_LABELS,
  programOrder: WILD_HEARTS_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: WILD_HEARTS_TEACHER_OFFICE,
  },
};
