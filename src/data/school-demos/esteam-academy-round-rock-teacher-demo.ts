export {
  ESTEAM_ACADEMY_ROUND_ROCK_LOGO as ESTEAM_ACADEMY_ROUND_ROCK_TEACHER_LOGO,
} from "./esteam-academy-round-rock-admin-demo";

export const ESTEAM_ACADEMY_ROUND_ROCK_TEACHER_OFFICE = "ESTEAM Office";
export const ESTEAM_ACADEMY_ROUND_ROCK_TEACHER_ACCENT = "#142E50";
export const ESTEAM_ACADEMY_ROUND_ROCK_TEACHER_ACCENT_HOVER = "#21436F";

export const ESTEAM_ACADEMY_ROUND_ROCK_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  discovery: "Discovery Studio (4–8)",
  explorers: "Explorers Studio (7–12)",
  pathfinders: "Pathfinders Studio (12–16)",
};

export const ESTEAM_ACADEMY_ROUND_ROCK_TEACHER_PROGRAM_ORDER = ["discovery", "explorers", "pathfinders"] as const;

import { ESTEAM_ACADEMY_ROUND_ROCK_ADMIN_LOGO } from "./esteam-academy-round-rock-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const esteamAcademyRoundRockTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "esteam-academy-round-rock",
  logo: ESTEAM_ACADEMY_ROUND_ROCK_ADMIN_LOGO,
  accent: ESTEAM_ACADEMY_ROUND_ROCK_TEACHER_ACCENT,
  accentHover: ESTEAM_ACADEMY_ROUND_ROCK_TEACHER_ACCENT_HOVER,
  programLabels: ESTEAM_ACADEMY_ROUND_ROCK_TEACHER_PROGRAM_LABELS,
  programOrder: ESTEAM_ACADEMY_ROUND_ROCK_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: ESTEAM_ACADEMY_ROUND_ROCK_TEACHER_OFFICE,
  },
};
