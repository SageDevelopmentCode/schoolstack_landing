"use client";

import { Suspense, useMemo } from "react";
import { Loader2 } from "lucide-react";
import MessagesInboxLayout from "@/components/messages/MessagesInboxLayout";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { MessagesInboxData, PortalMessage } from "@/lib/messages/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TeacherMessagesPageProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  staffMemberId: string | null;
  initialInbox?: MessagesInboxData;
  previewThreadMessages?: Record<string, PortalMessage[]>;
  previewMode?: boolean;
  initialThreadId?: string | null;
  fillHeight?: boolean;
};

function TeacherMessagesPageFallback() {
  return (
    <div
      className="flex items-center justify-center gap-2 py-12 text-sm"
      style={{ color: "#65777F" }}
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading messages…
    </div>
  );
}

function TeacherMessagesPageContent({
  organizationId,
  organizationSlug,
  schoolName,
  branding,
  staffMemberId,
  initialInbox,
  previewThreadMessages,
  previewMode = false,
  initialThreadId = null,
  fillHeight = false,
}: TeacherMessagesPageProps) {
  const { theme, adminCompat: C } = useParentTheme();
  const teacherPortal = useMemo(
    () =>
      staffMemberId
        ? {
            organizationId,
            organizationSlug,
            staffMemberId,
            branding,
          }
        : null,
    [branding, organizationId, organizationSlug, staffMemberId],
  );

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden ${
        fillHeight ? "h-full flex-1" : "flex-1"
      }`}
    >
      <MessagesInboxLayout
        api={{
          basePath: "/api/teacher-portal/messages",
          organizationId,
          organizationSlug,
          schoolName,
          viewer: "teacher",
        }}
        initialInbox={initialInbox}
        previewThreadMessages={previewThreadMessages}
        initialThreadId={initialThreadId}
        fillHeight={fillHeight}
        readOnly={previewMode}
        C={C}
        theme={theme}
        variant="parent-story"
        teacherPortal={teacherPortal}
      />
    </div>
  );
}

export default function TeacherMessagesPage(props: TeacherMessagesPageProps) {
  const page = (
    <Suspense fallback={<TeacherMessagesPageFallback />}>
      <TeacherMessagesPageContent {...props} />
    </Suspense>
  );

  if (!props.fillHeight) return page;

  return <div className="flex h-full min-h-0 flex-1 flex-col">{page}</div>;
}
