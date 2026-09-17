export {
  LITTLE_SPRIGS_TAMPA_LOGO as LITTLE_SPRIGS_TAMPA_TEACHER_LOGO,
} from "./little-sprigs-tampa-admin-demo";

export const LITTLE_SPRIGS_TAMPA_TEACHER_OFFICE = "The Homeschool Village Office";
export const LITTLE_SPRIGS_TAMPA_TEACHER_ACCENT = "#254B3D";
export const LITTLE_SPRIGS_TAMPA_TEACHER_ACCENT_HOVER = "#1A3A2F";

export const LITTLE_SPRIGS_TAMPA_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  little_sprigs: "Little Sprigs",
  microschool: "Homeschool Village",
  tutoring: "Private Tutoring",
  kitchen_garden: "Kitchen & Garden",
};

export const LITTLE_SPRIGS_TAMPA_TEACHER_PROGRAM_ORDER = [
  "little_sprigs",
  "microschool",
  "tutoring",
  "kitchen_garden",
] as const;

import { LITTLE_SPRIGS_TAMPA_ADMIN_LOGO } from "./little-sprigs-tampa-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const littleSprigsTampaTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "little-sprigs-tampa",
  logo: LITTLE_SPRIGS_TAMPA_ADMIN_LOGO,
  accent: LITTLE_SPRIGS_TAMPA_TEACHER_ACCENT,
  accentHover: LITTLE_SPRIGS_TAMPA_TEACHER_ACCENT_HOVER,
  programLabels: LITTLE_SPRIGS_TAMPA_TEACHER_PROGRAM_LABELS,
  programOrder: LITTLE_SPRIGS_TAMPA_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: LITTLE_SPRIGS_TAMPA_TEACHER_OFFICE,
  },
};
