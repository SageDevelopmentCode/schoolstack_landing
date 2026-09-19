export {
  NAPLES_MICROSCHOOLS_LOGO as NAPLES_MICROSCHOOLS_TEACHER_LOGO,
} from "./naples-microschools-admin-demo";

export const NAPLES_MICROSCHOOLS_TEACHER_OFFICE = "Naples MicroSchools Office";
export const NAPLES_MICROSCHOOLS_TEACHER_ACCENT = "#4F7B50";
export const NAPLES_MICROSCHOOLS_TEACHER_ACCENT_HOVER = "#244D3D";

export const NAPLES_MICROSCHOOLS_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  naturequest: "NatureQuest",
  corequest: "CoreQuest",
  skillsquest: "SkillsQuest",
  day_camps: "Day Camps",
};

export const NAPLES_MICROSCHOOLS_TEACHER_PROGRAM_ORDER = [
  "naturequest",
  "corequest",
  "skillsquest",
  "day_camps",
] as const;

import { NAPLES_MICROSCHOOLS_ADMIN_LOGO } from "./naples-microschools-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const naplesMicroschoolsTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "naples-microschools",
  logo: NAPLES_MICROSCHOOLS_ADMIN_LOGO,
  accent: NAPLES_MICROSCHOOLS_TEACHER_ACCENT,
  accentHover: NAPLES_MICROSCHOOLS_TEACHER_ACCENT_HOVER,
  programLabels: NAPLES_MICROSCHOOLS_TEACHER_PROGRAM_LABELS,
  programOrder: NAPLES_MICROSCHOOLS_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: NAPLES_MICROSCHOOLS_TEACHER_OFFICE,
  },
};
