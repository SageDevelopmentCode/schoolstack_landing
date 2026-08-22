"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  buildAdminNavGroups,
  type AdminNavItem,
} from "@/lib/organization-settings/admin-nav";
import { schoolAdminPath, schoolMudKitchenPortalPath, isAdminMessagesPath } from "@/lib/organization-settings/admin-routes";
import { MUDKITCHEN_LOGO_BRAND as MK } from "@/lib/mudkitchen-portal/theme";
import {
  schoolAdminLoginPath,
  type SchoolAdminUserProfile,
} from "@/lib/school-admin/access";
import {
  detectPortalFromPathname,
  type SchoolPortalOption,
} from "@/lib/auth/portal-switcher-types";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";
import AdminPageContentShell from "@/components/school-admin/AdminPageContentShell";
import { MessagesNavBadge } from "@/components/messages/MessagesNavBadge";
import { useMessagesUnreadCount } from "@/lib/messages/use-messages-unread-count";
import { MessagesRefreshProvider } from "@/lib/messages/messages-refresh-context";
import SchoolAdminProfileMenu from "@/components/school-admin/SchoolAdminProfileMenu";
import NavigationLoadingProvider from "@/components/school/shared/NavigationLoadingProvider";

const AdminSupportRequestModal = dynamic(
  () => import("@/components/school-admin/AdminSupportRequestModal"),
  { ssr: false },
);
const AdminToaster = dynamic(
  () => import("@/components/school-admin/AdminToaster"),
  { ssr: false },
);
const AdminActivityNotificationsPanel = dynamic(
  () => import("@/components/school-admin/AdminActivityNotificationsPanel"),
  { ssr: false },
);

function formatUnreadBadgeCount(count: number): string {
  if (count <= 0) return "";
  if (count > 9) return "9+";
  return String(count);
}

type SchoolAdminBaselineProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: SchoolAdminUserProfile | null;
  portalOptions?: SchoolPortalOption[];
  previewMode?: boolean;
  children: ReactNode;
};

