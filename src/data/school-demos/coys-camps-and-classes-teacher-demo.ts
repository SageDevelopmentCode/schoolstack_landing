export {
  COYS_CAMPS_AND_CLASSES_LOGO as COYS_CAMPS_AND_CLASSES_TEACHER_LOGO,
} from "./coys-camps-and-classes-admin-demo";

export const COYS_CAMPS_AND_CLASSES_TEACHER_OFFICE = "Coy's Camps And Classes Office";
export const COYS_CAMPS_AND_CLASSES_TEACHER_ACCENT = "#2A3466";
export const COYS_CAMPS_AND_CLASSES_TEACHER_ACCENT_HOVER = "#3B4785";

export const COYS_CAMPS_AND_CLASSES_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  full_time: "Full Time (Mon–Fri)",
  half_time: "Half Days (Mon–Thu mornings)",
  steam_friday: "STEAM Fridays",
  literacy_launchpad: "Literacy Launchpad (ages 5–7)",
};

export const COYS_CAMPS_AND_CLASSES_TEACHER_PROGRAM_ORDER = ["full_time", "half_time", "steam_friday", "literacy_launchpad"] as const;

import { COYS_CAMPS_AND_CLASSES_ADMIN_LOGO } from "./coys-camps-and-classes-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const coysCampsAndClassesTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "coys-camps-and-classes",
  logo: COYS_CAMPS_AND_CLASSES_ADMIN_LOGO,
  accent: COYS_CAMPS_AND_CLASSES_TEACHER_ACCENT,
  accentHover: COYS_CAMPS_AND_CLASSES_TEACHER_ACCENT_HOVER,
  programLabels: COYS_CAMPS_AND_CLASSES_TEACHER_PROGRAM_LABELS,
  programOrder: COYS_CAMPS_AND_CLASSES_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: COYS_CAMPS_AND_CLASSES_TEACHER_OFFICE,
  },
};
