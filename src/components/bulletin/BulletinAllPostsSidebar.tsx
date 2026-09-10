"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import BulletinEmptyState from "@/components/bulletin/BulletinEmptyState";
import BulletinFeedItem from "@/components/bulletin/BulletinFeedItem";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type BulletinAllPostsSidebarProps = {
  theme: ParentThemeTokens;
  posts: BulletinPost[];
  bulletinEnabled?: boolean;
  open: boolean;
  onClose: () => void;
  onOpenPost: (post: BulletinPost) => void;
};

export default function BulletinAllPostsSidebar({
  theme,
  posts,
  bulletinEnabled = true,
  open,
  onClose,
  onOpenPost,
}: BulletinAllPostsSidebarProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100]"
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
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulletin-all-posts-title"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l"
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
              {posts.length > 0 ? (
                <div className="space-y-2.5">
                  {posts.map((post) => (
                    <BulletinFeedItem
                      key={post.id}
                      theme={theme}
                      post={post}
                      onOpenDetail={() => onOpenPost(post)}
                    />
                  ))}
                </div>
              ) : bulletinEnabled ? (
                <BulletinEmptyState
                  theme={theme}
                  title="No announcements right now"
                  subtitle="New updates from your school will show up here when they're posted."
                />
              ) : (
                <BulletinEmptyState
                  theme={theme}
                  title="No bulletin yet"
                  subtitle="Your school hasn't turned on announcements here. Check back later."
                />
              )}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
