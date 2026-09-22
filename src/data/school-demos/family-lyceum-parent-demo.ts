export {
  FAMILY_LYCEUM_LOGO as FAMILY_LYCEUM_PARENT_LOGO,
  FAMILY_LYCEUM_ADMIN_COLORS,
} from "./family-lyceum-admin-demo";

export const FAMILY_LYCEUM_PARENT_ACCENT = "#20364A";
export const FAMILY_LYCEUM_PARENT_ACCENT_HOVER = "#122534";
export const FAMILY_LYCEUM_PARENT_SCHOOL_NAME = "Family Lyceum";
export const FAMILY_LYCEUM_PARENT_SCHOOL_SHORT = "Family Lyceum";
export const FAMILY_LYCEUM_PARENT_OFFICE = "Family Lyceum Office";

import { FAMILY_LYCEUM_ADMIN_LOGO } from "./family-lyceum-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const familyLyceumParentDemoConfig: SchoolParentDemoConfig = {
  slug: "family-lyceum",
  logo: FAMILY_LYCEUM_ADMIN_LOGO,
  colors: {
    accent: FAMILY_LYCEUM_PARENT_ACCENT,
    accentHover: FAMILY_LYCEUM_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: FAMILY_LYCEUM_PARENT_SCHOOL_NAME,
    schoolShortName: FAMILY_LYCEUM_PARENT_SCHOOL_SHORT,
    officeName: FAMILY_LYCEUM_PARENT_OFFICE,
  },
};
