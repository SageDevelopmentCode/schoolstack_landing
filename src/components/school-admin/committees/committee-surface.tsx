"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { adminToast } from "@/lib/school-admin/admin-toast";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parentToast } from "@/lib/school-parent/parent-toast";

/*
 * Committee workspace "surface": which look the shared committee sections
 * render in. The admin portal never sets it, so it stays "story" and renders
 * exactly as before. The parent/teacher workspace (ParentCommitteeWorkspaceShell)
 * provides "garden" to get the parent Garden dashboard look.
 * Skill: parent-portal-garden-design.
 */

export type CommitteeSurface = "story" | "garden";

const CommitteeSurfaceContext = createContext<CommitteeSurface>("story");

export function CommitteeSurfaceProvider({
  value,
  children,
}: {
  value: CommitteeSurface;
  children: ReactNode;
}) {
  return <CommitteeSurfaceContext.Provider value={value}>{children}</CommitteeSurfaceContext.Provider>;
}

export function useCommitteeSurface(): CommitteeSurface {
  return useContext(CommitteeSurfaceContext);
}

export function useIsGardenCommittee(): boolean {
  return useContext(CommitteeSurfaceContext) === "garden";
}

/**
 * Theme tokens for Garden sections: Garden neutrals and fonts, the school's
 * own accent. Colours stay hex so code that appends alpha (`${theme.primary}33`)
 * keeps working; inline `theme.*` styles in shared sections pick these up.
 */
export function gardenCommitteeTheme(theme: ParentThemeTokens): ParentThemeTokens {
  return {
    ...theme,
    paper: "#fffaf4",
    cream: "#f7f1e7",
    ink: "#2b241d",
    muted: "#6d6257",
    line: "#e7ded2",
    white: "#ffffff",
    shadowCard: "0 3px 0 0 rgba(43,36,29,0.08)",
    shadowPill: "0 2px 0 0 rgba(43,36,29,0.12)",
    radiusCard: "24px",
    radiusButton: "999px",
    fontDisplay: "var(--font-sf-display), ui-sans-serif, system-ui, sans-serif",
    fontBody: "var(--font-sf-body), ui-rounded, system-ui, sans-serif",
  };
}

export type CommitteeNotifyErrorOptions = {
  /** Garden toast title ("Couldn't add the task"); the message becomes the description. */
  title?: string;
  /** Garden only: "Try again" action. */
  retry?: () => void;
  id?: string;
};

export type CommitteeNotifySuccessOptions = {
  /** Garden only: what it means / what happens next. */
  description?: string;
  id?: string;
};

export type CommitteeNotify = {
  success: (message: string, options?: CommitteeNotifySuccessOptions) => void;
  error: (message: string, options?: CommitteeNotifyErrorOptions) => void;
  info: (message: string, options?: CommitteeNotifySuccessOptions) => void;
  /** Garden only: remove a still-visible error toast for `id` (e.g. after a quiet success). */
  clearError: (id: string) => void;
};

const STORY_NOTIFY: CommitteeNotify = {
  success: (message) => {
    adminToast.success(message);
  },
  error: (message) => {
    adminToast.error(message);
  },
  info: (message) => {
    adminToast.info(message);
  },
  clearError: () => undefined,
};

const GARDEN_NOTIFY: CommitteeNotify = {
  success: (message, options) => {
    if (options?.id) parentToast.dismiss(`${options.id}-error`);
    parentToast.success(message, {
      description: options?.description,
      id: options?.id ? `${options.id}-ok` : undefined,
    });
  },
  error: (message, options) => {
    parentToast.error(options?.title ?? message, {
      description: options?.title ? message : undefined,
      id: options?.id ? `${options.id}-error` : undefined,
      action: options?.retry ? { label: "Try again", onClick: options.retry } : undefined,
    });
  },
  info: (message, options) => {
    parentToast.info(message, { description: options?.description });
  },
  clearError: (id) => {
    parentToast.dismiss(`${id}-error`);
  },
};

/**
 * Toasts for committee actions. Story (admin) calls `adminToast` with the same
 * single message as before and ignores the options; Garden adds a title,
 * description and "Try again".
 */
export function useCommitteeNotify(): CommitteeNotify {
  const surface = useCommitteeSurface();
  return useMemo(() => (surface === "garden" ? GARDEN_NOTIFY : STORY_NOTIFY), [surface]);
}
