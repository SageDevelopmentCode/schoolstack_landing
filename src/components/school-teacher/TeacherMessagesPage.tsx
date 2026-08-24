"use client";

import { Suspense, useMemo } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { MessagesInboxData } from "@/lib/messages/types";
import MessagesInboxLayout from "@/components/messages/MessagesInboxLayout";

type TeacherMessagesPageProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  staffMemberId: string | null;
  initialInbox?: MessagesInboxData;
  previewMode?: boolean;
};

export default function TeacherMessagesPage({
  organizationId,
  organizationSlug,
  schoolName,
  branding,
  staffMemberId,
  initialInbox,
  previewMode = false,
}: TeacherMessagesPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
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
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense
        fallback={
          <div
            className="flex flex-1 items-center justify-center py-12 text-sm"
            style={{ color: C.textSecondary }}
          >
            Loading messages…
          </div>
        }
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
          C={C}
          variant="embedded"
          teacherPortal={teacherPortal}
          readOnly={previewMode}
        />
      </Suspense>
    </div>
  );
}
