import { loadAdminMessagesInboxData } from "@/lib/messages/load-admin-messages-inbox-data";
import AdminMessagesInboxData from "./AdminMessagesInboxData";

type AdminMessagesInboxLoaderProps = {
  organizationId: string;
  schoolName: string;
};

export default async function AdminMessagesInboxLoader({
  organizationId,
  schoolName,
}: AdminMessagesInboxLoaderProps) {
  const inboxData = await loadAdminMessagesInboxData(organizationId, schoolName);

  return <AdminMessagesInboxData inboxData={inboxData} />;
}
