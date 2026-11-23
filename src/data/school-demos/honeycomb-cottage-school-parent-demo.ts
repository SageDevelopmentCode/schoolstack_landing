export {
  HONEYCOMB_COTTAGE_SCHOOL_LOGO as HONEYCOMB_COTTAGE_SCHOOL_PARENT_LOGO,
  HONEYCOMB_COTTAGE_SCHOOL_ADMIN_COLORS,
} from "./honeycomb-cottage-school-admin-demo";

export const HONEYCOMB_COTTAGE_SCHOOL_PARENT_ACCENT = "#2F5D5B";
export const HONEYCOMB_COTTAGE_SCHOOL_PARENT_ACCENT_HOVER = "#3B7371";
export const HONEYCOMB_COTTAGE_SCHOOL_PARENT_SCHOOL_NAME = "Honeycomb Cottage School";
export const HONEYCOMB_COTTAGE_SCHOOL_PARENT_SCHOOL_SHORT = "Honeycomb";
export const HONEYCOMB_COTTAGE_SCHOOL_PARENT_OFFICE = "Honeycomb Cottage School";

import { HONEYCOMB_COTTAGE_SCHOOL_ADMIN_LOGO } from "./honeycomb-cottage-school-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const honeycombCottageSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "honeycomb-cottage-school",
  logo: HONEYCOMB_COTTAGE_SCHOOL_ADMIN_LOGO,
  colors: {
    accent: HONEYCOMB_COTTAGE_SCHOOL_PARENT_ACCENT,
    accentHover: HONEYCOMB_COTTAGE_SCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: HONEYCOMB_COTTAGE_SCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: HONEYCOMB_COTTAGE_SCHOOL_PARENT_SCHOOL_SHORT,
    officeName: HONEYCOMB_COTTAGE_SCHOOL_PARENT_OFFICE,
  },
};
