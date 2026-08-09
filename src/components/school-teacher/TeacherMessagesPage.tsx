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
  initialInbox?: MessagesInboxData;
};

export default function TeacherMessagesPage({
  organizationId,
  organizationSlug,
  schoolName,
  branding,
  initialInbox,
}: TeacherMessagesPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  return (
    <Suspense fallback={<div className="py-12 text-center text-sm">Loading messages…</div>}>
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
    />
    </Suspense>
  );
}
