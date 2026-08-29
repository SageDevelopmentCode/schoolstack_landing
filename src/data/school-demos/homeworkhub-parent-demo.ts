export {
  HOMEWORK_HUB_ADMIN_LOGO as HOMEWORK_HUB_PARENT_LOGO,
  HOMEWORK_HUB_ADMIN_COLORS,
} from "./homeworkhub-admin-demo";

export const HOMEWORK_HUB_PARENT_ACCENT = "#05BFFB";
export const HOMEWORK_HUB_PARENT_ACCENT_HOVER = "#04A8E0";
export const HOMEWORK_HUB_PARENT_SCHOOL_NAME = "Homework Hub";
export const HOMEWORK_HUB_PARENT_SCHOOL_SHORT = "Homework Hub";
export const HOMEWORK_HUB_PARENT_OFFICE = "Homework Hub Office";


import { HOMEWORK_HUB_ADMIN_LOGO } from "./homeworkhub-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const homeworkHubParentDemoConfig: SchoolParentDemoConfig = {
  slug: "homework-hub",
  logo: HOMEWORK_HUB_ADMIN_LOGO,
  colors: {
    accent: HOMEWORK_HUB_PARENT_ACCENT,
    accentHover: HOMEWORK_HUB_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: HOMEWORK_HUB_PARENT_SCHOOL_NAME,
    schoolShortName: HOMEWORK_HUB_PARENT_SCHOOL_SHORT,
    officeName: HOMEWORK_HUB_PARENT_OFFICE,
  },
};
