export {
  SPYRJA_ACADEMY_NEW_BRAUNFELS_LOGO as SPYRJA_ACADEMY_NEW_BRAUNFELS_PARENT_LOGO,
  SPYRJA_ACADEMY_NEW_BRAUNFELS_ADMIN_COLORS,
} from "./spyrja-academy-new-braunfels-admin-demo";

export const SPYRJA_ACADEMY_NEW_BRAUNFELS_PARENT_ACCENT = "#0A6966";
export const SPYRJA_ACADEMY_NEW_BRAUNFELS_PARENT_ACCENT_HOVER = "#0D807C";
export const SPYRJA_ACADEMY_NEW_BRAUNFELS_PARENT_SCHOOL_NAME = "Spyrja Academy of New Braunfels";
export const SPYRJA_ACADEMY_NEW_BRAUNFELS_PARENT_SCHOOL_SHORT = "Spyrja";
export const SPYRJA_ACADEMY_NEW_BRAUNFELS_PARENT_OFFICE = "Spyrja Office";

import { SPYRJA_ACADEMY_NEW_BRAUNFELS_ADMIN_LOGO } from "./spyrja-academy-new-braunfels-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const spyrjaAcademyNewBraunfelsParentDemoConfig: SchoolParentDemoConfig = {
  slug: "spyrja-academy-new-braunfels",
  logo: SPYRJA_ACADEMY_NEW_BRAUNFELS_ADMIN_LOGO,
  colors: {
    accent: SPYRJA_ACADEMY_NEW_BRAUNFELS_PARENT_ACCENT,
    accentHover: SPYRJA_ACADEMY_NEW_BRAUNFELS_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: SPYRJA_ACADEMY_NEW_BRAUNFELS_PARENT_SCHOOL_NAME,
    schoolShortName: SPYRJA_ACADEMY_NEW_BRAUNFELS_PARENT_SCHOOL_SHORT,
    officeName: SPYRJA_ACADEMY_NEW_BRAUNFELS_PARENT_OFFICE,
  },
};
