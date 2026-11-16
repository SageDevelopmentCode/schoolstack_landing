"use client";

import { useEffect, useRef, type ComponentProps, type RefObject } from "react";
import Image from "next/image";
import { Bell, Menu } from "lucide-react";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { DEFAULT_BRANDING } from "@/lib/organization-settings/catalog";
import type { OrganizationPlan } from "@/lib/organization-settings/plans";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  MUDKITCHEN_LOGO_ALT,
  MUDKITCHEN_LOGO_PATH,
} from "@/lib/school-admin/newsletter/newsletter-branding";
import type { AdminNavCountBadge } from "@/lib/school-admin/admin-sidebar-nav";
import AdminSidebarPanel from "./AdminSidebarPanel";

/*
 * Phone layout (below md): a slim top bar with the menu button (with the
 * total of everything waiting), logo and bell, plus a slide-in drawer that holds
 * the same sidebar panel as desktop. The drawer traps focus, closes on
 * Escape / backdrop / route change, and gives focus back to the menu button.
 */

export const ADMIN_MOBILE_NAV_DRAWER_ID = "admin-mobile-nav-drawer";

const BAR_BTN = `relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/75 transition-colors hover:border-[var(--sf-ink)]/40 hover:text-[var(--sf-ink)] ${G_FOCUS} focus-visible:ring-offset-0`;

export function AdminMobileTopBar({
  branding,
  schoolName,
  plan,
  drawerOpen,
  onOpenDrawer,
  menuButtonRef,
  unreadCount,
  onOpenNotifications,
  waitingBadge,
}: {
  branding: OrganizationBranding;
  schoolName: string;
  plan: OrganizationPlan;
  drawerOpen: boolean;
  onOpenDrawer: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  unreadCount: number;
  onOpenNotifications: () => void;
  /** Total of every sidebar badge, shown on the menu button. */
  waitingBadge: AdminNavCountBadge | null;
}) {
  const { theme } = useSchoolAdminStoryTheme();
  const isFree = plan === "free";
  const storedLogoSrc = branding.logo.src.trim();
  const showMudKitchenLogo = isFree && (!storedLogoSrc || storedLogoSrc === DEFAULT_BRANDING.logo.src);
  const logoSrc = showMudKitchenLogo ? MUDKITCHEN_LOGO_PATH : storedLogoSrc;
  const logoAlt = showMudKitchenLogo ? MUDKITCHEN_LOGO_ALT : branding.logo.alt || schoolName;
  const notificationsLabel = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <ParentGardenScope theme={theme} className="relative z-[5] shrink-0 md:hidden">
      <div className="flex h-14 items-center gap-2 border-b-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3 shadow-[0_8px_24px_-22px_rgba(29,26,22,0.35)]">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onOpenDrawer}
          aria-label={waitingBadge ? `Open menu, ${waitingBadge.label}` : "Open menu"}
          aria-expanded={drawerOpen}
          aria-controls={ADMIN_MOBILE_NAV_DRAWER_ID}
          className={BAR_BTN}
        >
          <Menu className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden />
          {waitingBadge ? (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--sf-clay)] px-1 text-[10px] font-extrabold leading-none text-white tabular-nums ring-[1.5px] ring-[var(--sf-ink)] motion-safe:animate-[sf-admin-badge-in_260ms_cubic-bezier(0.34,1.56,0.64,1)]"
            >
              {waitingBadge.count > 99 ? "99+" : waitingBadge.count}
            </span>
          ) : null}
        </button>
        <div className="flex min-w-0 flex-1 items-center">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={showMudKitchenLogo ? 110 : (branding.logo.width ?? 140)}
              height={showMudKitchenLogo ? 32 : (branding.logo.height ?? 32)}
              className="min-w-0 shrink object-contain object-left"
              style={{ maxHeight: 32 }}
            />
          ) : (
            <span className="truncate text-[15px] font-extrabold text-[var(--sf-clay-deep)]">{logoAlt}</span>
          )}
        </div>
        <button type="button" onClick={onOpenNotifications} aria-label={notificationsLabel} className={BAR_BTN}>
          <Bell className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden />
          {unreadCount > 0 ? (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--sf-clay)] px-1 text-[10px] font-extrabold leading-none text-white tabular-nums ring-[1.5px] ring-[var(--sf-ink)]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </div>
    </ParentGardenScope>
  );
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type PanelProps = Omit<ComponentProps<typeof AdminSidebarPanel>, "variant" | "isExpanded" | "onClose" | "onToggleExpand" | "onRequestSearch">;

export function AdminMobileNavDrawer({
  open,
  onClose,
  returnFocusRef,
  focusSearch,
  ...panelProps
}: PanelProps & {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  /** Open straight into "Find a page" (⌘K on a phone-width window). */
  focusSearch: boolean;
}) {
  const { theme } = useSchoolAdminStoryTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const returnTo = returnFocusRef.current;
    if (!focusSearch) {
      queueMicrotask(() => panel?.querySelector<HTMLElement>("[data-drawer-close]")?.focus());
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (node) => node.offsetParent !== null && !node.closest("[inert]"),
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (returnTo && document.contains(returnTo) && returnTo.offsetParent !== null) {
        returnTo.focus();
      }
    };
  }, [focusSearch, open, returnFocusRef]);

  if (!open) return null;

  return (
    <ParentGardenScope theme={theme} className="fixed inset-0 z-[70] md:hidden">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[var(--sf-ink)]/40 motion-safe:animate-[sf-admin-flyout-in_160ms_ease-out]"
      />
      <div
        ref={panelRef}
        id={ADMIN_MOBILE_NAV_DRAWER_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Admin menu"
        className="absolute inset-y-0 left-0 flex w-[300px] max-w-[88vw] flex-col overflow-hidden border-r-[1.5px] border-[var(--sf-ink)] bg-white shadow-[6px_0_0_0_rgba(29,26,22,0.12)] motion-safe:animate-[sf-admin-drawer-in_220ms_cubic-bezier(0.22,1,0.36,1)]"
      >
        <AdminSidebarPanel
          {...panelProps}
          variant="drawer"
          isExpanded
          onClose={onClose}
          onRequestSearch={() => {}}
        />
      </div>
    </ParentGardenScope>
  );
}
