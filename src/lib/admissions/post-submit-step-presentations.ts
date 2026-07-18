import type { CSSProperties } from "react";
import type { PostSubmitActionType } from "./application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export type PostSubmitStepPresentation = {
  eyebrow: string;
  ctaLabel: string;
  cardPattern: "none" | "bubbles" | "timeline";
  headerBand: (C: AdminThemeTokens) => CSSProperties;
  iconRing: (C: AdminThemeTokens) => CSSProperties;
  cardBorder: (C: AdminThemeTokens) => CSSProperties;
  accentText: (C: AdminThemeTokens) => string;
};

const PRESENTATIONS: Record<PostSubmitActionType, PostSubmitStepPresentation> = {
  schedule_campus_tour: {
    eyebrow: "Campus visit",
    ctaLabel: "Book campus tour",
    cardPattern: "none",
    headerBand: (C) => ({
      background: `linear-gradient(135deg, ${C.clayBg} 0%, ${C.accentLight} 100%)`,
      borderBottom: `1px solid ${C.clayBorder}`,
    }),
    iconRing: (C) => ({
      backgroundColor: C.surface,
      border: `2px solid ${C.clayBorder}`,
      color: C.accent,
    }),
    cardBorder: (C) => ({
      borderColor: C.clayBorder,
      boxShadow: `0 1px 3px ${C.clay}22`,
    }),
    accentText: (C) => C.accentDark,
  },
  schedule_family_interview: {
    eyebrow: "Family meeting",
    ctaLabel: "Schedule interview",
    cardPattern: "bubbles",
    headerBand: (C) => ({
      background: `linear-gradient(135deg, ${C.accentLight} 0%, ${C.surface} 100%)`,
      borderBottom: `1px solid ${C.border}`,
    }),
    iconRing: (C) => ({
      backgroundColor: C.accentLight,
      border: `2px solid ${C.accent}`,
      color: C.accent,
    }),
    cardBorder: (C) => ({
      borderColor: C.border,
      boxShadow: C.shadowCard,
    }),
    accentText: (C) => C.accent,
  },
  schedule_observation_day: {
    eyebrow: "School day experience",
    ctaLabel: "Book shadow days",
    cardPattern: "timeline",
    headerBand: (C) => ({
      background: `linear-gradient(135deg, ${C.accentMid}18 0%, ${C.accentLight} 100%)`,
      borderBottom: `1px solid ${C.borderStrong}`,
    }),
    iconRing: (C) => ({
      backgroundColor: C.elevated,
      border: `2px solid ${C.accentMid}`,
      color: C.accentDark,
    }),
    cardBorder: (C) => ({
      borderColor: C.borderStrong,
      boxShadow: C.shadowMedium,
    }),
    accentText: (C) => C.accentDark,
  },
};

export function getPostSubmitStepPresentation(
  type: PostSubmitActionType,
): PostSubmitStepPresentation {
  return PRESENTATIONS[type];
}
