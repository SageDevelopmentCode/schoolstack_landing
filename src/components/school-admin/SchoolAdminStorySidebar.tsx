"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminSidebarPanel from "@/components/school-admin/sidebar/AdminSidebarPanel";
import type { buildAdminNavGroups } from "@/lib/organization-settings/admin-nav";
import {
  EMPTY_ADMIN_NAV_COUNTS,
  type AdminNavCountValues,
} from "@/lib/school-admin/admin-nav-counts";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import type { SchoolAdminUserProfile } from "@/lib/school-admin/access";
import type { OrganizationPlan } from "@/lib/organization-settings/plans";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

/*
 * Admin portal sidebar (desktop, md and up), in the Garden look.
 * The same panel renders in the phone drawer (`sidebar/AdminMobileNavDrawer`).
 * Skill: .claude/skills/admin-portal-garden-design.
 */

export const ADMIN_SIDEBAR_WIDTH_EXPANDED = 236;
export const ADMIN_SIDEBAR_WIDTH_COLLAPSED = 68;

type SchoolAdminStorySidebarProps = {
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  navGroups: ReturnType<typeof buildAdminNavGroups>;
  isExpanded: boolean;
  onToggleExpand: () => void;
  userProfile: SchoolAdminUserProfile | null;
  onSignOut: () => Promise<void>;
  onOpenSupport: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  messagesUnreadCount: number;
  /** "Needs you" counts: Staff hours requests, applications, committee join requests. */
  needsCounts?: Partial<AdminNavCountValues>;
  portalOptions?: SchoolPortalOption[];
  openPortalLinksInNewTab?: boolean;
  previewMode?: boolean;
  pathnameOverride?: string;
  fridayBranchParentPortalPaused?: boolean;
  onLockedFeature?: (label: string) => void;
  plan?: OrganizationPlan;
  /** Bumped on ⌘K / Ctrl+K to focus "Find a page". */
  searchFocusToken?: number;
  /** Collapsed search icon: expand, then focus the search input. */
  onRequestSearch?: () => void;
  /** False until the remembered width is read, so it doesn't animate on load. */
  animateWidth?: boolean;
  className?: string;
};

export default function SchoolAdminStorySidebar({
  branding,
  schoolName,
  slug,
  navGroups,
  isExpanded,
  onToggleExpand,
  userProfile,
  onSignOut,
  onOpenSupport,
  onOpenNotifications,
  unreadCount,
  messagesUnreadCount,
  needsCounts,
  portalOptions = [],
  openPortalLinksInNewTab = false,
  previewMode = false,
  pathnameOverride,
  fridayBranchParentPortalPaused = false,
  onLockedFeature,
  plan = "custom",
  searchFocusToken = 0,
  onRequestSearch,
  animateWidth = true,
  className = "",
}: SchoolAdminStorySidebarProps) {
  const routerPathname = usePathname();
  const pathname = pathnameOverride ?? routerPathname;
  const { theme } = useSchoolAdminStoryTheme();
  const counts = useMemo(
    () => ({ ...EMPTY_ADMIN_NAV_COUNTS, ...needsCounts, messagesUnread: messagesUnreadCount }),
    [messagesUnreadCount, needsCounts],
  );

  return (
    <ParentGardenScope
      theme={theme}
      className={`relative z-[1] h-full shrink-0 ${
        animateWidth ? "transition-[width] duration-200 ease-out motion-reduce:transition-none" : ""
      } ${className}`}
      style={{ width: isExpanded ? ADMIN_SIDEBAR_WIDTH_EXPANDED : ADMIN_SIDEBAR_WIDTH_COLLAPSED }}
    >
      <aside
        aria-label="Admin sidebar"
        className="flex h-full w-full flex-col overflow-hidden border-r-[1.5px] border-[var(--sf-ink)]/10 bg-white shadow-[1px_0_0_rgba(29,26,22,0.04),8px_0_24px_-20px_rgba(29,26,22,0.25)]"
      >
        <AdminSidebarPanel
          variant="desktop"
          branding={branding}
          schoolName={schoolName}
          slug={slug}
          pathname={pathname}
          navGroups={navGroups}
          isExpanded={isExpanded}
          counts={counts}
          unreadCount={unreadCount}
          userProfile={userProfile}
          onSignOut={onSignOut}
          onOpenSupport={onOpenSupport}
          onOpenNotifications={onOpenNotifications}
          portalOptions={portalOptions}
          openPortalLinksInNewTab={openPortalLinksInNewTab}
          previewMode={previewMode}
          fridayBranchParentPortalPaused={fridayBranchParentPortalPaused}
          onLockedFeature={onLockedFeature}
          plan={plan}
          searchFocusToken={searchFocusToken}
          onRequestSearch={onRequestSearch ?? onToggleExpand}
          onToggleExpand={onToggleExpand}
        />
      </aside>
    </ParentGardenScope>
  );
}
