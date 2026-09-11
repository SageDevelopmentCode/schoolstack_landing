import type { ReactNode } from "react";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";

type AdminReadOnlyMessageBubbleProps = {
  senderName: string;
  roleLabel?: string;
  timestamp: string;
  body: string;
  metadata?: ReactNode;
};

export default function AdminReadOnlyMessageBubble({
  senderName,
  roleLabel,
  timestamp,
  body,
  metadata,
}: AdminReadOnlyMessageBubbleProps) {
  return (
    <div className="rounded-admin-md border border-admin-border bg-admin-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-admin-text">{senderName}</p>
        {roleLabel ? (
          <AdminStatusBadge label={roleLabel} variant="neutral" />
        ) : null}
        <p className="text-xs text-admin-faint">{timestamp}</p>
      </div>
      {body.trim() ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-admin-text">{body}</p>
      ) : null}
      {metadata}
    </div>
  );
}
