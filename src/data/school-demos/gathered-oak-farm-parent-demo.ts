export {
  GATHERED_OAK_FARM_LOGO as GATHERED_OAK_FARM_PARENT_LOGO,
  GATHERED_OAK_FARM_ADMIN_COLORS,
} from "./gathered-oak-farm-admin-demo";

export const GATHERED_OAK_FARM_PARENT_ACCENT = "#29372B";
export const GATHERED_OAK_FARM_PARENT_ACCENT_HOVER = "#4D6346";
export const GATHERED_OAK_FARM_PARENT_SCHOOL_NAME = "Gathered Oak Farm";
export const GATHERED_OAK_FARM_PARENT_SCHOOL_SHORT = "Gathered Oak";
export const GATHERED_OAK_FARM_PARENT_OFFICE = "Gathered Oak Farm Office";

import { GATHERED_OAK_FARM_ADMIN_LOGO } from "./gathered-oak-farm-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const gatheredOakFarmParentDemoConfig: SchoolParentDemoConfig = {
  slug: "gathered-oak-farm",
  logo: GATHERED_OAK_FARM_ADMIN_LOGO,
  colors: {
    accent: GATHERED_OAK_FARM_PARENT_ACCENT,
    accentHover: GATHERED_OAK_FARM_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: GATHERED_OAK_FARM_PARENT_SCHOOL_NAME,
    schoolShortName: GATHERED_OAK_FARM_PARENT_SCHOOL_SHORT,
    officeName: GATHERED_OAK_FARM_PARENT_OFFICE,
  },
};
