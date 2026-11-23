export {
  MEADOWS_BEE_FARM_LOGO as MEADOWS_BEE_FARM_PARENT_LOGO,
  MEADOWS_BEE_FARM_ADMIN_COLORS,
} from "./meadows-bee-farm-admin-demo";

export const MEADOWS_BEE_FARM_PARENT_ACCENT = "#6E4420";
export const MEADOWS_BEE_FARM_PARENT_ACCENT_HOVER = "#8A5A2E";
export const MEADOWS_BEE_FARM_PARENT_SCHOOL_NAME = "Meadows Bee Farm";
export const MEADOWS_BEE_FARM_PARENT_SCHOOL_SHORT = "Meadows Bee";
export const MEADOWS_BEE_FARM_PARENT_OFFICE = "Meadows Bee Farm Education";

import { MEADOWS_BEE_FARM_ADMIN_LOGO } from "./meadows-bee-farm-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const meadowsBeeFarmParentDemoConfig: SchoolParentDemoConfig = {
  slug: "meadows-bee-farm",
  logo: MEADOWS_BEE_FARM_ADMIN_LOGO,
  colors: {
    accent: MEADOWS_BEE_FARM_PARENT_ACCENT,
    accentHover: MEADOWS_BEE_FARM_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: MEADOWS_BEE_FARM_PARENT_SCHOOL_NAME,
    schoolShortName: MEADOWS_BEE_FARM_PARENT_SCHOOL_SHORT,
    officeName: MEADOWS_BEE_FARM_PARENT_OFFICE,
  },
};
