"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import BulletinFeedItem from "@/components/bulletin/BulletinFeedItem";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type BulletinAllPostsDialogProps = {
  theme: ParentThemeTokens;
  posts: BulletinPost[];
  open: boolean;
  onClose: () => void;
  onOpenPost: (post: BulletinPost) => void;
};

export default function BulletinAllPostsDialog({
  theme,
  posts,
  open,
  onClose,
  onOpenPost,
}: BulletinAllPostsDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
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
            aria-labelledby="bulletin-all-posts-title"
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
              className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4"
              style={{
                backgroundColor: theme.infoBg,
                borderColor: theme.line,
              }}
            >
              <h2
                id="bulletin-all-posts-title"
                className="text-base font-semibold"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                School Bulletin
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 transition-colors hover:bg-black/[0.05]"
                aria-label="Close bulletin list"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-2.5">
                {posts.map((post) => (
                  <BulletinFeedItem
                    key={post.id}
                    theme={theme}
                    post={post}
                    onOpenDetail={() => {
                      onClose();
                      onOpenPost(post);
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
