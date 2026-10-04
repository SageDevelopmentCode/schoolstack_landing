import { LUFF_LEARNING_ADMIN_COLORS } from "@/data/school-demos/luff-learning-admin-demo";
import { SCREEN } from "@/components/admin/marketing/screens/story-chrome";

/** Slide 8 phone mocks — Mud School / homepage demo green (not global SCREEN.primary). */
export const MARKETING_MOBILE_THEME = {
  paper: SCREEN.paper,
  white: SCREEN.white,
  ink: SCREEN.ink,
  muted: SCREEN.muted,
  line: SCREEN.line,
  primary: LUFF_LEARNING_ADMIN_COLORS.accent,
  primaryDark: LUFF_LEARNING_ADMIN_COLORS.accentBright,
  soft: LUFF_LEARNING_ADMIN_COLORS.accentLight,
  sage: LUFF_LEARNING_ADMIN_COLORS.accent,
  success: SCREEN.success,
  successBg: SCREEN.successBg,
  sunBg: SCREEN.sunBg,
  sun: SCREEN.sun,
} as const;

export const MARKETING_MOBILE_DATE_LABEL = "Sunday, October 4, 2026";

/** In-phone UI scale for carousel export (scroll content only). */
export const MARKETING_MOBILE_CONTENT_ZOOM = 1.07;

/** Vertical gap between major blocks inside phone scroll content. */
export const MARKETING_MOBILE_SECTION_GAP = 12;
