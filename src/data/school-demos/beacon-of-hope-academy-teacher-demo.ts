export {
  BEACON_OF_HOPE_ACADEMY_LOGO as BEACON_OF_HOPE_ACADEMY_TEACHER_LOGO,
} from "./beacon-of-hope-academy-admin-demo";

export const BEACON_OF_HOPE_ACADEMY_TEACHER_OFFICE = "Beacon of Hope Academy Office";
export const BEACON_OF_HOPE_ACADEMY_TEACHER_ACCENT = "#163A59";
export const BEACON_OF_HOPE_ACADEMY_TEACHER_ACCENT_HOVER = "#24527A";

export const BEACON_OF_HOPE_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  full_time: "Full-Time (4–5 days)",
  part_time: "Part-Time (2–3 days)",
};

export const BEACON_OF_HOPE_ACADEMY_TEACHER_PROGRAM_ORDER = ["full_time", "part_time"] as const;

import { BEACON_OF_HOPE_ACADEMY_ADMIN_LOGO } from "./beacon-of-hope-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const beaconOfHopeAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "beacon-of-hope-academy",
  logo: BEACON_OF_HOPE_ACADEMY_ADMIN_LOGO,
  accent: BEACON_OF_HOPE_ACADEMY_TEACHER_ACCENT,
  accentHover: BEACON_OF_HOPE_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: BEACON_OF_HOPE_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: BEACON_OF_HOPE_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: BEACON_OF_HOPE_ACADEMY_TEACHER_OFFICE,
  },
};
