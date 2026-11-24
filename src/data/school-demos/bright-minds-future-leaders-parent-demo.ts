export {
  BRIGHT_MINDS_FUTURE_LEADERS_LOGO as BRIGHT_MINDS_FUTURE_LEADERS_PARENT_LOGO,
  BRIGHT_MINDS_FUTURE_LEADERS_ADMIN_COLORS,
} from "./bright-minds-future-leaders-admin-demo";

export const BRIGHT_MINDS_FUTURE_LEADERS_PARENT_ACCENT = "#7E22CE";
export const BRIGHT_MINDS_FUTURE_LEADERS_PARENT_ACCENT_HOVER = "#9333EA";
export const BRIGHT_MINDS_FUTURE_LEADERS_PARENT_SCHOOL_NAME = "Bright Minds Future Leaders";
export const BRIGHT_MINDS_FUTURE_LEADERS_PARENT_SCHOOL_SHORT = "Bright Minds";
export const BRIGHT_MINDS_FUTURE_LEADERS_PARENT_OFFICE = "Bright Minds Office";

import { BRIGHT_MINDS_FUTURE_LEADERS_ADMIN_LOGO } from "./bright-minds-future-leaders-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const brightMindsFutureLeadersParentDemoConfig: SchoolParentDemoConfig = {
  slug: "bright-minds-future-leaders",
  logo: BRIGHT_MINDS_FUTURE_LEADERS_ADMIN_LOGO,
  colors: {
    accent: BRIGHT_MINDS_FUTURE_LEADERS_PARENT_ACCENT,
    accentHover: BRIGHT_MINDS_FUTURE_LEADERS_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: BRIGHT_MINDS_FUTURE_LEADERS_PARENT_SCHOOL_NAME,
    schoolShortName: BRIGHT_MINDS_FUTURE_LEADERS_PARENT_SCHOOL_SHORT,
    officeName: BRIGHT_MINDS_FUTURE_LEADERS_PARENT_OFFICE,
  },
};
