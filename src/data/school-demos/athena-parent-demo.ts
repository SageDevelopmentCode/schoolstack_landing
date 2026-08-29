export {
  ATHENA_ADMIN_LOGO as ATHENA_PARENT_LOGO,
  ATHENA_ADMIN_COLORS,
} from "./athena-admin-demo";

export const ATHENA_PARENT_ACCENT = "#173B5C";
export const ATHENA_PARENT_ACCENT_HOVER = "#122D47";
export const ATHENA_PARENT_SCHOOL_NAME = "Athena Micro-academy of Austin";
export const ATHENA_PARENT_SCHOOL_SHORT = "Athena Micro-academy";
export const ATHENA_PARENT_OFFICE = "Athena Micro-academy Office";


import { ATHENA_ADMIN_LOGO } from "./athena-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const athenaMicroacademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "athena-microacademy",
  logo: ATHENA_ADMIN_LOGO,
  colors: {
    accent: ATHENA_PARENT_ACCENT,
    accentHover: ATHENA_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: ATHENA_PARENT_SCHOOL_NAME,
    schoolShortName: ATHENA_PARENT_SCHOOL_SHORT,
    officeName: ATHENA_PARENT_OFFICE,
  },
};
