export {
  ONE_ACRE_FARM_ADMIN_LOGO as ONE_ACRE_FARM_PARENT_LOGO,
  ONE_ACRE_FARM_ADMIN_COLORS,
} from "./oneacrefarm-admin-demo";

export const ONE_ACRE_FARM_PARENT_ACCENT = "#5B7A4A";
export const ONE_ACRE_FARM_PARENT_ACCENT_HOVER = "#4A6340";
export const ONE_ACRE_FARM_PARENT_SCHOOL_NAME = "One Acre Farm Educational Foundation";
export const ONE_ACRE_FARM_PARENT_SCHOOL_SHORT = "One Acre Farm";
export const ONE_ACRE_FARM_PARENT_OFFICE = "One Acre Farm Office";


import { ONE_ACRE_FARM_ADMIN_LOGO } from "./oneacrefarm-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const oneAcreFarmParentDemoConfig: SchoolParentDemoConfig = {
  slug: "one-acre-farm",
  logo: ONE_ACRE_FARM_ADMIN_LOGO,
  colors: {
    accent: ONE_ACRE_FARM_PARENT_ACCENT,
    accentHover: ONE_ACRE_FARM_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: ONE_ACRE_FARM_PARENT_SCHOOL_NAME,
    schoolShortName: ONE_ACRE_FARM_PARENT_SCHOOL_SHORT,
    officeName: ONE_ACRE_FARM_PARENT_OFFICE,
  },
};
