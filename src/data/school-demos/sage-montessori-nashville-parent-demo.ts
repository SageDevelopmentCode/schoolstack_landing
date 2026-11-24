export {
  SAGE_MONTESSORI_NASHVILLE_LOGO as SAGE_MONTESSORI_NASHVILLE_PARENT_LOGO,
  SAGE_MONTESSORI_NASHVILLE_ADMIN_COLORS,
} from "./sage-montessori-nashville-admin-demo";

export const SAGE_MONTESSORI_NASHVILLE_PARENT_ACCENT = "#553F71";
export const SAGE_MONTESSORI_NASHVILLE_PARENT_ACCENT_HOVER = "#6A5089";
export const SAGE_MONTESSORI_NASHVILLE_PARENT_SCHOOL_NAME = "Sage Montessori School of Nashville";
export const SAGE_MONTESSORI_NASHVILLE_PARENT_SCHOOL_SHORT = "Sage Montessori";
export const SAGE_MONTESSORI_NASHVILLE_PARENT_OFFICE = "Sage Montessori Office";

import { SAGE_MONTESSORI_NASHVILLE_ADMIN_LOGO } from "./sage-montessori-nashville-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const sageMontessoriNashvilleParentDemoConfig: SchoolParentDemoConfig = {
  slug: "sage-montessori-nashville",
  logo: SAGE_MONTESSORI_NASHVILLE_ADMIN_LOGO,
  colors: {
    accent: SAGE_MONTESSORI_NASHVILLE_PARENT_ACCENT,
    accentHover: SAGE_MONTESSORI_NASHVILLE_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: SAGE_MONTESSORI_NASHVILLE_PARENT_SCHOOL_NAME,
    schoolShortName: SAGE_MONTESSORI_NASHVILLE_PARENT_SCHOOL_SHORT,
    officeName: SAGE_MONTESSORI_NASHVILLE_PARENT_OFFICE,
  },
};
