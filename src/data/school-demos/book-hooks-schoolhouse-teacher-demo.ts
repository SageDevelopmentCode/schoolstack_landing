export {
  BOOK_HOOKS_SCHOOLHOUSE_LOGO as BOOK_HOOKS_SCHOOLHOUSE_TEACHER_LOGO,
} from "./book-hooks-schoolhouse-admin-demo";

export const BOOK_HOOKS_SCHOOLHOUSE_TEACHER_OFFICE = "Book Hooks Office";
export const BOOK_HOOKS_SCHOOLHOUSE_TEACHER_ACCENT = "#243650";
export const BOOK_HOOKS_SCHOOLHOUSE_TEACHER_ACCENT_HOVER = "#354B6C";

export const BOOK_HOOKS_SCHOOLHOUSE_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  explorers: "Explorers (Mon & Wed)",
  adventurers: "Adventurers (Tue & Thu)",
};

export const BOOK_HOOKS_SCHOOLHOUSE_TEACHER_PROGRAM_ORDER = ["explorers", "adventurers"] as const;

import { BOOK_HOOKS_SCHOOLHOUSE_ADMIN_LOGO } from "./book-hooks-schoolhouse-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const bookHooksSchoolhouseTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "book-hooks-schoolhouse",
  logo: BOOK_HOOKS_SCHOOLHOUSE_ADMIN_LOGO,
  accent: BOOK_HOOKS_SCHOOLHOUSE_TEACHER_ACCENT,
  accentHover: BOOK_HOOKS_SCHOOLHOUSE_TEACHER_ACCENT_HOVER,
  programLabels: BOOK_HOOKS_SCHOOLHOUSE_TEACHER_PROGRAM_LABELS,
  programOrder: BOOK_HOOKS_SCHOOLHOUSE_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: BOOK_HOOKS_SCHOOLHOUSE_TEACHER_OFFICE,
  },
};
