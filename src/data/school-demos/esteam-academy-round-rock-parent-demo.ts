export {
  ESTEAM_ACADEMY_ROUND_ROCK_LOGO as ESTEAM_ACADEMY_ROUND_ROCK_PARENT_LOGO,
  ESTEAM_ACADEMY_ROUND_ROCK_ADMIN_COLORS,
} from "./esteam-academy-round-rock-admin-demo";

export const ESTEAM_ACADEMY_ROUND_ROCK_PARENT_ACCENT = "#142E50";
export const ESTEAM_ACADEMY_ROUND_ROCK_PARENT_ACCENT_HOVER = "#21436F";
export const ESTEAM_ACADEMY_ROUND_ROCK_PARENT_SCHOOL_NAME = "ESTEAM Academy";
export const ESTEAM_ACADEMY_ROUND_ROCK_PARENT_SCHOOL_SHORT = "ESTEAM";
export const ESTEAM_ACADEMY_ROUND_ROCK_PARENT_OFFICE = "ESTEAM Office";

import { ESTEAM_ACADEMY_ROUND_ROCK_ADMIN_LOGO } from "./esteam-academy-round-rock-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const esteamAcademyRoundRockParentDemoConfig: SchoolParentDemoConfig = {
  slug: "esteam-academy-round-rock",
  logo: ESTEAM_ACADEMY_ROUND_ROCK_ADMIN_LOGO,
  colors: {
    accent: ESTEAM_ACADEMY_ROUND_ROCK_PARENT_ACCENT,
    accentHover: ESTEAM_ACADEMY_ROUND_ROCK_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: ESTEAM_ACADEMY_ROUND_ROCK_PARENT_SCHOOL_NAME,
    schoolShortName: ESTEAM_ACADEMY_ROUND_ROCK_PARENT_SCHOOL_SHORT,
    officeName: ESTEAM_ACADEMY_ROUND_ROCK_PARENT_OFFICE,
  },
};
