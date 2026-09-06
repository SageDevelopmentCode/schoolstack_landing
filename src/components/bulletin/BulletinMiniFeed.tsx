"use client";

import { useMemo, useState } from "react";
import { Megaphone, Paperclip } from "lucide-react";
import BulletinPostDetailSidebar from "@/components/bulletin/BulletinPostDetailSidebar";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type BulletinMiniFeedProps = {
  theme: ParentThemeTokens;
  posts: BulletinPost[];
  emptyMessage?: string;
};

function formatBulletinDate(value?: string): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function excerpt(body: string, maxLength = 120): string {
  const trimmed = body.trim();
  if (!trimmed) return "";
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}…`;
}

export default function BulletinMiniFeed({
  theme,
  posts,
  emptyMessage = "School announcements and updates will appear here when available.",
}: BulletinMiniFeedProps) {
  const [selectedPost, setSelectedPost] = useState<BulletinPost | null>(null);

  const visiblePosts = useMemo(() => posts.slice(0, 3), [posts]);

  if (visiblePosts.length === 0) {
    return (
      <p className="text-sm" style={{ color: theme.muted }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {visiblePosts.map((post) => {
          const preview = excerpt(post.body);
          const dateLabel = formatBulletinDate(post.publishedAt ?? post.createdAt);
          const canOpenDetail = Boolean(post.body.trim() || post.attachments.length > 0);

          return (
            <div
              key={post.id}
              className="rounded-2xl border px-3.5 py-3"
              style={{
                borderColor: theme.line,
                backgroundColor: theme.white,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.infoBg }}
                >
                  <Megaphone className="h-4 w-4" style={{ color: theme.info }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <strong className="block text-sm" style={{ color: theme.ink }}>
                      {post.title}
                    </strong>
                    {dateLabel ? (
                      <span className="shrink-0 text-xs" style={{ color: theme.muted }}>
                        {dateLabel}
                      </span>
                    ) : null}
                  </div>
                  {preview ? (
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: "#65747A" }}>
                      {preview}
                    </p>
                  ) : null}
                  {post.attachments.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setSelectedPost(post)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-80"
                      style={{ color: theme.muted }}
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      {post.attachments.length} file{post.attachments.length === 1 ? "" : "s"}
                    </button>
                  ) : null}
                  {canOpenDetail ? (
                    <div className="mt-3">
                      <ParentTextLink theme={theme} onClick={() => setSelectedPost(post)}>
                        Read more
                      </ParentTextLink>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BulletinPostDetailSidebar
        theme={theme}
        post={selectedPost}
        open={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
      />
    </>
  );
}
