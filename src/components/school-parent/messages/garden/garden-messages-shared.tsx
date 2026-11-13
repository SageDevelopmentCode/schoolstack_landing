"use client";

import { FileImage, FileText } from "lucide-react";
import MessagesAvatar from "@/components/messages/MessagesAvatar";
import MessagesDualAvatar from "@/components/messages/MessagesDualAvatar";
import {
  isMudKitchenSupportListThread,
  MUDKITCHEN_SUPPORT_LOGO_URL,
} from "@/lib/messages/platform-support";
import type { MessageThreadListAvatar } from "@/lib/messages/types";

export {
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_MB_LABEL,
} from "@/lib/messages/parent-messages-feedback";

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileTypeIcon({ mimeType, className = "h-4 w-4" }: { mimeType?: string | null; className?: string }) {
  return mimeType?.startsWith("image/") ? (
    <FileImage className={className} aria-hidden />
  ) : (
    <FileText className={className} aria-hidden />
  );
}

export function pluralize(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * Thread/contact avatar in Garden: the shared MessagesAvatar inside a soft ink
 * ring. Support logo renders contained on white, like the story look.
 */
export function GardenAvatar({
  name,
  color,
  photoUrl,
  listAvatars,
  size = "md",
  supportLogo = false,
}: {
  name: string;
  color: string;
  photoUrl?: string | null;
  listAvatars?: MessageThreadListAvatar[];
  size?: "sm" | "md" | "lg";
  supportLogo?: boolean;
}) {
  if (listAvatars?.length === 2) {
    return <MessagesDualAvatar avatars={listAvatars} size={size} />;
  }
  const containLogo = supportLogo || photoUrl === MUDKITCHEN_SUPPORT_LOGO_URL;
  return (
    <span className="inline-flex shrink-0 rounded-full ring-[1.5px] ring-[var(--sf-ink)]/15 ring-offset-2 ring-offset-white">
      <MessagesAvatar
        name={name}
        color={color}
        photoUrl={photoUrl}
        size={size}
        photoBackground={containLogo ? "#FFFFFF" : undefined}
        photoObjectFit={containLogo && photoUrl ? "contain" : "cover"}
      />
    </span>
  );
}

export { isMudKitchenSupportListThread };
