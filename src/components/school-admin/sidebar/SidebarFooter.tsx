"use client";

import Image from "next/image";
import { Bell, ExternalLink, LifeBuoy, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import SchoolAdminProfileMenu from "@/components/school-admin/SchoolAdminProfileMenu";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import GardenNavBadge from "@/components/school-parent/header/GardenNavBadge";
import {
  detectPortalFromPathname,
  type SchoolPortalOption,
} from "@/lib/auth/portal-switcher-types";
import { schoolMudKitchenPortalPath } from "@/lib/organization-settings/admin-routes";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { MUDKITCHEN_BRAND_GRADIENT, MUDKITCHEN_LOGO_BRAND as MK } from "@/lib/mudkitchen-portal/theme";
import type { SchoolAdminUserProfile } from "@/lib/school-admin/access";
import SidebarFlyout from "./SidebarFlyout";

function Tip({ label }: { label: string }) {
  return <div className="px-2.5 py-1.5 text-[13px] font-extrabold text-[var(--sf-ink)]">{label}</div>;
}

const ICON_BTN = `relative mx-auto flex h-10 w-10 items-center justify-center rounded-[12px] transition-colors ${G_FOCUS} focus-visible:ring-offset-0`;

export default function SidebarFooter({
  isExpanded,
  slug,
  pathname,
  C,
  unreadCount,
  onOpenNotifications,
  onOpenSupport,
  userProfile,
  onSignOut,
  portalOptions,
  openPortalLinksInNewTab,
  previewMode,
  onToggleExpand,
}: {
  isExpanded: boolean;
  slug: string;
  pathname: string;
  C: AdminThemeTokens;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenSupport: () => void;
  userProfile: SchoolAdminUserProfile | null;
  onSignOut: () => Promise<void>;
  portalOptions: SchoolPortalOption[];
  openPortalLinksInNewTab: boolean;
  previewMode: boolean;
  /** Desktop only; the phone drawer has its own close button. */
  onToggleExpand?: () => void;
}) {
  const notificationsLabel =
    unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <div className="mt-auto flex flex-col gap-2 border-t-[1.5px] border-[var(--sf-ink)]/[0.08] px-3 pb-3 pt-3">
      {isExpanded ? (
        <>
          <button
            type="button"
            onClick={onOpenNotifications}
            className={`flex w-full items-center gap-2.5 rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-2.5 py-2 text-left transition-[border-color,transform] hover:-translate-y-px hover:border-[var(--sf-ink)]/30 ${G_FOCUS} focus-visible:ring-offset-0`}
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[var(--sf-sky)] text-[#24507a]">
              <Bell className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-[var(--sf-ink)]">Notifications</span>
            <GardenNavBadge count={unreadCount} label={`${unreadCount} unread`} />
          </button>
          <button
            type="button"
            onClick={onOpenSupport}
            className={`flex w-full items-center gap-2.5 rounded-[12px] bg-[var(--sf-butter)] px-2.5 py-2 text-left transition-transform hover:-translate-y-px ${G_FOCUS} focus-visible:ring-offset-0`}
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-white/70 text-[#7a5a12]">
              <LifeBuoy className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-extrabold text-[var(--sf-ink)]">Need help?</span>
              <span className="block truncate text-[11.5px] font-semibold text-[var(--sf-ink)]/60">
                Message us or read a guide
              </span>
            </span>
          </button>
        </>
      ) : (
        <>
          <SidebarFlyout enabled panel={<Tip label={notificationsLabel} />}>
            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label={notificationsLabel}
              className={`${ICON_BTN} bg-[var(--sf-sky)] text-[#24507a] hover:brightness-95`}
            >
              <Bell className="h-4 w-4" strokeWidth={2.4} aria-hidden />
              {unreadCount > 0 ? (
                <span
                  aria-hidden
                  className="absolute -right-1 -top-1 inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--sf-clay)] px-1 text-[9px] font-extrabold leading-none text-white tabular-nums ring-[1.5px] ring-white"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>
          </SidebarFlyout>
          <SidebarFlyout enabled panel={<Tip label="Need help?" />}>
            <button
              type="button"
              onClick={onOpenSupport}
              aria-label="Need help?"
              className={`${ICON_BTN} bg-[var(--sf-butter)] text-[#7a5a12] hover:brightness-95`}
            >
              <LifeBuoy className="h-4 w-4" strokeWidth={2.4} aria-hidden />
            </button>
          </SidebarFlyout>
        </>
      )}

      <SidebarFlyout enabled={!isExpanded} panel={<Tip label="MudKitchen Account" />}>
        <a
          href={schoolMudKitchenPortalPath(slug)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={isExpanded ? undefined : "MudKitchen Account (opens in a new tab)"}
          className={`group relative flex w-full items-center gap-2.5 overflow-hidden rounded-[14px] transition-[filter,transform] duration-150 hover:-translate-y-px hover:brightness-110 active:scale-[0.98] ${G_FOCUS} focus-visible:ring-offset-0 ${
            isExpanded ? "p-2" : "justify-center p-1.5"
          }`}
          style={{ background: MUDKITCHEN_BRAND_GRADIENT, color: MK.cream, textDecoration: "none" }}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
            <Image src="/images/Logo.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" aria-hidden />
          </span>
          {isExpanded ? (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-extrabold">MudKitchen Account</span>
                <span className="block truncate text-[11px] font-semibold opacity-85">
                  View your requests, logs, and more
                </span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </>
          ) : null}
        </a>
      </SidebarFlyout>

      {userProfile ? (
        <div className="[&>div]:mb-0">
          <SchoolAdminProfileMenu
            C={C}
            userProfile={userProfile}
            isExpanded={isExpanded}
            onSignOut={onSignOut}
            portalOptions={portalOptions}
            openPortalLinksInNewTab={openPortalLinksInNewTab}
            currentPortal={detectPortalFromPathname(pathname, slug)}
            previewMode={previewMode}
          />
        </div>
      ) : null}

      {onToggleExpand ? (
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          className={`flex items-center rounded-[10px] py-1.5 text-[var(--sf-ink)]/50 transition-colors hover:bg-[var(--sf-ink)]/[0.05] hover:text-[var(--sf-ink)] ${G_FOCUS} focus-visible:ring-offset-0 ${
            isExpanded ? "gap-2 px-2" : "mx-auto justify-center px-2"
          }`}
        >
          {isExpanded ? (
            <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <PanelLeftOpen className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {isExpanded ? <span className="text-[12.5px] font-bold">Collapse</span> : null}
        </button>
      ) : null}
    </div>
  );
}
