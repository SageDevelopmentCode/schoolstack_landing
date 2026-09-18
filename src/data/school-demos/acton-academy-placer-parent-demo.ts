export {
  ACTON_ACADEMY_PLACER_LOGO as ACTON_ACADEMY_PLACER_PARENT_LOGO,
  ACTON_ACADEMY_PLACER_ADMIN_COLORS,
} from "./acton-academy-placer-admin-demo";

export const ACTON_ACADEMY_PLACER_PARENT_ACCENT = "#183E35";
export const ACTON_ACADEMY_PLACER_PARENT_ACCENT_HOVER = "#102820";
export const ACTON_ACADEMY_PLACER_PARENT_SCHOOL_NAME = "Acton Academy Placer";
export const ACTON_ACADEMY_PLACER_PARENT_SCHOOL_SHORT = "Acton Placer";
export const ACTON_ACADEMY_PLACER_PARENT_OFFICE = "Acton Academy Placer Office";

import { ACTON_ACADEMY_PLACER_ADMIN_LOGO } from "./acton-academy-placer-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const actonAcademyPlacerParentDemoConfig: SchoolParentDemoConfig = {
  slug: "acton-academy-placer",
  logo: ACTON_ACADEMY_PLACER_ADMIN_LOGO,
  colors: {
    accent: ACTON_ACADEMY_PLACER_PARENT_ACCENT,
    accentHover: ACTON_ACADEMY_PLACER_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: ACTON_ACADEMY_PLACER_PARENT_SCHOOL_NAME,
    schoolShortName: ACTON_ACADEMY_PLACER_PARENT_SCHOOL_SHORT,
    officeName: ACTON_ACADEMY_PLACER_PARENT_OFFICE,
  },
};