function isParentPathActive(
  pathname: string,
  slug: string,
  parentKey: string,
): boolean {
  const prefix = `/school/${slug}/admin/${parentKey}`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function SidebarNavItem({
  C,
  slug,
  item,
  pathname,
  isExpanded,
  isOpen,
  onToggleOpen,
  messagesUnreadCount,
}: {
  C: AdminThemeTokens;
  slug: string;
  item: AdminNavItem;
  pathname: string;
  isExpanded: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  messagesUnreadCount: number;
}) {
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);
  const parentActive = isParentPathActive(pathname, slug, item.key);
  const firstChild = item.children?.[0];
  const parentHref = hasChildren
    ? schoolAdminPath(slug, item.key, firstChild!.key)
    : schoolAdminPath(slug, item.key);

  if (!hasChildren) {
    const active = pathname === parentHref;
    return (
      <Link
        href={parentHref}
        title={item.name}
        className="relative w-full flex items-center transition-colors duration-150"
        style={{
          justifyContent: isExpanded ? "flex-start" : "center",
          gap: isExpanded ? "8px" : 0,
          padding: isExpanded ? "7px 10px" : "7px 0",
          borderRadius: C.r.sm,
          backgroundColor: active ? C.accentLight : "transparent",
          border: active
            ? `1px solid ${C.secondaryBtnBorder}`
            : "1px solid transparent",
          color: active ? C.accent : C.textSecondary,
          textDecoration: "none",
        }}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {isExpanded && (
          <span className="text-sm font-medium truncate flex items-center gap-1">
            {item.name}
            {item.key === "messages" ? (
              <MessagesNavBadge
                count={messagesUnreadCount}
                theme={{ accent: C.accent, accentLight: C.accentLight }}
              />
            ) : null}
          </span>
        )}
        {!isExpanded && item.key === "messages" && messagesUnreadCount > 0 ? (
          <span
            className="absolute top-1 right-1 h-2 w-2 rounded-full"
            style={{ backgroundColor: C.accent }}
            aria-hidden
          />
        ) : null}
      </Link>
    );
  }

  return (
    <div>
      <div
        className="flex items-center transition-colors duration-150"
        style={{
          borderRadius: C.r.sm,
          backgroundColor: parentActive ? C.accentLight : "transparent",
          border: parentActive
            ? `1px solid ${C.secondaryBtnBorder}`
            : "1px solid transparent",
        }}
      >
        <Link
          href={parentHref}
          title={item.name}
          className="flex flex-1 items-center min-w-0 transition-colors duration-150"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "8px" : 0,
            padding: isExpanded ? "7px 10px" : "7px 0",
            color: parentActive ? C.accent : C.textSecondary,
            textDecoration: "none",
          }}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {isExpanded && (
            <span className="text-sm font-medium truncate">{item.name}</span>
          )}
        </Link>
        {isExpanded ? (
          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1 mr-1 shrink-0"
            style={{ color: parentActive ? C.accent : C.textTertiary }}
            aria-label={isOpen ? "Collapse sub-tabs" : "Expand sub-tabs"}
          >
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-150"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
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
            <div className="flex gap-1 pt-0.5 pb-1">
              <div
                className="w-px ml-4 shrink-0"
                style={{ backgroundColor: C.border }}
              />
              <div className="flex-1 space-y-0.5">
                {item.children!.map((child) => {
                  const childHref = schoolAdminPath(slug, item.key, child.key);
                  const childActive = pathname === childHref;
                  const ChildIcon = child.icon;
                  return (
                    <Link
                      key={child.key}
                      href={childHref}
                      title={child.name}
                      className="w-full flex items-center gap-2 text-left text-xs font-medium transition-colors duration-150"
                      style={{
                        padding: "5px 8px",
                        borderRadius: C.r.sm,
                        backgroundColor: childActive
                          ? C.accentLight
                          : "transparent",
                        color: childActive ? C.accent : C.textTertiary,
                        textDecoration: "none",
                      }}
                    >
                      <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{child.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Sidebar({
  C,
  branding,
  schoolName,
  slug,
  navGroups,
  pathname,
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
}: {
  C: AdminThemeTokens;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  navGroups: ReturnType<typeof buildAdminNavGroups>;
  pathname: string;
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
}) {
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
      className="flex flex-col h-full flex-shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out"
      style={{
        width: isExpanded ? 185 : 52,
        backgroundColor: C.surface,
        borderRight: `1px solid ${C.border}`,
        zIndex: 1,
        position: "relative",
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
            className="flex-shrink-0 object-contain"
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

      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: isExpanded ? "0 10px 10px" : "0 6px 10px",
        }}
      >
        <button
          type="button"
          title="Need help?"
          onClick={onOpenSupport}
          className="w-full flex items-center transition-colors duration-150"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "8px" : 0,
            padding: "6px 8px",
            borderRadius: C.r.sm,
            border: `1px solid ${C.clayBorder}`,
            backgroundColor: C.clayBg,
            color: C.textSecondary,
            cursor: "pointer",
          }}
        >
          <Image
            src="/images/Logo.png"
            alt=""
            width={20}
            height={20}
            className="w-5 h-5 flex-shrink-0 object-contain"
            aria-hidden
          />
          {isExpanded && (
            <span className="text-sm font-medium">Need help?</span>
          )}
        </button>
        <button
          type="button"
          title={
            unreadCount > 0
              ? `Notifications (${unreadCount} unread)`
              : "Notifications"
          }
          onClick={onOpenNotifications}
          className="mt-1.5 w-full flex items-center transition-colors duration-150"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "8px" : 0,
            padding: "6px 8px",
            borderRadius: C.r.sm,
            border: `1px solid ${C.border}`,
            backgroundColor: "transparent",
            color: C.textSecondary,
            cursor: "pointer",
          }}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="w-4 h-4 flex-shrink-0" />
          {isExpanded && (
            <>
              <span className="min-w-0 flex-1 text-left text-sm font-medium">
                Notifications
              </span>
              {unreadCount > 0 ? (
                <span
                  className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                  style={{
                    backgroundColor: C.accentLight,
                    color: C.accent,
                  }}
                  aria-hidden
                >
                  {formatUnreadBadgeCount(unreadCount)}
                </span>
              ) : null}
            </>
          )}
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto space-y-5"
        style={{ padding: isExpanded ? "16px 12px" : "16px 6px" }}
      >
        {navGroups.map((group) => (
          <div key={group.label}>
            {isExpanded && (
              <div
                className="text-xs font-medium px-3 mb-1.5"
                style={{ color: C.textQuaternary }}
              >
                {group.label}
              </div>
            )}
            {!isExpanded && group.label !== "Main" && (
              <div
                style={{
                  height: "1px",
                  backgroundColor: C.border,
                  margin: "0 6px 8px",
                }}
              />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.key}
                  C={C}
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

      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: isExpanded ? "10px 12px" : "10px 6px",
        }}
      >
        <a
          href={schoolMudKitchenPortalPath(slug)}
          target="_blank"
          rel="noopener noreferrer"
          title="MudKitchen Account"
          className="relative mb-2 w-full flex flex-col transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
          style={{
            alignItems: isExpanded ? "flex-start" : "center",
            padding: isExpanded ? "8px" : "8px 6px",
            borderRadius: C.r.sm,
            background: `linear-gradient(135deg, ${MK.terracottaDark} 0%, ${MK.terracotta} 45%, ${MK.terracottaBright} 75%, ${MK.wood} 100%)`,
            border: "none",
            boxShadow: `0 2px 10px rgba(194, 105, 79, 0.32)`,
            color: MK.cream,
            textDecoration: "none",
          }}
        >
          {isExpanded && (
            <ExternalLink
              className="absolute right-2 top-2 h-3 w-3 shrink-0 opacity-80"
              aria-hidden
            />
          )}
          <span
            className={`flex shrink-0 items-center justify-center rounded-full bg-white p-0 ${
              isExpanded ? "mb-1 h-8 w-8" : "h-7 w-7"
            }`}
          >
            <Image
              src="/images/Logo.png"
              alt=""
              width={isExpanded ? 24 : 20}
              height={isExpanded ? 24 : 20}
              className={`object-contain ${isExpanded ? "h-6 w-6" : "h-5 w-5"}`}
              aria-hidden
            />
          </span>
          {isExpanded && (
            <div className="w-full">
              <span className="block text-xs font-semibold leading-tight">
                MudKitchen Account
              </span>
              <span className="mt-0.5 block text-[10px] leading-snug opacity-85">
                View your requests, logs, and more
              </span>
            </div>
          )}
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
          className="w-full flex items-center transition-colors duration-150"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "8px" : 0,
            padding: "6px 8px",
            borderRadius: C.r.sm,
            color: C.textTertiary,
            cursor: "pointer",
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          {isExpanded ? (
            <PanelLeftClose className="w-4 h-4 flex-shrink-0" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 flex-shrink-0" />
          )}
          {isExpanded && (
            <span className="text-xs font-medium">Collapse</span>
          )}
        </button>
      </div>
    </aside>
  );
}

export default function SchoolAdminBaseline({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  portalOptions = [],
  previewMode = false,
  children,
}: SchoolAdminBaselineProps) {
  const pathname = usePathname();
  const isMessagesPage = isAdminMessagesPath(pathname);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const navGroups = useMemo(
    () =>
      buildAdminNavGroups(
        features.admin,
        features.feature_nav?.admin,
      ),
    [features.admin, features.feature_nav?.admin],
  );

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastUnreadFetchRef = useRef(0);
  const FOCUS_REFETCH_MS = 60_000;
  const messagesEnabled = Boolean(features.admin.messages);
  const { unreadCount: messagesUnreadCount } = useMessagesUnreadCount(
    "/api/school-admin/messages",
    organizationId,
    schoolName,
    messagesEnabled && !previewMode,
  );

  const fetchUnreadCount = useCallback(async () => {
    try {
      const params = new URLSearchParams({ organizationId });
      const response = await fetch(
        `/api/school-admin/activity-notifications/unread-count?${params.toString()}`,
      );
      if (!response.ok) return;

      const payload = (await response.json()) as { unreadCount?: number };
      setUnreadCount(payload.unreadCount ?? 0);
      lastUnreadFetchRef.current = Date.now();
    } catch {
      // ignore transient fetch errors
    }
  }, [organizationId]);

  useEffect(() => {
    if (previewMode) return;
    queueMicrotask(() => {
      void fetchUnreadCount();
    });
  }, [fetchUnreadCount, previewMode]);

  useEffect(() => {
    if (previewMode) return;
    const handleFocus = () => {
      if (Date.now() - lastUnreadFetchRef.current < FOCUS_REFETCH_MS) return;
      void fetchUnreadCount();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchUnreadCount, previewMode]);

  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  const bodyFont =
    branding.typography.bodyFont?.trim() || "Inter, system-ui, sans-serif";

  const handleSignOut = async () => {
    if (previewMode) {
      router.push("/admin/organizations");
      return;
    }
    await supabase.auth.signOut();
    router.push(schoolAdminLoginPath(slug));
    router.refresh();
  };

  return (
    <MessagesRefreshProvider
      organizationId={organizationId}
      enabled={messagesEnabled && !previewMode}
    >
    <NavigationLoadingProvider>
    <div
      className="flex h-dvh w-full overflow-hidden"
      style={{ backgroundColor: C.bg, fontFamily: bodyFont }}
    >
      <Sidebar
        C={C}
        branding={branding}
        schoolName={schoolName}
        slug={slug}
        navGroups={navGroups}
        pathname={pathname}
        isExpanded={sidebarExpanded}
        onToggleExpand={() => setSidebarExpanded((v) => !v)}
        userProfile={userProfile}
        onSignOut={handleSignOut}
        portalOptions={portalOptions}
        previewMode={previewMode}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        unreadCount={unreadCount}
        messagesUnreadCount={messagesUnreadCount}
      />

      {supportOpen ? (
        <AdminSupportRequestModal
          C={C}
          open={supportOpen}
          onClose={() => setSupportOpen(false)}
          organizationId={organizationId}
          userEmail={userProfile?.email ?? null}
          currentPath={pathname}
          documentationHref={`/school/${slug}/admin/documentation`}
        />
      ) : null}

      {notificationsOpen ? (
        <AdminActivityNotificationsPanel
          C={C}
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          organizationId={organizationId}
          onMarkedRead={() => setUnreadCount(0)}
        />
      ) : null}

      <AdminToaster C={C} />

      <main className="flex-1 overflow-hidden">
        <div
          className={`relative h-full ${
            isMessagesPage ? "overflow-hidden" : "overflow-y-auto"
          }`}
        >
          <AdminPageContentShell>{children}</AdminPageContentShell>
        </div>
      </main>
    </div>
    </NavigationLoadingProvider>
    </MessagesRefreshProvider>
  );
}
