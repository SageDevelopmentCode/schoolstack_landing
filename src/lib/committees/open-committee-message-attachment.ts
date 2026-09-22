import type { SupabaseClient } from "@supabase/supabase-js";
import { getCommitteeMessageAttachmentSignedUrl } from "@/lib/committees/committee-message-attachment-storage";
import type { CommitteeMessageAttachment } from "@/lib/committees/types";
import type { MessageAttachmentDisplay } from "@/lib/messages/attachment-preview";

export async function resolveCommitteeMessageAttachmentUrl(
  supabase: SupabaseClient,
  attachment: MessageAttachmentDisplay | CommitteeMessageAttachment,
): Promise<string | null> {
  if (attachment.url) return attachment.url;
  if (!attachment.storagePath) return null;
  return getCommitteeMessageAttachmentSignedUrl(supabase, attachment.storagePath);
}

export async function openCommitteeMessageAttachment(
  supabase: SupabaseClient,
  attachment: MessageAttachmentDisplay | CommitteeMessageAttachment,
): Promise<boolean> {
  const url = await resolveCommitteeMessageAttachmentUrl(supabase, attachment);
  if (!url) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
