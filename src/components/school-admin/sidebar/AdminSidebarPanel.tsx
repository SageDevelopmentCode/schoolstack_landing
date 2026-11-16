"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import Image from "next/image";
import { LayoutGroup } from "framer-motion";
import { X } from "lucide-react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import { adminNavItemMatchesPath } from "@/lib/organization-settings/admin-nav";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import { DEFAULT_BRANDING } from "@/lib/organization-settings/catalog";
import type { OrganizationPlan } from "@/lib/organization-settings/plans";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  flattenAdminNavForSearch,
  isAdminChildPathActive,
  type AdminNavGroup,
  type AdminSidebarCounts,
} from "@/lib/school-admin/admin-sidebar-nav";
import type { SchoolAdminUserProfile } from "@/lib/school-admin/access";
import {
  MUDKITCHEN_LOGO_ALT,
  MUDKITCHEN_LOGO_PATH,
} from "@/lib/school-admin/newsletter/newsletter-branding";
import SidebarFooter from "./SidebarFooter";
import SidebarNav, { SidebarHomeLink } from "./SidebarNav";
import { SidebarSearchField, SidebarSearchResults, useSidebarSearch } from "./SidebarSearch";
import { isPlainLeftClick, SidebarNavProvider, type SidebarNavContextValue } from "./sidebar-context";

export type AdminSidebarPanelProps = {
  variant: "desktop" | "drawer";
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  pathname: string;
  navGroups: AdminNavGroup[];
  isExpanded: boolean;
  counts: AdminSidebarCounts;
  unreadCount: number;
  userProfile: SchoolAdminUserProfile | null;
  onSignOut: () => Promise<void>;
  onOpenSupport: () => void;
  onOpenNotifications: () => void;
  portalOptions: SchoolPortalOption[];
  openPortalLinksInNewTab: boolean;
  previewMode: boolean;
  fridayBranchParentPortalPaused: boolean;
  onLockedFeature?: (label: string) => void;
  plan: OrganizationPlan;
  searchFocusToken: number;
  /** Collapsed search icon: expand the sidebar, then focus the input. */
  onRequestSearch: () => void;
  onToggleExpand?: () => void;
  onClose?: () => void;
};

const PENDING_TIMEOUT_MS = 10_000;

