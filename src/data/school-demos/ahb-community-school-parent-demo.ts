export {
  AHB_COMMUNITY_SCHOOL_LOGO as AHB_COMMUNITY_SCHOOL_PARENT_LOGO,
  AHB_COMMUNITY_SCHOOL_ADMIN_COLORS,
} from "./ahb-community-school-admin-demo";

export const AHB_COMMUNITY_SCHOOL_PARENT_ACCENT = "#0076B4";
export const AHB_COMMUNITY_SCHOOL_PARENT_ACCENT_HOVER = "#005E92";
export const AHB_COMMUNITY_SCHOOL_PARENT_SCHOOL_NAME = "AHB Community School";
export const AHB_COMMUNITY_SCHOOL_PARENT_SCHOOL_SHORT = "AHB";
export const AHB_COMMUNITY_SCHOOL_PARENT_OFFICE = "AHB Office";

import { AHB_COMMUNITY_SCHOOL_ADMIN_LOGO } from "./ahb-community-school-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const ahbCommunitySchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "ahb-community-school",
  logo: AHB_COMMUNITY_SCHOOL_ADMIN_LOGO,
  colors: {
    accent: AHB_COMMUNITY_SCHOOL_PARENT_ACCENT,
    accentHover: AHB_COMMUNITY_SCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: AHB_COMMUNITY_SCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: AHB_COMMUNITY_SCHOOL_PARENT_SCHOOL_SHORT,
    officeName: AHB_COMMUNITY_SCHOOL_PARENT_OFFICE,
  },
};
