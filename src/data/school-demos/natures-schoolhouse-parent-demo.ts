export {
  NATURES_SCHOOLHOUSE_LOGO as NATURES_SCHOOLHOUSE_PARENT_LOGO,
  NATURES_SCHOOLHOUSE_ADMIN_COLORS,
} from "./natures-schoolhouse-admin-demo";

export const NATURES_SCHOOLHOUSE_PARENT_ACCENT = "#3F7652";
export const NATURES_SCHOOLHOUSE_PARENT_ACCENT_HOVER = "#2F5E40";
export const NATURES_SCHOOLHOUSE_PARENT_SCHOOL_NAME = "Nature's Schoolhouse Microschool";
export const NATURES_SCHOOLHOUSE_PARENT_SCHOOL_SHORT = "Nature's Schoolhouse";
export const NATURES_SCHOOLHOUSE_PARENT_OFFICE = "Nature's Schoolhouse Microschool Office";


import { NATURES_SCHOOLHOUSE_ADMIN_LOGO } from "./natures-schoolhouse-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const naturesSchoolhouseParentDemoConfig: SchoolParentDemoConfig = {
  slug: "natures-schoolhouse",
  logo: NATURES_SCHOOLHOUSE_ADMIN_LOGO,
  colors: {
    accent: NATURES_SCHOOLHOUSE_PARENT_ACCENT,
    accentHover: NATURES_SCHOOLHOUSE_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: NATURES_SCHOOLHOUSE_PARENT_SCHOOL_NAME,
    schoolShortName: NATURES_SCHOOLHOUSE_PARENT_SCHOOL_SHORT,
    officeName: NATURES_SCHOOLHOUSE_PARENT_OFFICE,
  },
};
