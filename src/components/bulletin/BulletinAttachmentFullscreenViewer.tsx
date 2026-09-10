"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText, X } from "lucide-react";
import { buildEmbeddedPdfViewerUrl } from "@/lib/admissions/enrollment-checklist-document-storage";
import {
  canPreviewBulletinAttachment,
  isBulletinImageAttachment,
  isBulletinPdfAttachment,
} from "@/lib/school-bulletin/attachment-preview";
import type { BulletinAttachment } from "@/lib/school-bulletin/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type BulletinAttachmentViewerState = {
  attachments: BulletinAttachment[];
  index: number;
};

type BulletinAttachmentFullscreenViewerProps = {
  theme: ParentThemeTokens;
  viewerState: BulletinAttachmentViewerState | null;
  open: boolean;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
};

export default function BulletinAttachmentFullscreenViewer({
  theme,
  viewerState,
  open,
  onClose,
  onChangeIndex,
}: BulletinAttachmentFullscreenViewerProps) {
  const previewableAttachments =
    viewerState?.attachments.filter(
      (attachment) =>
        attachment.downloadUrl && canPreviewBulletinAttachment(attachment.mimeType),
    ) ?? [];

  const activeAttachment =
    viewerState && previewableAttachments.length > 0
      ? previewableAttachments[
          Math.min(viewerState.index, previewableAttachments.length - 1)
        ]
      : null;

  const activeIndex = activeAttachment
    ? previewableAttachments.findIndex((a) => a.id === activeAttachment.id)
    : 0;

  const showCarousel = previewableAttachments.length > 1;

  return (
    <AnimatePresence>
      {open && activeAttachment ? (
        <motion.div
          className="fixed inset-0 z-[120] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            onClick={onClose}
            aria-hidden="true"
          />

          <div
            className="relative z-[15] flex shrink-0 items-center justify-between gap-3 px-4 py-3"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="min-w-0 truncate text-sm font-medium text-white">
              {activeAttachment.fileName}
            </p>
            <div className="flex items-center gap-2">
              {showCarousel ? (
                <span className="text-xs font-semibold text-white/70">
                  {activeIndex + 1} / {previewableAttachments.length}
                </span>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-white transition-colors hover:bg-white/10"
                aria-label="Close file viewer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            className="relative z-[15] flex flex-1 items-center justify-center px-4 pb-4"
            onClick={(event) => event.stopPropagation()}
          >
            {showCarousel ? (
              <button
                type="button"
                onClick={() =>
                  onChangeIndex(
                    (activeIndex - 1 + previewableAttachments.length) %
                      previewableAttachments.length,
                  )
                }
                className="absolute left-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 sm:left-4"
                aria-label="Previous attachment"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : null}

            <div className="flex h-full w-full max-h-[calc(100vh-80px)] max-w-[90vw] items-center justify-center">
              {isBulletinImageAttachment(activeAttachment.mimeType) &&
              activeAttachment.downloadUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeAttachment.downloadUrl}
                  alt={activeAttachment.fileName}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />
              ) : isBulletinPdfAttachment(activeAttachment.mimeType) &&
                activeAttachment.downloadUrl ? (
                <iframe
                  src={buildEmbeddedPdfViewerUrl(activeAttachment.downloadUrl)}
                  title={activeAttachment.fileName}
                  className="h-[calc(100vh-100px)] w-full max-w-[90vw] rounded-lg border-0 bg-white"
                />
              ) : activeAttachment.downloadUrl ? (
                <a
                  href={activeAttachment.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold"
                  style={{ color: theme.info }}
                >
                  <FileText className="h-4 w-4" />
                  Open {activeAttachment.fileName}
                </a>
              ) : null}
            </div>

            {showCarousel ? (
              <button
                type="button"
                onClick={() =>
                  onChangeIndex((activeIndex + 1) % previewableAttachments.length)
                }
                className="absolute right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 sm:right-4"
                aria-label="Next attachment"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
