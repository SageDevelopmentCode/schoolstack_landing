export {
  CREATION_ACRES_ADMIN_LOGO as CREATION_ACRES_PARENT_LOGO,
  CREATION_ACRES_ADMIN_COLORS,
} from "./creationacres-admin-demo";

export const CREATION_ACRES_PARENT_ACCENT = "#396EB4";
export const CREATION_ACRES_PARENT_ACCENT_HOVER = "#203F67";
export const CREATION_ACRES_PARENT_SCHOOL_NAME = "Creation Acres Montessori";
export const CREATION_ACRES_PARENT_SCHOOL_SHORT = "Creation Acres";
export const CREATION_ACRES_PARENT_OFFICE = "Creation Acres Montessori Office";


import { CREATION_ACRES_ADMIN_LOGO } from "./creationacres-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const creationAcresParentDemoConfig: SchoolParentDemoConfig = {
  slug: "creation-acres",
  logo: CREATION_ACRES_ADMIN_LOGO,
  colors: {
    accent: CREATION_ACRES_PARENT_ACCENT,
    accentHover: CREATION_ACRES_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: CREATION_ACRES_PARENT_SCHOOL_NAME,
    schoolShortName: CREATION_ACRES_PARENT_SCHOOL_SHORT,
    officeName: CREATION_ACRES_PARENT_OFFICE,
  },
};
