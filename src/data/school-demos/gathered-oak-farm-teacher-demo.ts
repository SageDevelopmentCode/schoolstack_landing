export {
  GATHERED_OAK_FARM_LOGO as GATHERED_OAK_FARM_TEACHER_LOGO,
} from "./gathered-oak-farm-admin-demo";

export const GATHERED_OAK_FARM_TEACHER_OFFICE = "Gathered Oak Farm Office";
export const GATHERED_OAK_FARM_TEACHER_ACCENT = "#29372B";
export const GATHERED_OAK_FARM_TEACHER_ACCENT_HOVER = "#4D6346";

export const GATHERED_OAK_FARM_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  monday_farm_school: "Monday Farm School",
  three_day_track: "3-Day Academic + Farm",
  middle_school: "Middle School",
  junior_farm_school: "Junior Farm School",
  afternoon_electives: "Afternoon Electives",
};

export const GATHERED_OAK_FARM_TEACHER_PROGRAM_ORDER = [
  "monday_farm_school",
  "three_day_track",
  "middle_school",
  "junior_farm_school",
  "afternoon_electives",
] as const;

import { GATHERED_OAK_FARM_ADMIN_LOGO } from "./gathered-oak-farm-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const gatheredOakFarmTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "gathered-oak-farm",
  logo: GATHERED_OAK_FARM_ADMIN_LOGO,
  accent: GATHERED_OAK_FARM_TEACHER_ACCENT,
  accentHover: GATHERED_OAK_FARM_TEACHER_ACCENT_HOVER,
  programLabels: GATHERED_OAK_FARM_TEACHER_PROGRAM_LABELS,
  programOrder: GATHERED_OAK_FARM_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: GATHERED_OAK_FARM_TEACHER_OFFICE,
  },
};
