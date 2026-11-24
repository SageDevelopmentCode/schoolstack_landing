export {
  BOOK_HOOKS_SCHOOLHOUSE_LOGO as BOOK_HOOKS_SCHOOLHOUSE_PARENT_LOGO,
  BOOK_HOOKS_SCHOOLHOUSE_ADMIN_COLORS,
} from "./book-hooks-schoolhouse-admin-demo";

export const BOOK_HOOKS_SCHOOLHOUSE_PARENT_ACCENT = "#243650";
export const BOOK_HOOKS_SCHOOLHOUSE_PARENT_ACCENT_HOVER = "#354B6C";
export const BOOK_HOOKS_SCHOOLHOUSE_PARENT_SCHOOL_NAME = "The Book Hooks Schoolhouse";
export const BOOK_HOOKS_SCHOOLHOUSE_PARENT_SCHOOL_SHORT = "Book Hooks";
export const BOOK_HOOKS_SCHOOLHOUSE_PARENT_OFFICE = "Book Hooks Office";

import { BOOK_HOOKS_SCHOOLHOUSE_ADMIN_LOGO } from "./book-hooks-schoolhouse-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const bookHooksSchoolhouseParentDemoConfig: SchoolParentDemoConfig = {
  slug: "book-hooks-schoolhouse",
  logo: BOOK_HOOKS_SCHOOLHOUSE_ADMIN_LOGO,
  colors: {
    accent: BOOK_HOOKS_SCHOOLHOUSE_PARENT_ACCENT,
    accentHover: BOOK_HOOKS_SCHOOLHOUSE_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: BOOK_HOOKS_SCHOOLHOUSE_PARENT_SCHOOL_NAME,
    schoolShortName: BOOK_HOOKS_SCHOOLHOUSE_PARENT_SCHOOL_SHORT,
    officeName: BOOK_HOOKS_SCHOOLHOUSE_PARENT_OFFICE,
  },
};
