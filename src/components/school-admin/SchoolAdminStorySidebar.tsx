"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { outlineActiveRowStyle } from "@/components/school-admin/admissions/outline-item-styles";
import SchoolAdminProfileMenu from "@/components/school-admin/SchoolAdminProfileMenu";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { MessagesNavBadge } from "@/components/messages/MessagesNavBadge";
import {
  buildAdminNavGroups,
  type AdminNavItem,
} from "@/lib/organization-settings/admin-nav";
import { schoolAdminPath, schoolMudKitchenPortalPath } from "@/lib/organization-settings/admin-routes";
import { MUDKITCHEN_LOGO_BRAND as MK } from "@/lib/mudkitchen-portal/theme";
import {
  detectPortalFromPathname,
  type SchoolPortalOption,
} from "@/lib/auth/portal-switcher-types";
import type { SchoolAdminUserProfile } from "@/lib/school-admin/access";
import { getAdminNavIconColor } from "@/lib/organization-settings/admin-feature-icon-styles";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

function formatNavGroupLabel(label: string): string {
  if (label === "Main") return "Workspace";
  if (label === "Tools") return "Manage";
  return label;
}

function formatUnreadBadgeCount(count: number): string {
  if (count <= 0) return "";
  if (count > 9) return "9+";
  return String(count);
}

