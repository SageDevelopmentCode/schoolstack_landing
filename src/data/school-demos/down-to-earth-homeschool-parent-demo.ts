export {
  DOWN_TO_EARTH_HOMESCHOOL_LOGO as DOWN_TO_EARTH_HOMESCHOOL_PARENT_LOGO,
  DOWN_TO_EARTH_HOMESCHOOL_ADMIN_COLORS,
} from "./down-to-earth-homeschool-admin-demo";

export const DOWN_TO_EARTH_HOMESCHOOL_PARENT_ACCENT = "#1F7A58";
export const DOWN_TO_EARTH_HOMESCHOOL_PARENT_ACCENT_HOVER = "#2A936C";
export const DOWN_TO_EARTH_HOMESCHOOL_PARENT_SCHOOL_NAME = "Down to Earth Co-op";
export const DOWN_TO_EARTH_HOMESCHOOL_PARENT_SCHOOL_SHORT = "Down to Earth";
export const DOWN_TO_EARTH_HOMESCHOOL_PARENT_OFFICE = "Down to Earth Co-op Directors";

import { DOWN_TO_EARTH_HOMESCHOOL_ADMIN_LOGO } from "./down-to-earth-homeschool-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const downToEarthHomeschoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "down-to-earth-homeschool",
  logo: DOWN_TO_EARTH_HOMESCHOOL_ADMIN_LOGO,
  colors: {
    accent: DOWN_TO_EARTH_HOMESCHOOL_PARENT_ACCENT,
    accentHover: DOWN_TO_EARTH_HOMESCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: DOWN_TO_EARTH_HOMESCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: DOWN_TO_EARTH_HOMESCHOOL_PARENT_SCHOOL_SHORT,
    officeName: DOWN_TO_EARTH_HOMESCHOOL_PARENT_OFFICE,
  },
};
