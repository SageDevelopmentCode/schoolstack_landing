export {
  BMF_MICROSCHOOLS_LOGO as BMF_MICROSCHOOLS_PARENT_LOGO,
  BMF_MICROSCHOOLS_ADMIN_COLORS,
} from "./bmf-microschools-admin-demo";

export const BMF_MICROSCHOOLS_PARENT_ACCENT = "#1F46B0";
export const BMF_MICROSCHOOLS_PARENT_ACCENT_HOVER = "#2E5AD0";
export const BMF_MICROSCHOOLS_PARENT_SCHOOL_NAME = "School to Purpose Academies";
export const BMF_MICROSCHOOLS_PARENT_SCHOOL_SHORT = "Purpose Academies";
export const BMF_MICROSCHOOLS_PARENT_OFFICE = "Purpose Academies Office";

import { BMF_MICROSCHOOLS_ADMIN_LOGO } from "./bmf-microschools-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const bmfMicroschoolsParentDemoConfig: SchoolParentDemoConfig = {
  slug: "bmf-microschools",
  logo: BMF_MICROSCHOOLS_ADMIN_LOGO,
  colors: {
    accent: BMF_MICROSCHOOLS_PARENT_ACCENT,
    accentHover: BMF_MICROSCHOOLS_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: BMF_MICROSCHOOLS_PARENT_SCHOOL_NAME,
    schoolShortName: BMF_MICROSCHOOLS_PARENT_SCHOOL_SHORT,
    officeName: BMF_MICROSCHOOLS_PARENT_OFFICE,
  },
};
