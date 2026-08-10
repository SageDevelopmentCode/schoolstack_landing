"use client";

import { Suspense, useMemo } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { MessagesInboxData } from "@/lib/messages/types";
import MessagesInboxLayout from "@/components/messages/MessagesInboxLayout";

type AdminMessagesPageProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  initialInbox?: MessagesInboxData;
};

export default function AdminMessagesPage({
  organizationId,
  organizationSlug,
  schoolName,
  branding,
  initialInbox,
}: AdminMessagesPageProps) {
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
            basePath: "/api/school-admin/messages",
            organizationId,
            organizationSlug,
            schoolName,
            viewer: "admin",
          }}
          initialInbox={initialInbox}
          C={C}
          variant="embedded"
        />
      </Suspense>
    </div>
  );
}
