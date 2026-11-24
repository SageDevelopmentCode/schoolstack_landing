export {
  APOGEE_LA_MICROSCHOOL_LOGO as APOGEE_LA_MICROSCHOOL_TEACHER_LOGO,
} from "./apogee-la-microschool-admin-demo";

export const APOGEE_LA_MICROSCHOOL_TEACHER_OFFICE = "Apogee LA Office";
export const APOGEE_LA_MICROSCHOOL_TEACHER_ACCENT = "#131B32";
export const APOGEE_LA_MICROSCHOOL_TEACHER_ACCENT_HOVER = "#24305A";

export const APOGEE_LA_MICROSCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  explorers: "Explorers (5–8)",
  trailblazers: "Trailblazers (9–14)",
  innovators: "Innovators (15+)",
};

export const APOGEE_LA_MICROSCHOOL_TEACHER_PROGRAM_ORDER = ["explorers", "trailblazers", "innovators"] as const;

import { APOGEE_LA_MICROSCHOOL_ADMIN_LOGO } from "./apogee-la-microschool-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const apogeeLaMicroschoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "apogee-la-microschool",
  logo: APOGEE_LA_MICROSCHOOL_ADMIN_LOGO,
  accent: APOGEE_LA_MICROSCHOOL_TEACHER_ACCENT,
  accentHover: APOGEE_LA_MICROSCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: APOGEE_LA_MICROSCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: APOGEE_LA_MICROSCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: APOGEE_LA_MICROSCHOOL_TEACHER_OFFICE,
  },
};
