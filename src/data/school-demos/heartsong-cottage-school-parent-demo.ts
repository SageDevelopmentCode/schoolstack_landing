export {
  HEARTSONG_COTTAGE_SCHOOL_LOGO as HEARTSONG_COTTAGE_SCHOOL_PARENT_LOGO,
  HEARTSONG_COTTAGE_SCHOOL_ADMIN_COLORS,
} from "./heartsong-cottage-school-admin-demo";

export const HEARTSONG_COTTAGE_SCHOOL_PARENT_ACCENT = "#213472";
export const HEARTSONG_COTTAGE_SCHOOL_PARENT_ACCENT_HOVER = "#2F4691";
export const HEARTSONG_COTTAGE_SCHOOL_PARENT_SCHOOL_NAME = "Heartsong Cottage School";
export const HEARTSONG_COTTAGE_SCHOOL_PARENT_SCHOOL_SHORT = "Heartsong";
export const HEARTSONG_COTTAGE_SCHOOL_PARENT_OFFICE = "Heartsong Cottage School";

import { HEARTSONG_COTTAGE_SCHOOL_ADMIN_LOGO } from "./heartsong-cottage-school-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const heartsongCottageSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "heartsong-cottage-school",
  logo: HEARTSONG_COTTAGE_SCHOOL_ADMIN_LOGO,
  colors: {
    accent: HEARTSONG_COTTAGE_SCHOOL_PARENT_ACCENT,
    accentHover: HEARTSONG_COTTAGE_SCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: HEARTSONG_COTTAGE_SCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: HEARTSONG_COTTAGE_SCHOOL_PARENT_SCHOOL_SHORT,
    officeName: HEARTSONG_COTTAGE_SCHOOL_PARENT_OFFICE,
  },
};
