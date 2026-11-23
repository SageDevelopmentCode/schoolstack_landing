export {
  BRIGHT_MINDS_FUTURE_LEADERS_LOGO as BRIGHT_MINDS_FUTURE_LEADERS_TEACHER_LOGO,
} from "./bright-minds-future-leaders-admin-demo";

export const BRIGHT_MINDS_FUTURE_LEADERS_TEACHER_OFFICE = "Bright Minds Office";
export const BRIGHT_MINDS_FUTURE_LEADERS_TEACHER_ACCENT = "#7E22CE";
export const BRIGHT_MINDS_FUTURE_LEADERS_TEACHER_ACCENT_HOVER = "#9333EA";

export const BRIGHT_MINDS_FUTURE_LEADERS_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  k2: "Kindergarten–2nd",
  g35: "3rd–5th",
};

export const BRIGHT_MINDS_FUTURE_LEADERS_TEACHER_PROGRAM_ORDER = ["k2", "g35"] as const;

import { BRIGHT_MINDS_FUTURE_LEADERS_ADMIN_LOGO } from "./bright-minds-future-leaders-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const brightMindsFutureLeadersTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "bright-minds-future-leaders",
  logo: BRIGHT_MINDS_FUTURE_LEADERS_ADMIN_LOGO,
  accent: BRIGHT_MINDS_FUTURE_LEADERS_TEACHER_ACCENT,
  accentHover: BRIGHT_MINDS_FUTURE_LEADERS_TEACHER_ACCENT_HOVER,
  programLabels: BRIGHT_MINDS_FUTURE_LEADERS_TEACHER_PROGRAM_LABELS,
  programOrder: BRIGHT_MINDS_FUTURE_LEADERS_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: BRIGHT_MINDS_FUTURE_LEADERS_TEACHER_OFFICE,
  },
};
