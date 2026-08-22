"use client";

import { Suspense, useMemo } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { MessagesInboxData } from "@/lib/messages/types";
import MessagesInboxLayout from "@/components/messages/MessagesInboxLayout";

type ParentMessagesPageProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  familyId?: string;
  guardianId?: string | null;
  previewMode?: boolean;
  initialInbox?: MessagesInboxData;
};

export default function ParentMessagesPage({
  organizationId,
  organizationSlug,
  schoolName,
  branding,
  familyId,
  guardianId,
  previewMode = false,
  initialInbox,
}: ParentMessagesPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

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
            basePath: "/api/parent-portal/messages",
            organizationId,
            organizationSlug,
            schoolName,
            familyId,
            guardianId: guardianId ?? initialInbox?.guardianId ?? undefined,
            viewer: "parent",
          }}
          initialInbox={initialInbox}
          readOnly={previewMode}
          C={C}
          variant="embedded"
        />
      </Suspense>
    </div>
  );
}
