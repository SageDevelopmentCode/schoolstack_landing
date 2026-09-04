import { loadParentMessagesInboxData } from "@/lib/messages/load-parent-messages-inbox-data";
import type { MessageThreadAudienceScope } from "@/lib/messages/message-audience";
import ParentMessagesInboxData from "./ParentMessagesInboxData";

type ParentMessagesInboxLoaderProps = {
  organizationId: string;
  schoolName: string;
  programId?: string | null;
  audienceScope?: MessageThreadAudienceScope;
};

export default async function ParentMessagesInboxLoader({
  organizationId,
  schoolName,
  programId,
  audienceScope,
}: ParentMessagesInboxLoaderProps) {
  const inboxData = await loadParentMessagesInboxData(organizationId, schoolName, {
    programId,
    audienceScope,
  });

  return <ParentMessagesInboxData inboxData={inboxData} />;
}
