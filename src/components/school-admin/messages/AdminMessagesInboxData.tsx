"use client";

import { useLayoutEffect } from "react";
import type { AdminMessagesInboxData } from "@/lib/messages/load-admin-messages-inbox-data";
import { useAdminMessagesPageContext } from "./admin-messages-page-context";

type AdminMessagesInboxDataProps = {
  inboxData: AdminMessagesInboxData;
};

export default function AdminMessagesInboxData({
  inboxData,
}: AdminMessagesInboxDataProps) {
  const { hydrateThreads } = useAdminMessagesPageContext();

  useLayoutEffect(() => {
    hydrateThreads(inboxData.threads);
  }, [hydrateThreads, inboxData]);

  return null;
}
