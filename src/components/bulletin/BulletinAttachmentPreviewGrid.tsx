"use client";

import { FileText } from "lucide-react";
import {
  canPreviewBulletinAttachment,
  isBulletinImageAttachment,
  isBulletinPdfAttachment,
} from "@/lib/school-bulletin/attachment-preview";
import type { BulletinAttachment } from "@/lib/school-bulletin/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const MAX_VISIBLE_CELLS = 4;
const MAX_PREVIEW_BEFORE_OVERFLOW = 3;

type BulletinAttachmentPreviewGridProps = {
  theme: ParentThemeTokens;
  attachments: BulletinAttachment[];
  onOpen?: () => void;
};

function PreviewCell({
  attachment,
  theme,
  onOpen,
}: {
  attachment: BulletinAttachment;
  theme: ParentThemeTokens;
  onOpen?: () => void;
}) {
  const cellClassName =
    "relative aspect-[4/3] w-full overflow-hidden rounded-md border bg-white transition-opacity hover:opacity-90";

  if (!attachment.downloadUrl) {
    return (
      <div
        className={`${cellClassName} flex items-center justify-center p-2`}
        style={{ borderColor: theme.line }}
      >
        <FileText className="h-5 w-5" style={{ color: theme.muted }} />
      </div>
    );
  }

  if (isBulletinImageAttachment(attachment.mimeType)) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cellClassName}
        style={{ borderColor: theme.line }}
        aria-label={`View ${attachment.fileName}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.downloadUrl}
          alt={attachment.fileName}
          className="h-full w-full object-cover"
        />
      </button>
    );
  }

  if (isBulletinPdfAttachment(attachment.mimeType)) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={`${cellClassName} flex flex-col`}
        style={{ borderColor: theme.line }}
        aria-label={`View ${attachment.fileName}`}
      >
        <iframe
          src={attachment.downloadUrl}
          title={attachment.fileName}
          className="pointer-events-none h-full w-full border-0"
        />
        <span
          className="absolute inset-x-0 bottom-0 truncate px-1.5 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: "rgba(255,255,255,0.92)",
            color: theme.muted,
          }}
        >
          PDF
        </span>
      </button>
    );
  }

  return (
    <a
      href={attachment.downloadUrl}
      target="_blank"
      rel="noreferrer"
      className={`${cellClassName} flex flex-col items-center justify-center gap-1 p-2`}
      style={{ borderColor: theme.line }}
    >
      <FileText className="h-5 w-5 shrink-0" style={{ color: theme.info }} />
      <span
        className="line-clamp-2 text-center text-[10px] font-semibold leading-tight"
        style={{ color: theme.muted }}
      >
        {attachment.fileName}
      </span>
    </a>
  );
}

export default function BulletinAttachmentPreviewGrid({
  theme,
  attachments,
  onOpen,
}: BulletinAttachmentPreviewGridProps) {
  if (attachments.length === 0) return null;

  const previewableAttachments = attachments.filter(
    (attachment) =>
      attachment.downloadUrl && canPreviewBulletinAttachment(attachment.mimeType),
  );
  const displayAttachments =
    previewableAttachments.length > 0 ? previewableAttachments : attachments;
  const hasOverflow = displayAttachments.length > MAX_VISIBLE_CELLS;
  const visibleCount = hasOverflow
    ? MAX_PREVIEW_BEFORE_OVERFLOW
    : Math.min(displayAttachments.length, MAX_VISIBLE_CELLS);
  const visibleAttachments = displayAttachments.slice(0, visibleCount);
  const overflowCount = displayAttachments.length - visibleCount;

  if (displayAttachments.length === 1) {
    const attachment = displayAttachments[0];
    if (isBulletinImageAttachment(attachment.mimeType)) {
      return (
        <button
          type="button"
          onClick={onOpen}
          className="w-full overflow-hidden rounded-md border"
          style={{ borderColor: theme.line }}
          aria-label={`View ${attachment.fileName}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachment.downloadUrl}
            alt={attachment.fileName}
            className="max-h-[220px] w-full object-cover"
          />
        </button>
      );
    }

    if (isBulletinPdfAttachment(attachment.mimeType)) {
      return (
        <button
          type="button"
          onClick={onOpen}
          className="w-full overflow-hidden rounded-md border bg-white"
          style={{ borderColor: theme.line }}
          aria-label={`View ${attachment.fileName}`}
        >
          <iframe
            src={attachment.downloadUrl}
            title={attachment.fileName}
            className="h-[160px] w-full border-0"
          />
        </button>
      );
    }
  }

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {visibleAttachments.map((attachment) => (
        <PreviewCell
          key={attachment.id}
          attachment={attachment}
          theme={theme}
          onOpen={onOpen}
        />
      ))}
      {hasOverflow ? (
        <button
          type="button"
          onClick={onOpen}
          className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-md border transition-opacity hover:opacity-90"
          style={{
            borderColor: theme.line,
            backgroundColor: theme.infoBg,
          }}
          aria-label={`View ${overflowCount} more attachments`}
        >
          <span className="text-lg font-bold" style={{ color: theme.info }}>
            +{overflowCount}
          </span>
        </button>
      ) : null}
    </div>
  );
}
