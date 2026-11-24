export {
  MADRONA_SCHOOL_LOGO as MADRONA_SCHOOL_PARENT_LOGO,
  MADRONA_SCHOOL_ADMIN_COLORS,
} from "./madrona-school-admin-demo";

export const MADRONA_SCHOOL_PARENT_ACCENT = "#073F2C";
export const MADRONA_SCHOOL_PARENT_ACCENT_HOVER = "#14573F";
export const MADRONA_SCHOOL_PARENT_SCHOOL_NAME = "Madrona School";
export const MADRONA_SCHOOL_PARENT_SCHOOL_SHORT = "Madrona";
export const MADRONA_SCHOOL_PARENT_OFFICE = "Madrona School Office";

import { MADRONA_SCHOOL_ADMIN_LOGO } from "./madrona-school-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const madronaSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "madrona-school",
  logo: MADRONA_SCHOOL_ADMIN_LOGO,
  colors: {
    accent: MADRONA_SCHOOL_PARENT_ACCENT,
    accentHover: MADRONA_SCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: MADRONA_SCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: MADRONA_SCHOOL_PARENT_SCHOOL_SHORT,
    officeName: MADRONA_SCHOOL_PARENT_OFFICE,
  },
};
