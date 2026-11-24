export {
  INVICTUS_LEANDER_LOGO as INVICTUS_LEANDER_PARENT_LOGO,
  INVICTUS_LEANDER_ADMIN_COLORS,
} from "./invictus-leander-admin-demo";

export const INVICTUS_LEANDER_PARENT_ACCENT = "#5E1A24";
export const INVICTUS_LEANDER_PARENT_ACCENT_HOVER = "#7A2531";
export const INVICTUS_LEANDER_PARENT_SCHOOL_NAME = "Invictus: An Acton Academy";
export const INVICTUS_LEANDER_PARENT_SCHOOL_SHORT = "Invictus";
export const INVICTUS_LEANDER_PARENT_OFFICE = "Invictus Front Desk";

import { INVICTUS_LEANDER_ADMIN_LOGO } from "./invictus-leander-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const invictusLeanderParentDemoConfig: SchoolParentDemoConfig = {
  slug: "invictus-leander",
  logo: INVICTUS_LEANDER_ADMIN_LOGO,
  colors: {
    accent: INVICTUS_LEANDER_PARENT_ACCENT,
    accentHover: INVICTUS_LEANDER_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: INVICTUS_LEANDER_PARENT_SCHOOL_NAME,
    schoolShortName: INVICTUS_LEANDER_PARENT_SCHOOL_SHORT,
    officeName: INVICTUS_LEANDER_PARENT_OFFICE,
  },
};
