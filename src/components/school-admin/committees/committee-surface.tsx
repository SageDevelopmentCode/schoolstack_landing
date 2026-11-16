"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { adminToast } from "@/lib/school-admin/admin-toast";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parentToast } from "@/lib/school-parent/parent-toast";

/*
 * Committee workspace "surface": which look the shared committee sections
 * render in. Default "story" (School Day Story, unchanged). The parent/teacher
 * workspace (ParentCommitteeWorkspaceShell) provides "garden"; the admin
 * Committees tab provides "admin-garden": the same Garden sections, with
 * admin toasts (adminToast, "Retry", error-specific ids).
 * Skills: parent-portal-garden-design, admin-portal-garden-design.
 */

export type CommitteeSurface = "story" | "garden" | "admin-garden";

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
  const surface = useContext(CommitteeSurfaceContext);
  return surface === "garden" || surface === "admin-garden";
}

/** Admin Committees tab on Garden (admin-only affordances and copy). */
export function useIsAdminGardenCommittee(): boolean {
  return useContext(CommitteeSurfaceContext) === "admin-garden";
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

/** Admin Garden: the admin feedback contract (title + description, Retry, -error ids). */
const ADMIN_GARDEN_NOTIFY: CommitteeNotify = {
  success: (message, options) => {
    if (options?.id) adminToast.dismiss(`${options.id}-error`);
    adminToast.success(message, {
      description: options?.description,
      id: options?.id ? `${options.id}-ok` : undefined,
    });
  },
  error: (message, options) => {
    const id = options?.id ? `${options.id}-error` : undefined;
    const retry = options?.retry;
    adminToast.error(options?.title ?? message, {
      description: options?.title ? message : undefined,
      id,
      action: retry
        ? {
            label: "Retry",
            onClick: () => {
              if (id) adminToast.dismiss(id);
              retry();
            },
          }
        : undefined,
    });
  },
  info: (message, options) => {
    adminToast.info(message, { description: options?.description, id: options?.id });
  },
  clearError: (id) => {
    adminToast.dismiss(`${id}-error`);
  },
};

/**
 * Toasts for committee actions. Story calls `adminToast` with the same single
 * message as before and ignores the options; Garden (parent) and admin Garden
 * add a title, description and a retry action.
 */
export function useCommitteeNotify(): CommitteeNotify {
  const surface = useCommitteeSurface();
  return useMemo(
    () => (surface === "garden" ? GARDEN_NOTIFY : surface === "admin-garden" ? ADMIN_GARDEN_NOTIFY : STORY_NOTIFY),
    [surface],
  );
}
