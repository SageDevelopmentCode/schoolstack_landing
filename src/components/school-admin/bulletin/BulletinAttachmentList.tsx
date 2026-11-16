"use client";

import { ExternalLink, FileText, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { gIconBtn } from "@/components/school-admin/garden/kit";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import type { BulletinAttachment } from "@/lib/school-bulletin/types";

type BulletinAttachmentListProps = {
  attachments: BulletinAttachment[];
  onRemove?: (attachmentId: string) => void;
  removingId?: string | null;
  /** Another bulletin action is running; removal waits. */
  disabled?: boolean;
};

function formatSize(sizeBytes: number | null): string | null {
  if (!sizeBytes) return null;
  if (sizeBytes >= 1024 * 1024) return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

/** Garden file chips for bulletin attachments (open + remove). */
export default function BulletinAttachmentList({
  attachments,
  onRemove,
  removingId = null,
  disabled = false,
}: BulletinAttachmentListProps) {
  if (attachments.length === 0) {
    return (
      <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">
        No files attached yet. Upload PDFs or images to include flyers.
      </p>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0" aria-label="Attachments">
      {attachments.map((attachment) => {
        const isImage = attachment.mimeType?.startsWith("image/") ?? false;
        const Icon = isImage ? ImageIcon : FileText;
        const removing = removingId === attachment.id;
        const size = formatSize(attachment.sizeBytes);
        return (
          <li
            key={attachment.id}
            className={`flex items-center justify-between gap-3 rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/[0.08] bg-white px-3 py-2 transition-opacity ${
              removing ? "opacity-60" : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-[var(--sf-ink)]/12 ${
                  isImage ? "bg-[var(--sf-sky)]" : "bg-[var(--sf-butter)]"
                }`}
              >
                <Icon className="h-4 w-4 text-[var(--sf-ink)]/70" />
              </span>
              <div className="min-w-0">
                <p className="m-0 truncate text-[13.5px] font-extrabold text-[var(--sf-ink)]">{attachment.fileName}</p>
                {size ? <p className="m-0 text-[12px] font-semibold tabular-nums text-[var(--sf-soft)]">{size}</p> : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {attachment.downloadUrl ? (
                <a
                  href={attachment.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12.5px] font-extrabold text-[var(--sf-clay-deep)] hover:underline ${G_FOCUS}`}
                >
                  Open
                  <ExternalLink className="h-3 w-3" aria-hidden />
                  <span className="sr-only">{attachment.fileName} in a new tab</span>
                </a>
              ) : null}
              {onRemove ? (
                <button
                  type="button"
                  className={gIconBtn}
                  onClick={() => onRemove(attachment.id)}
                  disabled={disabled || removing}
                  aria-busy={removing || undefined}
                  aria-label={`Remove ${attachment.fileName}`}
                >
                  {removing ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden />
                  )}
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
