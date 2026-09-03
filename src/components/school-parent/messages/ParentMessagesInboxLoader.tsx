import { loadParentMessagesInboxData } from "@/lib/messages/load-parent-messages-inbox-data";
import ParentMessagesInboxData from "./ParentMessagesInboxData";

type ParentMessagesInboxLoaderProps = {
  organizationId: string;
  schoolName: string;
};

export default async function ParentMessagesInboxLoader({
  organizationId,
  schoolName,
}: ParentMessagesInboxLoaderProps) {
  const inboxData = await loadParentMessagesInboxData(organizationId, schoolName);

  return <ParentMessagesInboxData inboxData={inboxData} />;
}
