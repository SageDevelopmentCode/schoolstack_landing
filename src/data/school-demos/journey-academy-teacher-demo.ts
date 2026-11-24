export {
  JOURNEY_ACADEMY_LOGO as JOURNEY_ACADEMY_TEACHER_LOGO,
} from "./journey-academy-admin-demo";

export const JOURNEY_ACADEMY_TEACHER_OFFICE = "Journey Academy Office";
export const JOURNEY_ACADEMY_TEACHER_ACCENT = "#1D5A9E";
export const JOURNEY_ACADEMY_TEACHER_ACCENT_HOVER = "#297BD3";

export const JOURNEY_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  sparks: "Sparks (4–7)",
  explorers: "Explorers (7–10)",
  discovery: "Discovery (9–12)",
  adventure: "Adventure (12–14)",
  launchPad: "Launch Pad (14–18)",
};

export const JOURNEY_ACADEMY_TEACHER_PROGRAM_ORDER = ["sparks", "explorers", "discovery", "adventure", "launchPad"] as const;

import { JOURNEY_ACADEMY_ADMIN_LOGO } from "./journey-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const journeyAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "journey-academy",
  logo: JOURNEY_ACADEMY_ADMIN_LOGO,
  accent: JOURNEY_ACADEMY_TEACHER_ACCENT,
  accentHover: JOURNEY_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: JOURNEY_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: JOURNEY_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: JOURNEY_ACADEMY_TEACHER_OFFICE,
  },
};
