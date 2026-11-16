"use client";

import { createContext, useContext, type MouseEvent } from "react";
import type { AdminSidebarCounts } from "@/lib/school-admin/admin-sidebar-nav";

/*
 * Everything the sidebar rows need, shared by the desktop aside and the
 * phone drawer so the two never drift apart.
 */

export type SidebarNavContextValue = {
  slug: string;
  pathname: string;
  isExpanded: boolean;
  counts: AdminSidebarCounts;
  /** Free plan: locked rows open the upgrade dialog instead of navigating. */
  lockedMode: boolean;
  onLockedSelect?: (label: string) => void;
  fridayBranchParentPortalPaused: boolean;
  openParents: Record<string, boolean>;
  toggleOpen: (key: string) => void;
  /** The link the admin just clicked, until its page opens. */
  pendingHref: string | null;
  onLinkClick: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  /** Show the loading cue on `href` (keyboard navigation from search). */
  markPending: (href: string) => void;
  /** Unique per panel, so the desktop and drawer pills animate apart. */
  pillLayoutId: string;
};

const SidebarNavContext = createContext<SidebarNavContextValue | null>(null);

export const SidebarNavProvider = SidebarNavContext.Provider;

export function useSidebarNav(): SidebarNavContextValue {
  const value = useContext(SidebarNavContext);
  if (!value) throw new Error("useSidebarNav must be used inside SidebarNavProvider");
  return value;
}

/** True for a plain left click that the router will handle in this tab. */
export function isPlainLeftClick(event: MouseEvent<HTMLElement>): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.defaultPrevented
  );
}
