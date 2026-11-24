export {
  MEADOWS_BEE_FARM_LOGO as MEADOWS_BEE_FARM_TEACHER_LOGO,
} from "./meadows-bee-farm-admin-demo";

export const MEADOWS_BEE_FARM_TEACHER_OFFICE = "Meadows Bee Farm Education";
export const MEADOWS_BEE_FARM_TEACHER_ACCENT = "#6E4420";
export const MEADOWS_BEE_FARM_TEACHER_ACCENT_HOVER = "#8A5A2E";

export const MEADOWS_BEE_FARM_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  wednesday_young_farmers: "Wednesday Young Farmers (5–10)",
  young_farmer_starts: "Young Farmer Starts family days",
  homeschool_wednesdays: "Homeschool Wednesdays",
};

export const MEADOWS_BEE_FARM_TEACHER_PROGRAM_ORDER = [
  "wednesday_young_farmers",
  "young_farmer_starts",
  "homeschool_wednesdays",
] as const;

import { MEADOWS_BEE_FARM_ADMIN_LOGO } from "./meadows-bee-farm-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const meadowsBeeFarmTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "meadows-bee-farm",
  logo: MEADOWS_BEE_FARM_ADMIN_LOGO,
  accent: MEADOWS_BEE_FARM_TEACHER_ACCENT,
  accentHover: MEADOWS_BEE_FARM_TEACHER_ACCENT_HOVER,
  programLabels: MEADOWS_BEE_FARM_TEACHER_PROGRAM_LABELS,
  programOrder: MEADOWS_BEE_FARM_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: MEADOWS_BEE_FARM_TEACHER_OFFICE,
  },
};
