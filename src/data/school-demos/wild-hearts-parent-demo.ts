export {
  WILD_HEARTS_ADVENTURE_LOGO as WILD_HEARTS_PARENT_LOGO,
  WILD_HEARTS_ADMIN_COLORS,
} from "./wild-hearts-admin-demo";

export const WILD_HEARTS_PARENT_ACCENT = "#1A2E4C";
export const WILD_HEARTS_PARENT_ACCENT_HOVER = "#121D33";
export const WILD_HEARTS_PARENT_SCHOOL_NAME = "Wild Hearts Adventure Co.";
export const WILD_HEARTS_PARENT_SCHOOL_SHORT = "Wild Hearts";
export const WILD_HEARTS_PARENT_OFFICE = "Wild Hearts Adventure Co. Office";


import { WILD_HEARTS_ADMIN_LOGO } from "./wild-hearts-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const wildHeartsAdventureParentDemoConfig: SchoolParentDemoConfig = {
  slug: "wild-hearts-adventure",
  logo: WILD_HEARTS_ADMIN_LOGO,
  colors: {
    accent: WILD_HEARTS_PARENT_ACCENT,
    accentHover: WILD_HEARTS_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: WILD_HEARTS_PARENT_SCHOOL_NAME,
    schoolShortName: WILD_HEARTS_PARENT_SCHOOL_SHORT,
    officeName: WILD_HEARTS_PARENT_OFFICE,
  },
};
