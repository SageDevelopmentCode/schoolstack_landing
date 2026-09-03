"use client";

import { useCallback, useMemo, useState } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { MessageThreadSummary, MessagesInboxData } from "@/lib/messages/types";
import MessagesInboxLayout from "@/components/messages/MessagesInboxLayout";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { ParentMessagesPageContext } from "./parent-messages-page-context";

type ParentMessagesPageShellProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  familyId?: string;
  previewMode?: boolean;
  readOnly?: boolean;
  children?: React.ReactNode;
};

export default function ParentMessagesPageShell({
  organizationId,
  organizationSlug,
  schoolName,
  familyId,
  previewMode = false,
  readOnly = false,
  children,
}: ParentMessagesPageShellProps) {
  const { theme, adminCompat: C } = useParentTheme();
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [guardianId, setGuardianId] = useState<string | null>(null);
  const [threadsHydrated, setThreadsHydrated] = useState(false);

  const hydrateThreads = useCallback(
    (nextThreads: MessageThreadSummary[], nextGuardianId: string | null) => {
      setThreads(nextThreads);
      setGuardianId(nextGuardianId);
      setThreadsHydrated(true);
    },
    [],
  );

  const initialInbox = useMemo<MessagesInboxData>(
    () => ({
      threads,
      contacts: [],
      guardianId,
      threadsDeferred: !threadsHydrated,
    }),
    [guardianId, threads, threadsHydrated],
  );

  const contextValue = useMemo(() => ({ hydrateThreads }), [hydrateThreads]);

  return (
    <ParentMessagesPageContext.Provider value={contextValue}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <MessagesInboxLayout
          api={{
            basePath: "/api/parent-portal/messages",
            organizationId,
            organizationSlug,
            schoolName,
            familyId,
            guardianId: guardianId ?? undefined,
            viewer: "parent",
          }}
          initialInbox={initialInbox}
          deferContactsLoad
          readOnly={readOnly || previewMode}
          C={C}
          theme={theme}
          variant="parent-story"
        />
      </div>
      {children}
    </ParentMessagesPageContext.Provider>
  );
}
