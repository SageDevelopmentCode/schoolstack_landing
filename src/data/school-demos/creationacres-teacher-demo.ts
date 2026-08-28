export {
  CREATION_ACRES_ADMIN_LOGO as CREATION_ACRES_TEACHER_LOGO,
} from "./creationacres-admin-demo";

export const CREATION_ACRES_TEACHER_OFFICE = "Creation Acres Montessori Office";
export const CREATION_ACRES_TEACHER_ACCENT = "#396EB4";
export const CREATION_ACRES_TEACHER_ACCENT_HOVER = "#203F67";

export const CREATION_ACRES_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  primary_26_27: "Primary · Montessori Microschool",
  elementary_26_27: "Elementary · Montessori Microschool",
  adolescent_26_27: "Adolescent · Montessori Microschool",
  outdoor_hybrid: "Outdoor Hybrid · 2 Days/Week",
  nanoschool: "Nanoschool · Friday Enrichment",
};

export const CREATION_ACRES_TEACHER_PROGRAM_ORDER = [
  "primary_26_27",
  "elementary_26_27",
  "adolescent_26_27",
  "outdoor_hybrid",
  "nanoschool",
] as const;


import { CREATION_ACRES_ADMIN_LOGO } from "./creationacres-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const creationAcresTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "creation-acres",
  logo: CREATION_ACRES_ADMIN_LOGO,
  accent: CREATION_ACRES_TEACHER_ACCENT,
  accentHover: CREATION_ACRES_TEACHER_ACCENT_HOVER,
  programLabels: CREATION_ACRES_TEACHER_PROGRAM_LABELS,
  programOrder: CREATION_ACRES_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: CREATION_ACRES_TEACHER_OFFICE,
  },
};
