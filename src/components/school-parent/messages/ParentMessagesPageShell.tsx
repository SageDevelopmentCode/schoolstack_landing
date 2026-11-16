"use client";

import { useCallback, useMemo, useState } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { MessageThreadSummary, MessagesInboxData } from "@/lib/messages/types";
import MessagesInboxLayout from "@/components/messages/MessagesInboxLayout";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { ParentMessagesPageContext } from "./parent-messages-page-context";
import { useParentMessagesFeedback } from "./useParentMessagesFeedback";

type ParentMessagesPageShellProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  familyId?: string;
  previewMode?: boolean;
  readOnly?: boolean;
  programId?: string;
  children?: React.ReactNode;
};

export default function ParentMessagesPageShell({
  organizationId,
  organizationSlug,
  schoolName,
  familyId,
  previewMode = false,
  readOnly = false,
  programId,
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
  const onFeedback = useParentMessagesFeedback();

  return (
    <ParentMessagesPageContext.Provider value={contextValue}>
      <ParentGardenFrame
        theme={theme}
        className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
      >
        <MessagesInboxLayout
          api={{
            basePath: "/api/parent-portal/messages",
            organizationId,
            organizationSlug,
            schoolName,
            familyId,
            programId,
            guardianId: guardianId ?? undefined,
            viewer: "parent",
          }}
          initialInbox={initialInbox}
          deferContactsLoad
          readOnly={readOnly || previewMode}
          C={C}
          theme={theme}
          variant="parent-garden"
          onFeedback={onFeedback}
        />
      </ParentGardenFrame>
      {children}
    </ParentMessagesPageContext.Provider>
  );
}
