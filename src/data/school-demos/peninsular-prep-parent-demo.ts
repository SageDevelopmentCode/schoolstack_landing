export {
  PENINSULAR_PREP_LOGO as PENINSULAR_PREP_PARENT_LOGO,
  PENINSULAR_PREP_ADMIN_COLORS,
} from "./peninsular-prep-admin-demo";

export const PENINSULAR_PREP_PARENT_ACCENT = "#29457D";
export const PENINSULAR_PREP_PARENT_ACCENT_HOVER = "#365A9C";
export const PENINSULAR_PREP_PARENT_SCHOOL_NAME = "Peninsular Prep";
export const PENINSULAR_PREP_PARENT_SCHOOL_SHORT = "Pen Prep";
export const PENINSULAR_PREP_PARENT_OFFICE = "Pen Prep Front Office";

import { PENINSULAR_PREP_ADMIN_LOGO } from "./peninsular-prep-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const peninsularPrepParentDemoConfig: SchoolParentDemoConfig = {
  slug: "peninsular-prep",
  logo: PENINSULAR_PREP_ADMIN_LOGO,
  colors: {
    accent: PENINSULAR_PREP_PARENT_ACCENT,
    accentHover: PENINSULAR_PREP_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: PENINSULAR_PREP_PARENT_SCHOOL_NAME,
    schoolShortName: PENINSULAR_PREP_PARENT_SCHOOL_SHORT,
    officeName: PENINSULAR_PREP_PARENT_OFFICE,
  },
};
