export {
  BLUE_HORIZON_STUDIO_LOGO as BLUE_HORIZON_STUDIO_PARENT_LOGO,
  BLUE_HORIZON_STUDIO_ADMIN_COLORS,
} from "./blue-horizon-studio-admin-demo";

export const BLUE_HORIZON_STUDIO_PARENT_ACCENT = "#122954";
export const BLUE_HORIZON_STUDIO_PARENT_ACCENT_HOVER = "#23407A";
export const BLUE_HORIZON_STUDIO_PARENT_SCHOOL_NAME = "Blue Horizon Studio";
export const BLUE_HORIZON_STUDIO_PARENT_SCHOOL_SHORT = "Blue Horizon";
export const BLUE_HORIZON_STUDIO_PARENT_OFFICE = "Blue Horizon Studio";

import { BLUE_HORIZON_STUDIO_ADMIN_LOGO } from "./blue-horizon-studio-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const blueHorizonStudioParentDemoConfig: SchoolParentDemoConfig = {
  slug: "blue-horizon-studio",
  logo: BLUE_HORIZON_STUDIO_ADMIN_LOGO,
  colors: {
    accent: BLUE_HORIZON_STUDIO_PARENT_ACCENT,
    accentHover: BLUE_HORIZON_STUDIO_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: BLUE_HORIZON_STUDIO_PARENT_SCHOOL_NAME,
    schoolShortName: BLUE_HORIZON_STUDIO_PARENT_SCHOOL_SHORT,
    officeName: BLUE_HORIZON_STUDIO_PARENT_OFFICE,
  },
};
