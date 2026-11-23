export {
  INNOVATION_ACADEMY_LAS_VEGAS_LOGO as INNOVATION_ACADEMY_LAS_VEGAS_TEACHER_LOGO,
} from "./innovation-academy-las-vegas-admin-demo";

export const INNOVATION_ACADEMY_LAS_VEGAS_TEACHER_OFFICE = "Innovation Academy Office";
export const INNOVATION_ACADEMY_LAS_VEGAS_TEACHER_ACCENT = "#2B6F6A";
export const INNOVATION_ACADEMY_LAS_VEGAS_TEACHER_ACCENT_HOVER = "#358B84";

export const INNOVATION_ACADEMY_LAS_VEGAS_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  elementary: "Elementary (K–5)",
  middle: "Middle School (6–8)",
};

export const INNOVATION_ACADEMY_LAS_VEGAS_TEACHER_PROGRAM_ORDER = ["elementary", "middle"] as const;

import { INNOVATION_ACADEMY_LAS_VEGAS_ADMIN_LOGO } from "./innovation-academy-las-vegas-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const innovationAcademyLasVegasTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "innovation-academy-las-vegas",
  logo: INNOVATION_ACADEMY_LAS_VEGAS_ADMIN_LOGO,
  accent: INNOVATION_ACADEMY_LAS_VEGAS_TEACHER_ACCENT,
  accentHover: INNOVATION_ACADEMY_LAS_VEGAS_TEACHER_ACCENT_HOVER,
  programLabels: INNOVATION_ACADEMY_LAS_VEGAS_TEACHER_PROGRAM_LABELS,
  programOrder: INNOVATION_ACADEMY_LAS_VEGAS_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: INNOVATION_ACADEMY_LAS_VEGAS_TEACHER_OFFICE,
  },
};
