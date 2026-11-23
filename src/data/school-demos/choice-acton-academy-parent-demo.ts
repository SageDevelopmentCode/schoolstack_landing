export {
  CHOICE_ACTON_ACADEMY_LOGO as CHOICE_ACTON_ACADEMY_PARENT_LOGO,
  CHOICE_ACTON_ACADEMY_ADMIN_COLORS,
} from "./choice-acton-academy-admin-demo";

export const CHOICE_ACTON_ACADEMY_PARENT_ACCENT = "#0B2A67";
export const CHOICE_ACTON_ACADEMY_PARENT_ACCENT_HOVER = "#1A3D85";
export const CHOICE_ACTON_ACADEMY_PARENT_SCHOOL_NAME = "CHOICE: An Acton Academy";
export const CHOICE_ACTON_ACADEMY_PARENT_SCHOOL_SHORT = "CHOICE";
export const CHOICE_ACTON_ACADEMY_PARENT_OFFICE = "CHOICE Office";

import { CHOICE_ACTON_ACADEMY_ADMIN_LOGO } from "./choice-acton-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const choiceActonAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "choice-acton-academy",
  logo: CHOICE_ACTON_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: CHOICE_ACTON_ACADEMY_PARENT_ACCENT,
    accentHover: CHOICE_ACTON_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: CHOICE_ACTON_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: CHOICE_ACTON_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: CHOICE_ACTON_ACADEMY_PARENT_OFFICE,
  },
};
