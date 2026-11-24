export {
  BMF_MICROSCHOOLS_LOGO as BMF_MICROSCHOOLS_TEACHER_LOGO,
} from "./bmf-microschools-admin-demo";

export const BMF_MICROSCHOOLS_TEACHER_OFFICE = "Purpose Academies Office";
export const BMF_MICROSCHOOLS_TEACHER_ACCENT = "#1F46B0";
export const BMF_MICROSCHOOLS_TEACHER_ACCENT_HOVER = "#2E5AD0";

export const BMF_MICROSCHOOLS_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  moore: "Moore Academy (Pre-K–3rd)",
  king: "King Academy (4th–8th)",
  love: "Love Academy (High school)",
};

export const BMF_MICROSCHOOLS_TEACHER_PROGRAM_ORDER = ["moore", "king", "love"] as const;

import { BMF_MICROSCHOOLS_ADMIN_LOGO } from "./bmf-microschools-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const bmfMicroschoolsTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "bmf-microschools",
  logo: BMF_MICROSCHOOLS_ADMIN_LOGO,
  accent: BMF_MICROSCHOOLS_TEACHER_ACCENT,
  accentHover: BMF_MICROSCHOOLS_TEACHER_ACCENT_HOVER,
  programLabels: BMF_MICROSCHOOLS_TEACHER_PROGRAM_LABELS,
  programOrder: BMF_MICROSCHOOLS_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: BMF_MICROSCHOOLS_TEACHER_OFFICE,
  },
};
