"use client";

import { FileText } from "lucide-react";
import {
  canPreviewBulletinAttachment,
  isBulletinImageAttachment,
  isBulletinPdfAttachment,
} from "@/lib/school-bulletin/attachment-preview";
import type { BulletinAttachment } from "@/lib/school-bulletin/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type BulletinAttachmentViewerProps = {
  theme: ParentThemeTokens;
  attachments: BulletinAttachment[];
  onOpenAttachment: (attachment: BulletinAttachment, index: number) => void;
};

function AttachmentChip({
  attachment,
  index,
  theme,
  onOpenAttachment,
}: {
  attachment: BulletinAttachment;
  index: number;
  theme: ParentThemeTokens;
  onOpenAttachment: (attachment: BulletinAttachment, index: number) => void;
}) {
  const isPreviewable =
    Boolean(attachment.downloadUrl) && canPreviewBulletinAttachment(attachment.mimeType);
  const isImage = isBulletinImageAttachment(attachment.mimeType);
  const isPdf = isBulletinPdfAttachment(attachment.mimeType);

  if (!attachment.downloadUrl) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2 opacity-60"
        style={{ borderColor: theme.line, backgroundColor: theme.white }}
      >
        <FileText className="h-4 w-4 shrink-0" style={{ color: theme.muted }} />
        <span className="truncate text-xs font-medium" style={{ color: theme.muted }}>
          {attachment.fileName}
        </span>
      </div>
    );
  }

  if (isPreviewable) {
    return (
      <button
        type="button"
        onClick={() => onOpenAttachment(attachment, index)}
        className="flex w-full items-center gap-2.5 overflow-hidden rounded-lg border px-3 py-2 text-left transition-opacity hover:opacity-90"
        style={{ borderColor: theme.line, backgroundColor: theme.white }}
        aria-label={`View ${attachment.fileName}`}
      >
        {isImage ? (
          <div
            className="h-10 w-10 shrink-0 overflow-hidden rounded-md border"
            style={{ borderColor: theme.line }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachment.downloadUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border"
            style={{ borderColor: theme.line, backgroundColor: theme.infoBg }}
          >
            <FileText className="h-4 w-4" style={{ color: theme.info }} />
          </div>
        )}
        <span className="min-w-0 flex-1 truncate text-xs font-semibold" style={{ color: theme.ink }}>
          {attachment.fileName}
        </span>
        {isPdf ? (
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
            style={{ backgroundColor: theme.infoBg, color: theme.info }}
          >
            PDF
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <a
      href={attachment.downloadUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
      style={{
        borderColor: theme.line,
        backgroundColor: theme.infoBg,
        color: theme.info,
      }}
    >
      <FileText className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{attachment.fileName}</span>
    </a>
  );
}

export default function BulletinAttachmentViewer({
  theme,
  attachments,
  onOpenAttachment,
}: BulletinAttachmentViewerProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="space-y-2">
      {attachments.map((attachment, index) => (
        <AttachmentChip
          key={attachment.id}
          attachment={attachment}
          index={index}
          theme={theme}
          onOpenAttachment={onOpenAttachment}
        />
      ))}
    </div>
  );
}
