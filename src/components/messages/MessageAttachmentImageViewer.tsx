"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  isMessageImageAttachment,
  type MessageImageViewerState,
} from "@/lib/messages/attachment-preview";

type MessageAttachmentImageViewerProps = {
  viewerState: MessageImageViewerState | null;
  open: boolean;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
};

export default function MessageAttachmentImageViewer({
  viewerState,
  open,
  onClose,
  onChangeIndex,
}: MessageAttachmentImageViewerProps) {
  const previewableAttachments =
    viewerState?.attachments.filter(
      (attachment) => attachment.url && isMessageImageAttachment(attachment.mimeType),
    ) ?? [];

  const activeAttachment =
    viewerState && previewableAttachments.length > 0
      ? previewableAttachments[
          Math.min(viewerState.index, previewableAttachments.length - 1)
        ]
      : null;

  const activeIndex = activeAttachment
    ? previewableAttachments.findIndex((attachment) => attachment.id === activeAttachment.id)
    : 0;

  const showCarousel = previewableAttachments.length > 1;

  const closeRef = useRef<HTMLButtonElement>(null);
  const [isClient, setIsClient] = useState(false);
  const latest = useRef({ onClose, onChangeIndex, activeIndex, count: previewableAttachments.length });
  useEffect(() => {
    latest.current = { onClose, onChangeIndex, activeIndex, count: previewableAttachments.length };
  });

  useEffect(() => {
    queueMicrotask(() => setIsClient(true));
  }, []);

  useEffect(() => {
    if (!open) return;

    // Focus moves into the viewer and returns to the image that opened it.
    const opener = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 30);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      const { onClose: close, onChangeIndex: change, activeIndex: index, count } = latest.current;
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      } else if (count > 1 && event.key === "ArrowRight") {
        event.preventDefault();
        change((index + 1) % count);
      } else if (count > 1 && event.key === "ArrowLeft") {
        event.preventDefault();
        change((index - 1 + count) % count);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open]);

  // Portalled to <body> so no transformed / clipping ancestor (animated chat
  // rows, scroll panes) can trap the fixed overlay.
  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && activeAttachment?.url ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Image: ${activeAttachment.fileName}`}
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
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="Close image viewer"
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
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : null}

            <div className="flex h-full w-full max-h-[calc(100vh-80px)] max-w-[90vw] items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeAttachment.url}
                alt={activeAttachment.fileName}
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
            </div>

            {showCarousel ? (
              <button
                type="button"
                onClick={() =>
                  onChangeIndex((activeIndex + 1) % previewableAttachments.length)
                }
                className="absolute right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 sm:right-4"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
