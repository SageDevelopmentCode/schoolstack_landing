export {
  PIEDMONT_FOREST_SCHOOL_LOGO as PIEDMONT_FOREST_SCHOOL_TEACHER_LOGO,
} from "./piedmont-forest-school-admin-demo";

export const PIEDMONT_FOREST_SCHOOL_TEACHER_OFFICE = "Piedmont Forest School Office";
export const PIEDMONT_FOREST_SCHOOL_TEACHER_ACCENT = "#355B3A";
export const PIEDMONT_FOREST_SCHOOL_TEACHER_ACCENT_HOVER = "#1F3D2A";

export const PIEDMONT_FOREST_SCHOOL_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  forest_kindergarten: "Forest Kindergarten",
  nature_explorers: "Nature Explorers",
  agile_learning_center: "Agile Learning Center",
  summer_camp: "Summer Camps",
};

export const PIEDMONT_FOREST_SCHOOL_TEACHER_PROGRAM_ORDER = [
  "forest_kindergarten",
  "nature_explorers",
  "agile_learning_center",
  "summer_camp",
] as const;

import { PIEDMONT_FOREST_SCHOOL_ADMIN_LOGO } from "./piedmont-forest-school-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const piedmontForestSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "piedmont-forest-school",
  logo: PIEDMONT_FOREST_SCHOOL_ADMIN_LOGO,
  accent: PIEDMONT_FOREST_SCHOOL_TEACHER_ACCENT,
  accentHover: PIEDMONT_FOREST_SCHOOL_TEACHER_ACCENT_HOVER,
  programLabels: PIEDMONT_FOREST_SCHOOL_TEACHER_PROGRAM_LABELS,
  programOrder: PIEDMONT_FOREST_SCHOOL_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: PIEDMONT_FOREST_SCHOOL_TEACHER_OFFICE,
  },
};
