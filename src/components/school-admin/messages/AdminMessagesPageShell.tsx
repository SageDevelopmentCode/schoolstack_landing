"use client";

import { useCallback, useMemo, useState } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type {
  MessageThreadSummary,
  MessagesInboxData,
  MessagesViewerContext,
} from "@/lib/messages/types";
import MessagesInboxLayout from "@/components/messages/MessagesInboxLayout";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { AdminGardenSkin } from "@/components/school-admin/garden/skin";
import { AdminMessagesPageContext } from "./admin-messages-page-context";
import { useAdminMessagesFeedback } from "./useAdminMessagesFeedback";

type AdminMessagesPageShellProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  viewerContext: MessagesViewerContext;
  children?: React.ReactNode;
};

export default function AdminMessagesPageShell({
  organizationId,
  organizationSlug,
  schoolName,
  viewerContext,
  children,
}: AdminMessagesPageShellProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [threadsHydrated, setThreadsHydrated] = useState(false);

  const hydrateThreads = useCallback((nextThreads: MessageThreadSummary[]) => {
    setThreads(nextThreads);
    setThreadsHydrated(true);
  }, []);

  const initialInbox = useMemo<MessagesInboxData>(
    () => ({
      threads,
      contacts: [],
      viewerContext,
      threadsDeferred: !threadsHydrated,
    }),
    [threads, threadsHydrated, viewerContext],
  );

  const onFeedback = useAdminMessagesFeedback();

  const contextValue = useMemo(
    () => ({
      hydrateThreads,
    }),
    [hydrateThreads],
  );

  return (
    <AdminMessagesPageContext.Provider value={contextValue}>
      {/*
        Full-height Garden inbox (admin Garden skill): the frame + skin fill the
        no-scroll admin pane; the inbox owns its own scrolling columns.
      */}
      <ParentGardenFrame
        theme={theme}
        className="flex !h-full !min-h-0 flex-1 flex-col overflow-hidden bg-[var(--sf-cream)]"
      >
        <AdminGardenSkin theme={theme}>
          <div className="sf-admin-garden-skin flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            <MessagesInboxLayout
              api={{
                basePath: "/api/school-admin/messages",
                organizationId,
                organizationSlug,
                schoolName,
                viewer: "admin",
              }}
              initialInbox={initialInbox}
              deferContactsLoad
              C={C}
              theme={theme}
              variant="admin-garden"
              onFeedback={onFeedback}
            />
          </div>
        </AdminGardenSkin>
      </ParentGardenFrame>
      {children}
    </AdminMessagesPageContext.Provider>
  );
}
