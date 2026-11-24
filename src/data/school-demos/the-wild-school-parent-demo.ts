export {
  THE_WILD_SCHOOL_LOGO as THE_WILD_SCHOOL_PARENT_LOGO,
  THE_WILD_SCHOOL_ADMIN_COLORS,
} from "./the-wild-school-admin-demo";

export const THE_WILD_SCHOOL_PARENT_ACCENT = "#3E5A3A";
export const THE_WILD_SCHOOL_PARENT_ACCENT_HOVER = "#4D6E48";
export const THE_WILD_SCHOOL_PARENT_SCHOOL_NAME = "The Wild School";
export const THE_WILD_SCHOOL_PARENT_SCHOOL_SHORT = "The Wild School";
export const THE_WILD_SCHOOL_PARENT_OFFICE = "Wild School Family Experience";

import { THE_WILD_SCHOOL_ADMIN_LOGO } from "./the-wild-school-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const theWildSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "the-wild-school",
  logo: THE_WILD_SCHOOL_ADMIN_LOGO,
  colors: {
    accent: THE_WILD_SCHOOL_PARENT_ACCENT,
    accentHover: THE_WILD_SCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: THE_WILD_SCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: THE_WILD_SCHOOL_PARENT_SCHOOL_SHORT,
    officeName: THE_WILD_SCHOOL_PARENT_OFFICE,
  },
};
