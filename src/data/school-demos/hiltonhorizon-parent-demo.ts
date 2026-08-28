export {
  HILTON_HORIZON_ADMIN_LOGO as HILTON_HORIZON_PARENT_LOGO,
  HILTON_HORIZON_ADMIN_COLORS,
} from "./hiltonhorizon-admin-demo";

export const HILTON_HORIZON_PARENT_ACCENT = "#1B3664";
export const HILTON_HORIZON_PARENT_ACCENT_HOVER = "#152A52";
export const HILTON_HORIZON_PARENT_SCHOOL_NAME = "Hilton Horizons Academy";
export const HILTON_HORIZON_PARENT_SCHOOL_SHORT = "HHA";
export const HILTON_HORIZON_PARENT_OFFICE = "Hilton Horizons Academy Office";


import { HILTON_HORIZON_ADMIN_LOGO } from "./hiltonhorizon-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const hiltonHorizonsAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "hilton-horizons-academy",
  logo: HILTON_HORIZON_ADMIN_LOGO,
  colors: {
    accent: HILTON_HORIZON_PARENT_ACCENT,
    accentHover: HILTON_HORIZON_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: HILTON_HORIZON_PARENT_SCHOOL_NAME,
    schoolShortName: HILTON_HORIZON_PARENT_SCHOOL_SHORT,
    officeName: HILTON_HORIZON_PARENT_OFFICE,
  },
};
