"use client";

import { useLayoutEffect } from "react";
import type { ParentMessagesInboxData } from "@/lib/messages/load-parent-messages-inbox-data";
import { useParentMessagesPageContext } from "./parent-messages-page-context";

type ParentMessagesInboxDataProps = {
  inboxData: ParentMessagesInboxData;
};

export default function ParentMessagesInboxData({
  inboxData,
}: ParentMessagesInboxDataProps) {
  const { hydrateThreads } = useParentMessagesPageContext();

  useLayoutEffect(() => {
    hydrateThreads(inboxData.threads, inboxData.guardianId);
  }, [hydrateThreads, inboxData]);

  return null;
}
