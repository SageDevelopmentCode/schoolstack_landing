export {
  KATS_COMMUNITY_MICROSCHOOL_LOGO as KATS_COMMUNITY_MICROSCHOOL_PARENT_LOGO,
  KATS_COMMUNITY_MICROSCHOOL_ADMIN_COLORS,
} from "./kats-community-microschool-admin-demo";

export const KATS_COMMUNITY_MICROSCHOOL_PARENT_ACCENT = "#285943";
export const KATS_COMMUNITY_MICROSCHOOL_PARENT_ACCENT_HOVER = "#1f4535";
export const KATS_COMMUNITY_MICROSCHOOL_PARENT_SCHOOL_NAME =
  "Kat's Community Microschool";
export const KATS_COMMUNITY_MICROSCHOOL_PARENT_SCHOOL_SHORT = "Kat's Microschool";
export const KATS_COMMUNITY_MICROSCHOOL_PARENT_OFFICE = "Kat's Community Microschool Office";


import { KATS_COMMUNITY_MICROSCHOOL_ADMIN_LOGO } from "./kats-community-microschool-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const katsCommunityMicroschoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "kats-community-microschool",
  logo: KATS_COMMUNITY_MICROSCHOOL_ADMIN_LOGO,
  colors: {
    accent: KATS_COMMUNITY_MICROSCHOOL_PARENT_ACCENT,
    accentHover: KATS_COMMUNITY_MICROSCHOOL_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: KATS_COMMUNITY_MICROSCHOOL_PARENT_SCHOOL_NAME,
    schoolShortName: KATS_COMMUNITY_MICROSCHOOL_PARENT_SCHOOL_SHORT,
    officeName: KATS_COMMUNITY_MICROSCHOOL_PARENT_OFFICE,
  },
};
