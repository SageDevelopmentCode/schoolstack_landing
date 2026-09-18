export {
  ACTON_ACADEMY_PITTSBURGH_LOGO as ACTON_ACADEMY_PITTSBURGH_PARENT_LOGO,
  ACTON_ACADEMY_PITTSBURGH_ADMIN_COLORS,
} from "./acton-academy-pittsburgh-admin-demo";

export const ACTON_ACADEMY_PITTSBURGH_PARENT_ACCENT = "#2F5A47";
export const ACTON_ACADEMY_PITTSBURGH_PARENT_ACCENT_HOVER = "#163C31";
export const ACTON_ACADEMY_PITTSBURGH_PARENT_SCHOOL_NAME = "Acton Academy Pittsburgh";
export const ACTON_ACADEMY_PITTSBURGH_PARENT_SCHOOL_SHORT = "Acton Pittsburgh";
export const ACTON_ACADEMY_PITTSBURGH_PARENT_OFFICE = "Acton Academy Pittsburgh Office";

import { ACTON_ACADEMY_PITTSBURGH_ADMIN_LOGO } from "./acton-academy-pittsburgh-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const actonAcademyPittsburghParentDemoConfig: SchoolParentDemoConfig = {
  slug: "acton-academy-pittsburgh",
  logo: ACTON_ACADEMY_PITTSBURGH_ADMIN_LOGO,
  colors: {
    accent: ACTON_ACADEMY_PITTSBURGH_PARENT_ACCENT,
    accentHover: ACTON_ACADEMY_PITTSBURGH_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: ACTON_ACADEMY_PITTSBURGH_PARENT_SCHOOL_NAME,
    schoolShortName: ACTON_ACADEMY_PITTSBURGH_PARENT_SCHOOL_SHORT,
    officeName: ACTON_ACADEMY_PITTSBURGH_PARENT_OFFICE,
  },
};
