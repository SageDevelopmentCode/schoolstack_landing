"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { MessagesInboxData } from "@/lib/messages/types";
import MessagesInboxLayout from "@/components/messages/MessagesInboxLayout";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";

type AdminMessagesPageProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  initialInbox?: MessagesInboxData;
};

function AdminMessagesPageFallback() {
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

function AdminMessagesPageContent({
  organizationId,
  organizationSlug,
  schoolName,
  initialInbox,
}: Omit<AdminMessagesPageProps, "branding">) {
  const { theme, C } = useSchoolAdminStoryTheme();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
        theme={theme}
        variant="admin-story"
      />
    </div>
  );
}

export default function AdminMessagesPage(props: AdminMessagesPageProps) {
  return (
    <Suspense fallback={<AdminMessagesPageFallback />}>
      <AdminMessagesPageContent {...props} />
    </Suspense>
  );
}
