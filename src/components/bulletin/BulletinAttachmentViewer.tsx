"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
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
};

function AttachmentOpenLink({
  attachment,
  theme,
}: {
  attachment: BulletinAttachment;
  theme: ParentThemeTokens;
}) {
  if (!attachment.downloadUrl) return null;

  return (
    <a
      href={attachment.downloadUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
      style={{
        backgroundColor: theme.infoBg,
        color: theme.info,
      }}
    >
      <FileText className="h-3.5 w-3.5" />
      {attachment.fileName}
    </a>
  );
}

function AttachmentPreview({
  attachment,
  theme,
}: {
  attachment: BulletinAttachment;
  theme: ParentThemeTokens;
}) {
  if (!attachment.downloadUrl) return null;

  const frameClassName =
    "flex min-h-[240px] max-h-[420px] w-full items-center justify-center overflow-hidden rounded-xl border bg-white";

  if (isBulletinImageAttachment(attachment.mimeType)) {
    return (
      <div className={frameClassName} style={{ borderColor: theme.line }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.downloadUrl}
          alt={attachment.fileName}
          className="max-h-[360px] w-full object-contain"
        />
      </div>
    );
  }

  if (isBulletinPdfAttachment(attachment.mimeType)) {
    return (
      <div className="space-y-2">
        <div
          className="overflow-hidden rounded-xl border bg-white"
          style={{ borderColor: theme.line }}
        >
          <iframe
            src={attachment.downloadUrl}
            title={attachment.fileName}
            className="h-[420px] w-full"
          />
        </div>
        <a
          href={attachment.downloadUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold underline-offset-2 hover:underline"
          style={{ color: theme.info }}
        >
          Open PDF in new tab
        </a>
      </div>
    );
  }

  return null;
}

export default function BulletinAttachmentViewer({
  theme,
  attachments,
}: BulletinAttachmentViewerProps) {
  const previewableAttachments = useMemo(
    () =>
      attachments.filter(
        (attachment) =>
          attachment.downloadUrl && canPreviewBulletinAttachment(attachment.mimeType),
      ),
    [attachments],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [attachments]);

  const safeIndex =
    previewableAttachments.length > 0
      ? Math.min(activeIndex, previewableAttachments.length - 1)
      : 0;
  const activeAttachment = previewableAttachments[safeIndex] ?? null;

  if (previewableAttachments.length === 0) {
    if (attachments.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <AttachmentOpenLink key={attachment.id} attachment={attachment} theme={theme} />
        ))}
      </div>
    );
  }

  const showCarousel = previewableAttachments.length > 1;

  return (
    <div className="space-y-3">
      {showCarousel ? (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveIndex(
                (current) =>
                  (current - 1 + previewableAttachments.length) %
                  previewableAttachments.length,
              )
            }
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors hover:bg-black/[0.03]"
            style={{ borderColor: theme.line, color: theme.ink }}
            aria-label="Previous attachment"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold" style={{ color: theme.muted }}>
            {safeIndex + 1} / {previewableAttachments.length}
          </span>
          <button
            type="button"
            onClick={() =>
              setActiveIndex((current) => (current + 1) % previewableAttachments.length)
            }
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors hover:bg-black/[0.03]"
            style={{ borderColor: theme.line, color: theme.ink }}
            aria-label="Next attachment"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {activeAttachment ? (
        <AttachmentPreview attachment={activeAttachment} theme={theme} />
      ) : null}

      {activeAttachment ? (
        <p className="text-center text-xs font-medium" style={{ color: theme.muted }}>
          {activeAttachment.fileName}
        </p>
      ) : null}

      {showCarousel ? (
        <div className="flex justify-center gap-1.5">
          {previewableAttachments.map((attachment, index) => (
            <button
              key={attachment.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="h-2 w-2 rounded-full transition-transform"
              style={{
                backgroundColor: index === safeIndex ? theme.info : theme.line,
                transform: index === safeIndex ? "scale(1.15)" : undefined,
              }}
              aria-label={`View attachment ${index + 1}`}
            />
          ))}
        </div>
      ) : null}

      {attachments.length > 1 ||
      (attachments.length === 1 && previewableAttachments.length === 0) ? (
        <div className="flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: theme.line }}>
          {attachments.map((attachment) => (
            <AttachmentOpenLink key={attachment.id} attachment={attachment} theme={theme} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