function isParentPathActive(
  pathname: string,
  slug: string,
  parentKey: string,
): boolean {
  const prefix = `/school/${slug}/admin/${parentKey}`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function SidebarNavItem({
  slug,
  item,
  pathname,
  isExpanded,
  isOpen,
  onToggleOpen,
  messagesUnreadCount,
}: {
  slug: string;
  item: AdminNavItem;
  pathname: string;
  isExpanded: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  messagesUnreadCount: number;
}) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const Icon = item.icon;
  const iconColor = getAdminNavIconColor(item.key);
  const hasChildren = Boolean(item.children?.length);
  const parentActive = isParentPathActive(pathname, slug, item.key);
  const firstChild = item.children?.[0];
  const parentHref = hasChildren
    ? schoolAdminPath(slug, item.key, firstChild!.key)
    : schoolAdminPath(slug, item.key);

  const activeRowStyle = (active: boolean) => ({
    ...outlineActiveRowStyle(active, theme),
    color: active ? theme.primary : C.textSecondary,
    textDecoration: "none" as const,
  });

  if (!hasChildren) {
    const active = pathname === parentHref;
    return (
      <Link
        href={parentHref}
        title={item.name}
        className="relative mb-0.5 flex w-full items-center rounded-[10px] border px-2.5 py-2 text-[13px] transition-colors"
        style={{
          justifyContent: isExpanded ? "flex-start" : "center",
          gap: isExpanded ? "8px" : 0,
          ...activeRowStyle(active),
          fontWeight: active ? 700 : 500,
        }}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color: iconColor }} />
        {isExpanded ? (
          <span className="flex min-w-0 flex-1 items-center gap-1 truncate">
            {item.name}
            {item.key === "messages" ? (
              <MessagesNavBadge
                count={messagesUnreadCount}
                theme={{ accent: theme.primary, accentLight: theme.primarySoft }}
              />
            ) : null}
          </span>
        ) : null}
        {!isExpanded && item.key === "messages" && messagesUnreadCount > 0 ? (
          <span
            className="absolute right-1 top-1 h-2 w-2 rounded-full"
            style={{ backgroundColor: theme.primary }}
            aria-hidden
          />
        ) : null}
      </Link>
    );
  }

  return (
    <div className="mb-0.5">
      <div
        className="flex items-center rounded-[10px] border transition-colors"
        style={activeRowStyle(parentActive)}
      >
        <Link
          href={parentHref}
          title={item.name}
          className="flex min-w-0 flex-1 items-center"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "8px" : 0,
            padding: isExpanded ? "8px 10px" : "8px 0",
            color: parentActive ? theme.primary : C.textSecondary,
            textDecoration: "none",
            fontWeight: parentActive ? 700 : 500,
            fontSize: "13px",
          }}
        >
          <Icon className="h-4 w-4 shrink-0" style={{ color: iconColor }} />
          {isExpanded ? <span className="truncate">{item.name}</span> : null}
        </Link>
        {isExpanded ? (
          <button
            type="button"
            onClick={onToggleOpen}
            className="mr-1 shrink-0 p-1"
            style={{ color: parentActive ? theme.primary : C.textTertiary }}
            aria-label={isOpen ? "Collapse sub-tabs" : "Expand sub-tabs"}
          >
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform duration-150"
              style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
        ) : null}
      </div>
      {isExpanded ? (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-150 ease-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div
              className="ml-[25px] border-l pl-[7px]"
              style={{ borderColor: "#DFE7DF" }}
            >
              {item.children!.map((child) => {
                const childHref = schoolAdminPath(slug, item.key, child.key);
                const childActive = pathname === childHref;
                return (
                  <Link
                    key={child.key}
                    href={childHref}
                    title={child.name}
                    className="block py-[5px] text-[11px] transition-colors"
                    style={{
                      color: childActive ? theme.primary : "#7B898D",
                      fontWeight: childActive ? 700 : 500,
                      textDecoration: "none",
                    }}
                  >
                    {child.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

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
  portalOptions?: SchoolPortalOption[];
  previewMode?: boolean;
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
  portalOptions = [],
  previewMode = false,
}: SchoolAdminStorySidebarProps) {
  const pathname = usePathname();
  const { theme, C } = useSchoolAdminStoryTheme();
  const { logo } = branding;
  const [openParents, setOpenParents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const group of navGroups) {
      for (const item of group.items) {
        if (
          item.children?.length &&
          isParentPathActive(pathname, slug, item.key)
        ) {
          next[item.key] = true;
        }
      }
    }
    queueMicrotask(() => {
      setOpenParents((prev) => ({ ...prev, ...next }));
    });
  }, [pathname, slug, navGroups]);

  return (
    <aside
      className="relative z-[1] flex h-full shrink-0 flex-col overflow-hidden border-r bg-white transition-[width] duration-200 ease-in-out"
      style={{
        width: isExpanded ? 185 : 52,
        borderColor: "#DDE6DE",
      }}
    >
      <div
        className="flex items-center overflow-hidden"
        style={{
          padding: isExpanded ? "14px 16px" : "14px 0",
          justifyContent: isExpanded ? "flex-start" : "center",
        }}
      >
        {logo.src.trim() ? (
          <Image
            src={logo.src.trim()}
            alt={logo.alt || schoolName}
            width={isExpanded ? (logo.width ?? 160) : 36}
            height={logo.height ?? 40}
            className="shrink-0 object-contain"
            style={{ maxHeight: 40 }}
          />
        ) : (
          <span
            className="truncate text-sm font-semibold"
            style={{ color: C.accentDark }}
            title={schoolName}
          >
            {logo.alt.trim() || schoolName}
          </span>
        )}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            {isExpanded ? (
              <p
                className="mb-1.5 px-2 text-[10px] font-extrabold uppercase tracking-[0.11em]"
                style={{ color: "#98A39F" }}
              >
                {formatNavGroupLabel(group.label)}
              </p>
            ) : group.label !== "Main" ? (
              <div
                className="mx-1.5 mb-2 h-px"
                style={{ backgroundColor: C.border }}
              />
            ) : null}
            <div>
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.key}
                  slug={slug}
                  item={item}
                  pathname={pathname}
                  isExpanded={isExpanded}
                  isOpen={openParents[item.key] ?? false}
                  messagesUnreadCount={messagesUnreadCount}
                  onToggleOpen={() =>
                    setOpenParents((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t px-3 py-3" style={{ borderColor: "#DDE6DE" }}>
        {isExpanded ? (
          <button
            type="button"
            onClick={onOpenNotifications}
            className="mb-2 flex w-full items-center gap-2 rounded-[10px] border px-2.5 py-2 text-left text-xs"
            style={{ borderColor: "#DCE6DD", color: C.textSecondary }}
          >
            <Bell className="h-4 w-4 shrink-0" />
            <span className="flex-1 font-medium">Notifications</span>
            {unreadCount > 0 ? (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
              >
                {formatUnreadBadgeCount(unreadCount)}
              </span>
            ) : null}
          </button>
        ) : null}

        {isExpanded ? (
          <button
            type="button"
            onClick={onOpenSupport}
            className="mb-2 w-full rounded-[10px] border px-3 py-[11px] text-left text-xs"
            style={{
              borderColor: "#EEE0B3",
              backgroundColor: "#FFF9E9",
              color: "#75633E",
            }}
          >
            🌿 Need help?
          </button>
        ) : null}

        <a
          href={schoolMudKitchenPortalPath(slug)}
          target="_blank"
          rel="noopener noreferrer"
          title="MudKitchen Account"
          className="relative mb-2 flex w-full flex-col transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
          style={{
            alignItems: isExpanded ? "flex-start" : "center",
            padding: isExpanded ? "8px" : "8px 6px",
            borderRadius: C.r.sm,
            background: `linear-gradient(135deg, ${MK.terracottaDark} 0%, ${MK.terracotta} 45%, ${MK.terracottaBright} 75%, ${MK.wood} 100%)`,
            color: MK.cream,
            textDecoration: "none",
          }}
        >
          {isExpanded ? (
            <ExternalLink className="absolute right-2 top-2 h-3 w-3 opacity-80" aria-hidden />
          ) : null}
          <span
            className={`mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ${
              isExpanded ? "" : "mx-auto"
            }`}
          >
            <Image src="/images/Logo.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" aria-hidden />
          </span>
          {isExpanded ? (
            <div>
              <span className="block text-xs font-semibold">MudKitchen Account</span>
              <span className="mt-0.5 block text-[10px] opacity-85">
                View your requests, logs, and more
              </span>
            </div>
          ) : null}
        </a>

        {userProfile ? (
          <SchoolAdminProfileMenu
            C={C}
            userProfile={userProfile}
            isExpanded={isExpanded}
            onSignOut={onSignOut}
            portalOptions={portalOptions}
            currentPortal={detectPortalFromPathname(pathname, slug)}
            previewMode={previewMode}
          />
        ) : null}

        <button
          type="button"
          onClick={onToggleExpand}
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          className="mt-2 flex w-full items-center border-0 bg-transparent"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "8px" : 0,
            padding: "6px 8px",
            borderRadius: C.r.sm,
            color: C.textTertiary,
            cursor: "pointer",
          }}
        >
          {isExpanded ? (
            <PanelLeftClose className="h-4 w-4 shrink-0" />
          ) : (
            <PanelLeftOpen className="h-4 w-4 shrink-0" />
          )}
          {isExpanded ? <span className="text-xs font-medium">Collapse</span> : null}
        </button>
      </div>
    </aside>
  );
}
