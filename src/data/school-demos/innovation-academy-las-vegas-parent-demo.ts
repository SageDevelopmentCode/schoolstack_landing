export {
  INNOVATION_ACADEMY_LAS_VEGAS_LOGO as INNOVATION_ACADEMY_LAS_VEGAS_PARENT_LOGO,
  INNOVATION_ACADEMY_LAS_VEGAS_ADMIN_COLORS,
} from "./innovation-academy-las-vegas-admin-demo";

export const INNOVATION_ACADEMY_LAS_VEGAS_PARENT_ACCENT = "#2B6F6A";
export const INNOVATION_ACADEMY_LAS_VEGAS_PARENT_ACCENT_HOVER = "#358B84";
export const INNOVATION_ACADEMY_LAS_VEGAS_PARENT_SCHOOL_NAME = "Innovation Academy";
export const INNOVATION_ACADEMY_LAS_VEGAS_PARENT_SCHOOL_SHORT = "Innovation Academy";
export const INNOVATION_ACADEMY_LAS_VEGAS_PARENT_OFFICE = "Innovation Academy Office";

import { INNOVATION_ACADEMY_LAS_VEGAS_ADMIN_LOGO } from "./innovation-academy-las-vegas-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const innovationAcademyLasVegasParentDemoConfig: SchoolParentDemoConfig = {
  slug: "innovation-academy-las-vegas",
  logo: INNOVATION_ACADEMY_LAS_VEGAS_ADMIN_LOGO,
  colors: {
    accent: INNOVATION_ACADEMY_LAS_VEGAS_PARENT_ACCENT,
    accentHover: INNOVATION_ACADEMY_LAS_VEGAS_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: INNOVATION_ACADEMY_LAS_VEGAS_PARENT_SCHOOL_NAME,
    schoolShortName: INNOVATION_ACADEMY_LAS_VEGAS_PARENT_SCHOOL_SHORT,
    officeName: INNOVATION_ACADEMY_LAS_VEGAS_PARENT_OFFICE,
  },
};
