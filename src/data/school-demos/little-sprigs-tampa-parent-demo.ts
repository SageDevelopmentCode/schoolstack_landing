export {
  LITTLE_SPRIGS_TAMPA_LOGO as LITTLE_SPRIGS_TAMPA_PARENT_LOGO,
  LITTLE_SPRIGS_TAMPA_ADMIN_COLORS,
} from "./little-sprigs-tampa-admin-demo";

export const LITTLE_SPRIGS_TAMPA_PARENT_ACCENT = "#254B3D";
export const LITTLE_SPRIGS_TAMPA_PARENT_ACCENT_HOVER = "#1A3A2F";
export const LITTLE_SPRIGS_TAMPA_PARENT_SCHOOL_NAME = "Little Sprigs of Tampa";
export const LITTLE_SPRIGS_TAMPA_PARENT_SCHOOL_SHORT = "Little Sprigs";
export const LITTLE_SPRIGS_TAMPA_PARENT_OFFICE = "The Homeschool Village Office";

import { LITTLE_SPRIGS_TAMPA_ADMIN_LOGO } from "./little-sprigs-tampa-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const littleSprigsTampaParentDemoConfig: SchoolParentDemoConfig = {
  slug: "little-sprigs-tampa",
  logo: LITTLE_SPRIGS_TAMPA_ADMIN_LOGO,
  colors: {
    accent: LITTLE_SPRIGS_TAMPA_PARENT_ACCENT,
    accentHover: LITTLE_SPRIGS_TAMPA_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: LITTLE_SPRIGS_TAMPA_PARENT_SCHOOL_NAME,
    schoolShortName: LITTLE_SPRIGS_TAMPA_PARENT_SCHOOL_SHORT,
    officeName: LITTLE_SPRIGS_TAMPA_PARENT_OFFICE,
  },
};
