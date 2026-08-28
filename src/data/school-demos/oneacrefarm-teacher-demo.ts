export {
  ONE_ACRE_FARM_ADMIN_LOGO as ONE_ACRE_FARM_TEACHER_LOGO,
} from "./oneacrefarm-admin-demo";

export const ONE_ACRE_FARM_TEACHER_OFFICE = "One Acre Farm Office";
export const ONE_ACRE_FARM_TEACHER_ACCENT = "#5B7A4A";
export const ONE_ACRE_FARM_TEACHER_ACCENT_HOVER = "#4A6340";

export const ONE_ACRE_FARM_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  early_childhood_pod: "Early Childhood Farm School · Ages 4–7",
  elementary_pod: "Elementary Farm School · Ages 7–10",
  kids_art_play: "Kids Art & Play",
  storytime: "Storytime at the Farm",
  sensory_saturday: "Sensory Saturday",
  strides_autism: "Strides Autism Program",
};

export const ONE_ACRE_FARM_TEACHER_PROGRAM_ORDER = [
  "early_childhood_pod",
  "elementary_pod",
  "kids_art_play",
  "storytime",
  "sensory_saturday",
  "strides_autism",
] as const;


import { ONE_ACRE_FARM_ADMIN_LOGO } from "./oneacrefarm-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const oneAcreFarmTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "one-acre-farm",
  logo: ONE_ACRE_FARM_ADMIN_LOGO,
  accent: ONE_ACRE_FARM_TEACHER_ACCENT,
  accentHover: ONE_ACRE_FARM_TEACHER_ACCENT_HOVER,
  programLabels: ONE_ACRE_FARM_TEACHER_PROGRAM_LABELS,
  programOrder: ONE_ACRE_FARM_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: ONE_ACRE_FARM_TEACHER_OFFICE,
  },
};
