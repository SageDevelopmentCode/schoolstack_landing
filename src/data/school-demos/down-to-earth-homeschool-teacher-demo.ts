export {
  DOWN_TO_EARTH_HOMESCHOOL_LOGO as DOWN_TO_EARTH_HOMESCHOOL_TEACHER_LOGO,
} from "./down-to-earth-homeschool-admin-demo";

export const DOWN_TO_EARTH_HOMESCHOOL_TEACHER_OFFICE = "Down to Earth Co-op Directors";
export const DOWN_TO_EARTH_HOMESCHOOL_TEACHER_ACCENT = "#1F7A58";
export const DOWN_TO_EARTH_HOMESCHOOL_TEACHER_ACCENT_HOVER = "#2A936C";

export const DOWN_TO_EARTH_HOMESCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  k2: "K–2nd",
  g35: "3rd–5th",
  middle: "Middle (6th–8th)",
};

export const DOWN_TO_EARTH_HOMESCHOOL_TEACHER_PROGRAM_ORDER = ["k2", "g35", "middle"] as const;

import { DOWN_TO_EARTH_HOMESCHOOL_ADMIN_LOGO } from "./down-to-earth-homeschool-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const downToEarthHomeschoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "down-to-earth-homeschool",
  logo: DOWN_TO_EARTH_HOMESCHOOL_ADMIN_LOGO,
  accent: DOWN_TO_EARTH_HOMESCHOOL_TEACHER_ACCENT,
  accentHover: DOWN_TO_EARTH_HOMESCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: DOWN_TO_EARTH_HOMESCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: DOWN_TO_EARTH_HOMESCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: DOWN_TO_EARTH_HOMESCHOOL_TEACHER_OFFICE,
  },
};
