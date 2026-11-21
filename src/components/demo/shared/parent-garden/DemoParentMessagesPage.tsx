"use client";

import { useMemo } from "react";
import MessagesInboxLayout from "@/components/messages/MessagesInboxLayout";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import {
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  resolveDemoParentSchoolName,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoParentMessageThreadDetails,
  buildDemoParentMessagesInbox,
} from "@/data/school-demos/demo-parent-messages-fixtures";

/*
 * Parent demo › Messages: the live Garden inbox (`MessagesInboxLayout`
 * variant="parent-garden", as in `ParentMessagesPageShell`), read-only and fed
 * by fixtures. `readOnly` skips the inbox fetch, polling and realtime, and
 * thread clicks serve `previewThreadMessages`, so nothing hits the API.
 */
function DemoParentMessagesInbox() {
  const { theme, adminCompat: C } = useParentTheme();
  const initialInbox = useMemo(() => buildDemoParentMessagesInbox(), []);
  const previewThreadMessages = useMemo(() => buildDemoParentMessageThreadDetails(), []);

  return (
    <ParentGardenFrame theme={theme} className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <MessagesInboxLayout
        api={{
          basePath: "/api/parent-portal/messages",
          organizationId: DEMO_PORTAL_ORG_ID,
          organizationSlug: DEMO_PORTAL_SLUG,
          schoolName: resolveDemoParentSchoolName(),
          viewer: "parent",
        }}
        initialInbox={initialInbox}
        previewThreadMessages={previewThreadMessages}
        initialThreadId="parent-thread-rivera"
        readOnly
        C={C}
        theme={theme}
        variant="parent-garden"
      />
    </ParentGardenFrame>
  );
}

export default function DemoParentMessagesPage() {
  return (
    <DemoSchoolParentStoryProvider className="flex h-full min-h-0 flex-1 flex-col">
      <DemoParentMessagesInbox />
    </DemoSchoolParentStoryProvider>
  );
}
