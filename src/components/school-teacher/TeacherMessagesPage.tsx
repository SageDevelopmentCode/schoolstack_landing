"use client";

import { Suspense, useMemo } from "react";
import { Loader2 } from "lucide-react";
import MessagesInboxLayout from "@/components/messages/MessagesInboxLayout";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { MessagesInboxData } from "@/lib/messages/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TeacherMessagesPageProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  staffMemberId: string | null;
  initialInbox?: MessagesInboxData;
  previewMode?: boolean;
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
  previewMode = false,
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <MessagesInboxLayout
        api={{
          basePath: "/api/teacher-portal/messages",
          organizationId,
          organizationSlug,
          schoolName,
          viewer: "teacher",
        }}
        initialInbox={initialInbox}
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
  return (
    <Suspense fallback={<TeacherMessagesPageFallback />}>
      <TeacherMessagesPageContent {...props} />
    </Suspense>
  );
}
