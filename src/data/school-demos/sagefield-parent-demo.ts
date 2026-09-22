export {
  SAGEFIELD_ADMIN_LOGO as SAGEFIELD_PARENT_LOGO,
  SAGEFIELD_ADMIN_COLORS,
} from "./sagefield-admin-demo";

export const SAGEFIELD_PARENT_ACCENT = "#f29a8f";
export const SAGEFIELD_PARENT_ACCENT_HOVER = "#e88d82";
export const SAGEFIELD_PARENT_ACCENT_ACTIVE = "#d47f75";
export const SAGEFIELD_PARENT_WELCOME_BG = "#FFF9F5";
export const SAGEFIELD_PARENT_BADGE_BG = "#FFF4EC";
export const SAGEFIELD_PARENT_TEXT = "#333333";
export const SAGEFIELD_PARENT_SCHOOL_NAME = "Sage Field";
export const SAGEFIELD_PARENT_SCHOOL_SHORT = "Sage Field";
export const SAGEFIELD_PARENT_OFFICE = "Sage Field Office";

import { SAGEFIELD_ADMIN_LOGO } from "./sagefield-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const sagefieldParentDemoConfig: SchoolParentDemoConfig = {
  slug: "sagefield",
  logo: SAGEFIELD_ADMIN_LOGO,
  colors: {
    accent: SAGEFIELD_PARENT_ACCENT,
    accentHover: SAGEFIELD_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: SAGEFIELD_PARENT_SCHOOL_NAME,
    schoolShortName: SAGEFIELD_PARENT_SCHOOL_SHORT,
    officeName: SAGEFIELD_PARENT_OFFICE,
  },
};
