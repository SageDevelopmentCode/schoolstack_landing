export {
  COYS_CAMPS_AND_CLASSES_LOGO as COYS_CAMPS_AND_CLASSES_PARENT_LOGO,
  COYS_CAMPS_AND_CLASSES_ADMIN_COLORS,
} from "./coys-camps-and-classes-admin-demo";

export const COYS_CAMPS_AND_CLASSES_PARENT_ACCENT = "#2A3466";
export const COYS_CAMPS_AND_CLASSES_PARENT_ACCENT_HOVER = "#3B4785";
export const COYS_CAMPS_AND_CLASSES_PARENT_SCHOOL_NAME = "Coy's Camps And Classes";
export const COYS_CAMPS_AND_CLASSES_PARENT_SCHOOL_SHORT = "Coy's";
export const COYS_CAMPS_AND_CLASSES_PARENT_OFFICE = "Coy's Camps And Classes Office";

import { COYS_CAMPS_AND_CLASSES_ADMIN_LOGO } from "./coys-camps-and-classes-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const coysCampsAndClassesParentDemoConfig: SchoolParentDemoConfig = {
  slug: "coys-camps-and-classes",
  logo: COYS_CAMPS_AND_CLASSES_ADMIN_LOGO,
  colors: {
    accent: COYS_CAMPS_AND_CLASSES_PARENT_ACCENT,
    accentHover: COYS_CAMPS_AND_CLASSES_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: COYS_CAMPS_AND_CLASSES_PARENT_SCHOOL_NAME,
    schoolShortName: COYS_CAMPS_AND_CLASSES_PARENT_SCHOOL_SHORT,
    officeName: COYS_CAMPS_AND_CLASSES_PARENT_OFFICE,
  },
};
