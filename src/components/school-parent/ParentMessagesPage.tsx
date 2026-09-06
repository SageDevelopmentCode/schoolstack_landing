"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { MessagesInboxData } from "@/lib/messages/types";
import MessagesInboxLayout from "@/components/messages/MessagesInboxLayout";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";

type ParentMessagesPageProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  familyId?: string;
  guardianId?: string | null;
  programId?: string;
  previewMode?: boolean;
  initialInbox?: MessagesInboxData;
};

function ParentMessagesPageFallback() {
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

function ParentMessagesPageContent({
  organizationId,
  organizationSlug,
  schoolName,
  familyId,
  guardianId,
  programId,
  previewMode = false,
  initialInbox,
}: Omit<ParentMessagesPageProps, "branding">) {
  const { theme, adminCompat: C } = useParentTheme();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <MessagesInboxLayout
        api={{
          basePath: "/api/parent-portal/messages",
          organizationId,
          organizationSlug,
          schoolName,
          familyId,
          guardianId: guardianId ?? initialInbox?.guardianId ?? undefined,
          programId,
          viewer: "parent",
        }}
        initialInbox={initialInbox}
        readOnly={previewMode}
        C={C}
        theme={theme}
        variant="parent-story"
      />
    </div>
  );
}

export default function ParentMessagesPage(props: ParentMessagesPageProps) {
  return (
    <Suspense fallback={<ParentMessagesPageFallback />}>
      <ParentMessagesPageContent {...props} />
    </Suspense>
  );
}
