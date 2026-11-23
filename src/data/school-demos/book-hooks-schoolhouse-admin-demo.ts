/** Shared Book Hooks logo — used everywhere branding appears in the demo. */
export const BOOK_HOOKS_SCHOOLHOUSE_LOGO = {
  src: "/images/demo/bookhooksschoolhouse/logo.png",
  alt: "The Book Hooks Schoolhouse logo, a hook in an open book",
  width: 46,
  height: 56,
} as const;

export const BOOK_HOOKS_SCHOOLHOUSE_ADMIN_LOGO = BOOK_HOOKS_SCHOOLHOUSE_LOGO;

export const BOOK_HOOKS_SCHOOLHOUSE_ADMIN_COMPACT_ROWS = 5;

export const BOOK_HOOKS_SCHOOLHOUSE_ADMIN_COLORS = {
  bg: "#f8f6f1",
  border: "#E0DACB",
  borderStrong: "#243650",
  accent: "#243650",
  accentBright: "#354B6C",
  accentLight: "rgba(36, 54, 80, 0.10)",
  secondaryBtnBorder: "rgba(36, 54, 80, 0.22)",
  accentGlow: "rgba(36, 54, 80, 0.12)",
  accentMid: "#243650",
  accentDark: "#172438",
  clay: "#D9A441",
  clayBg: "rgba(217, 164, 65, 0.16)",
  clayBorder: "rgba(217, 164, 65, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as bookHooksSchoolhouseAdminContentOverrides } from "./admin-content/book-hooks-schoolhouse";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const bookHooksSchoolhouseAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "book-hooks-schoolhouse",
  logo: BOOK_HOOKS_SCHOOLHOUSE_ADMIN_LOGO,
  colors: BOOK_HOOKS_SCHOOLHOUSE_ADMIN_COLORS,
  compactRows: BOOK_HOOKS_SCHOOLHOUSE_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "The Book Hooks Schoolhouse",
    schoolShortName: "Book Hooks",
    officeName: "Book Hooks Office",
    locationSubtitle: "Houston, Texas · Christian hybrid microschool, 1st–12th",
  },
  contentOverrides: bookHooksSchoolhouseAdminContentOverrides,
};
