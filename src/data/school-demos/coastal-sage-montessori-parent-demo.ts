export {
  COASTAL_SAGE_MONTESSORI_LOGO as COASTAL_SAGE_MONTESSORI_PARENT_LOGO,
  COASTAL_SAGE_MONTESSORI_ADMIN_COLORS,
} from "./coastal-sage-montessori-admin-demo";

export const COASTAL_SAGE_MONTESSORI_PARENT_ACCENT = "#1F3856";
export const COASTAL_SAGE_MONTESSORI_PARENT_ACCENT_HOVER = "#2E4D72";
export const COASTAL_SAGE_MONTESSORI_PARENT_SCHOOL_NAME = "Coastal Sage Montessori";
export const COASTAL_SAGE_MONTESSORI_PARENT_SCHOOL_SHORT = "Coastal Sage";
export const COASTAL_SAGE_MONTESSORI_PARENT_OFFICE = "Coastal Sage Montessori Office";

import { COASTAL_SAGE_MONTESSORI_ADMIN_LOGO } from "./coastal-sage-montessori-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const coastalSageMontessoriParentDemoConfig: SchoolParentDemoConfig = {
  slug: "coastal-sage-montessori",
  logo: COASTAL_SAGE_MONTESSORI_ADMIN_LOGO,
  colors: {
    accent: COASTAL_SAGE_MONTESSORI_PARENT_ACCENT,
    accentHover: COASTAL_SAGE_MONTESSORI_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: COASTAL_SAGE_MONTESSORI_PARENT_SCHOOL_NAME,
    schoolShortName: COASTAL_SAGE_MONTESSORI_PARENT_SCHOOL_SHORT,
    officeName: COASTAL_SAGE_MONTESSORI_PARENT_OFFICE,
  },
};
