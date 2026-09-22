export {
  ROOTED_MEADOWS_ADMIN_LOGO as ROOTED_MEADOWS_PARENT_LOGO,
  ROOTED_MEADOWS_ADMIN_COLORS,
} from "./rootedmeadows-admin-demo";

export const ROOTED_MEADOWS_PARENT_ACCENT = "#827096";
export const ROOTED_MEADOWS_PARENT_ACCENT_HOVER = "#6E5D7F";
export const ROOTED_MEADOWS_PARENT_SCHOOL_NAME = "Rooted Meadows Waldorf School";
export const ROOTED_MEADOWS_PARENT_SCHOOL_SHORT = "Rooted Meadows";
export const ROOTED_MEADOWS_PARENT_OFFICE = "Rooted Meadows Office";

import { ROOTED_MEADOWS_ADMIN_LOGO } from "./rootedmeadows-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const rootedMeadowsParentDemoConfig: SchoolParentDemoConfig = {
  slug: "rooted-meadows",
  logo: ROOTED_MEADOWS_ADMIN_LOGO,
  colors: {
    accent: ROOTED_MEADOWS_PARENT_ACCENT,
    accentHover: ROOTED_MEADOWS_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: ROOTED_MEADOWS_PARENT_SCHOOL_NAME,
    schoolShortName: ROOTED_MEADOWS_PARENT_SCHOOL_SHORT,
    officeName: ROOTED_MEADOWS_PARENT_OFFICE,
  },
};
