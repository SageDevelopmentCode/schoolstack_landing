export {
  GARDEN_SCHOOL_MARIETTA_LOGO as GARDEN_SCHOOL_MARIETTA_PARENT_LOGO,
  GARDEN_SCHOOL_MARIETTA_ADMIN_COLORS,
} from "./garden-school-marietta-admin-demo";

export const GARDEN_SCHOOL_MARIETTA_PARENT_ACCENT = "#4B5F00";
export const GARDEN_SCHOOL_MARIETTA_PARENT_ACCENT_HOVER = "#5E7510";
export const GARDEN_SCHOOL_MARIETTA_PARENT_SCHOOL_NAME = "The Garden School of Marietta";
export const GARDEN_SCHOOL_MARIETTA_PARENT_SCHOOL_SHORT = "The Garden School";
export const GARDEN_SCHOOL_MARIETTA_PARENT_OFFICE = "Garden School Office";

import { GARDEN_SCHOOL_MARIETTA_ADMIN_LOGO } from "./garden-school-marietta-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const gardenSchoolMariettaParentDemoConfig: SchoolParentDemoConfig = {
  slug: "garden-school-marietta",
  logo: GARDEN_SCHOOL_MARIETTA_ADMIN_LOGO,
  colors: {
    accent: GARDEN_SCHOOL_MARIETTA_PARENT_ACCENT,
    accentHover: GARDEN_SCHOOL_MARIETTA_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: GARDEN_SCHOOL_MARIETTA_PARENT_SCHOOL_NAME,
    schoolShortName: GARDEN_SCHOOL_MARIETTA_PARENT_SCHOOL_SHORT,
    officeName: GARDEN_SCHOOL_MARIETTA_PARENT_OFFICE,
  },
};