export default function AdminSidebarPanel({
  variant,
  branding,
  schoolName,
  slug,
  pathname,
  navGroups,
  isExpanded,
  counts,
  unreadCount,
  userProfile,
  onSignOut,
  onOpenSupport,
  onOpenNotifications,
  portalOptions,
  openPortalLinksInNewTab,
  previewMode,
  fridayBranchParentPortalPaused,
  onLockedFeature,
  plan,
  searchFocusToken,
  onRequestSearch,
  onToggleExpand,
  onClose,
}: AdminSidebarPanelProps) {
  const { C } = useSchoolAdminStoryTheme();
  const isFree = plan === "free";
  const lockedMode = Boolean(onLockedFeature);

  /* Logo (unchanged rules: MudKitchen logo for free schools without one). */
  const { logo } = branding;
  const storedLogoSrc = logo.src.trim();
  const showMudKitchenLogo = isFree && (!storedLogoSrc || storedLogoSrc === DEFAULT_BRANDING.logo.src);
  const logoSrc = showMudKitchenLogo ? MUDKITCHEN_LOGO_PATH : storedLogoSrc;
  const logoAlt = showMudKitchenLogo ? MUDKITCHEN_LOGO_ALT : logo.alt || schoolName;
  const logoTitle = isFree ? (showMudKitchenLogo ? "MudKitchen, Free" : `${schoolName}, Free`) : logoAlt;

  /* Open groups: the active group opens itself; the admin can toggle any. */
  const [openParents, setOpenParents] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.children?.length && adminNavItemMatchesPath(slug, pathname, item)) {
          next[item.key] = true;
          for (const child of item.children) {
            if (child.children?.length && isAdminChildPathActive(slug, pathname, item.key, child)) {
              next[`${item.key}:${child.key}`] = true;
            }
          }
        }
      }
    }
    queueMicrotask(() => {
      setOpenParents((prev) => ({ ...prev, ...next }));
    });
  }, [pathname, slug, navGroups]);
  const toggleOpen = useCallback((key: string) => {
    setOpenParents((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  /* Loading cue: the clicked link spins until its page opens. */
  const [pending, setPending] = useState<{ href: string; from: string } | null>(null);
  const pendingHref = pending && pending.from === pathname ? pending.href : null;
  useEffect(() => {
    if (!pendingHref) return;
    const timer = window.setTimeout(() => setPending(null), PENDING_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [pendingHref]);
  const markPending = useCallback(
    (href: string) => {
      if (href === pathname) return;
      setPending({ href, from: pathname });
    },
    [pathname],
  );
  const onLinkClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!isPlainLeftClick(event)) return;
      markPending(href);
    },
    [markPending],
  );

  const navContext = useMemo<SidebarNavContextValue>(
    () => ({
      slug,
      pathname,
      isExpanded,
      counts,
      lockedMode,
      onLockedSelect: onLockedFeature,
      fridayBranchParentPortalPaused,
      openParents,
      toggleOpen,
      pendingHref,
      onLinkClick,
      markPending,
      pillLayoutId: `admin-sidebar-pill-${variant}`,
    }),
    [
      slug,
      pathname,
      isExpanded,
      counts,
      lockedMode,
      onLockedFeature,
      fridayBranchParentPortalPaused,
      openParents,
      toggleOpen,
      pendingHref,
      onLinkClick,
      markPending,
      variant,
    ],
  );

  const searchEntries = useMemo(
    () => flattenAdminNavForSearch(slug, navGroups, { lockedMode, includeHome: isFree, counts }),
    [slug, navGroups, lockedMode, isFree, counts],
  );
  const search = useSidebarSearch(searchEntries);
  const showResults = isExpanded && search.active;

  return (
    <SidebarNavProvider value={navContext}>
      <div
        className={`flex shrink-0 items-center ${
          isExpanded ? "gap-2 px-4 pb-2 pt-4" : "justify-center px-2 pb-2 pt-4"
        } ${isExpanded && isFree ? "flex-wrap" : ""}`}
      >
        <div className={`flex min-w-0 items-center gap-2 ${isExpanded ? "flex-1" : ""}`}>
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={logoAlt}
              title={logoTitle}
              width={isExpanded ? (showMudKitchenLogo ? 132 : (logo.width ?? 160)) : 36}
              height={showMudKitchenLogo ? 40 : (logo.height ?? 40)}
              className="min-w-0 shrink object-contain object-left"
              style={{ maxHeight: 40 }}
            />
          ) : (
            <span className="truncate text-sm font-extrabold text-[var(--sf-clay-deep)]" title={logoTitle}>
              {logoAlt}
            </span>
          )}
          {isFree && isExpanded ? (
            <span className="shrink-0 rounded-full bg-[var(--sf-peach)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--sf-ink)]">
              Free
            </span>
          ) : null}
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            data-drawer-close=""
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/70 hover:border-[var(--sf-ink)]/40 hover:text-[var(--sf-ink)] ${G_FOCUS} focus-visible:ring-offset-0`}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className={`shrink-0 pb-2 ${isExpanded ? "px-3" : "px-2"}`}>
        <SidebarSearchField search={search} focusToken={searchFocusToken} onCollapsedSearch={onRequestSearch} />
      </div>

      <nav
        aria-label="Admin"
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3 pt-2 [scrollbar-width:thin] ${
          isExpanded ? "px-3" : "px-2"
        }`}
      >
        {showResults ? (
          <SidebarSearchResults search={search} />
        ) : (
          <LayoutGroup id={`admin-sidebar-${variant}`}>
            {isFree ? <SidebarHomeLink /> : null}
            <SidebarNav navGroups={navGroups} />
          </LayoutGroup>
        )}
      </nav>

      <SidebarFooter
        isExpanded={isExpanded}
        slug={slug}
        pathname={pathname}
        C={C}
        unreadCount={unreadCount}
        onOpenNotifications={onOpenNotifications}
        onOpenSupport={onOpenSupport}
        userProfile={userProfile}
        onSignOut={onSignOut}
        portalOptions={portalOptions}
        openPortalLinksInNewTab={openPortalLinksInNewTab}
        previewMode={previewMode}
        onToggleExpand={onToggleExpand}
      />
    </SidebarNavProvider>
  );
}
