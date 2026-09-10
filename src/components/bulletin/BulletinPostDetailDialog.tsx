"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Megaphone, X } from "lucide-react";
import BulletinAttachmentViewer from "@/components/bulletin/BulletinAttachmentViewer";
import type { BulletinAttachment, BulletinPost } from "@/lib/school-bulletin/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type BulletinPostDetailDialogProps = {
  theme: ParentThemeTokens;
  post: BulletinPost | null;
  open: boolean;
  onClose: () => void;
  onOpenAttachment: (attachment: BulletinAttachment, index: number) => void;
};

function formatBulletinDetailDate(value?: string): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BulletinPostDetailDialog({
  theme,
  post,
  open,
  onClose,
  onOpenAttachment,
}: BulletinPostDetailDialogProps) {
  const dateLabel = formatBulletinDetailDate(post?.publishedAt ?? post?.createdAt);

  return (
    <AnimatePresence>
      {open && post ? (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulletin-detail-dialog-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative z-[15] flex w-full max-w-lg max-h-[85vh] flex-col overflow-hidden rounded-2xl border"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="border-b px-5 py-4"
              style={{
                backgroundColor: theme.infoBg,
                borderColor: theme.line,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: theme.white }}
                  >
                    <Megaphone className="h-4 w-4" style={{ color: theme.info }} />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="bulletin-detail-dialog-title"
                      className="text-base font-semibold leading-snug"
                      style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                    >
                      {post.title}
                    </h2>
                    {dateLabel ? (
                      <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                        {dateLabel}
                      </p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 transition-colors hover:bg-black/[0.05]"
                  aria-label="Close announcement"
                >
                  <X className="h-5 w-5" style={{ color: theme.muted }} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {post.body.trim() ? (
                <p
                  className="whitespace-pre-wrap text-sm leading-relaxed"
                  style={{ color: "#65747A" }}
                >
                  {post.body}
                </p>
              ) : null}

              {post.attachments.length > 0 ? (
                <div className={post.body.trim() ? "mt-6" : ""}>
                  <p
                    className="mb-3 text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: theme.muted }}
                  >
                    Attachments
                  </p>
                  <BulletinAttachmentViewer
                    theme={theme}
                    attachments={post.attachments}
                    onOpenAttachment={onOpenAttachment}
                  />
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
