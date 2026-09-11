"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import SchoolTeacherHeader from "@/components/school-teacher/SchoolTeacherHeader";
import ParentToaster from "@/components/school-parent/ParentToaster";
import {
  ParentThemeProvider,
  useParentTheme,
} from "@/components/school-parent/ParentThemeContext";
import { isTeacherMessagesPath } from "@/lib/organization-settings/teacher-routes";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";
import { parentThemeCssVars } from "@/lib/organization-settings/parent-theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";
import { MessagesRefreshProvider } from "@/lib/messages/messages-refresh-context";
import { fraunces, dmSans } from "@/lib/fonts";

const TeacherActivityNotificationsPanel = dynamic(
  () => import("@/components/school-teacher/TeacherActivityNotificationsPanel"),
  { ssr: false },
);

type SchoolTeacherBaselineProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: StaffUserProfile;
  staffMemberId?: string;
  previewMode?: boolean;
  previewBasePath?: string;
  previewStaffMemberId?: string;
  initialActivityUnreadCount?: number;
  children: ReactNode;
};

function SchoolTeacherBaselineInner({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  staffMemberId,
  previewMode = false,
  previewBasePath,
  previewStaffMemberId,
  initialActivityUnreadCount,
  children,
}: SchoolTeacherBaselineProps) {
  const pathname = usePathname();
  const isMessagesPage = isTeacherMessagesPath(pathname);
  const messagesEnabled = Boolean(features.teacher?.messages) && !previewMode;
  const { theme, adminCompat: C } = useParentTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activityUnreadCount, setActivityUnreadCount] = useState(
    initialActivityUnreadCount ?? 0,
  );
  const lastUnreadFetchRef = useRef(0);
  const FOCUS_REFETCH_MS = 60_000;
  const skipInitialUnreadFetch =
    !previewMode && initialActivityUnreadCount != null;

  const fetchActivityUnreadCount = useCallback(async () => {
    if (previewMode) return;
    try {
      const params = new URLSearchParams({
        organizationId,
        slug,
      });
      const response = await fetch(
        `/api/teacher-portal/activity-notifications/unread-count?${params.toString()}`,
      );
      if (!response.ok) return;
      const payload = (await response.json()) as { unreadCount?: number };
      setActivityUnreadCount(payload.unreadCount ?? 0);
      lastUnreadFetchRef.current = Date.now();
    } catch {
      // ignore transient fetch errors
    }
  }, [organizationId, previewMode, slug]);

  useEffect(() => {
    if (previewMode || skipInitialUnreadFetch) return;
    queueMicrotask(() => {
      void fetchActivityUnreadCount();
    });
  }, [fetchActivityUnreadCount, previewMode, skipInitialUnreadFetch]);

  useEffect(() => {
    if (previewMode) return;
    const handleFocus = () => {
      if (Date.now() - lastUnreadFetchRef.current < FOCUS_REFETCH_MS) return;
      void fetchActivityUnreadCount();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchActivityUnreadCount, previewMode]);

  const openNotifications = useCallback(() => {
    setNotificationsOpen(true);
  }, []);

  return (
    <MessagesRefreshProvider
      organizationId={organizationId}
      enabled={messagesEnabled}
    >
      <div
        className={`flex h-dvh w-full flex-col overflow-hidden ${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)]`}
        data-teacher-portal
        style={{
          ...parentThemeCssVars(theme),
          fontFamily: theme.fontBody,
          color: theme.ink,
          backgroundColor: theme.paper,
        }}
      >
        <SchoolTeacherHeader
          slug={slug}
          organizationId={organizationId}
          schoolName={schoolName}
          branding={branding}
          features={features}
          userProfile={userProfile}
          previewMode={previewMode}
          previewBasePath={previewBasePath}
          activityUnreadCount={activityUnreadCount}
          onOpenNotifications={openNotifications}
        />

        <main
          className={`flex min-h-0 flex-1 flex-col ${
            isMessagesPage ? "overflow-hidden" : "overflow-y-auto"
          }`}
        >
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </main>
        <ParentToaster C={C} />

        <TeacherActivityNotificationsPanel
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          organizationId={organizationId}
          slug={slug}
          previewMode={previewMode}
          previewStaffMemberId={previewStaffMemberId ?? staffMemberId}
          onMarkedRead={() => setActivityUnreadCount(0)}
        />
      </div>
    </MessagesRefreshProvider>
  );
}

export default function SchoolTeacherBaseline(props: SchoolTeacherBaselineProps) {
  return (
    <ParentThemeProvider branding={props.branding}>
      <SchoolTeacherBaselineInner {...props} />
    </ParentThemeProvider>
  );
}
