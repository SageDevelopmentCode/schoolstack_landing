"use client";

import { Megaphone } from "lucide-react";
import BulletinAttachmentPreviewGrid from "@/components/bulletin/BulletinAttachmentPreviewGrid";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type BulletinFeedItemProps = {
  theme: ParentThemeTokens;
  post: BulletinPost;
  onOpenDetail: () => void;
};

function formatBulletinDate(value?: string): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function excerpt(body: string, maxLength = 80): string {
  const trimmed = body.trim();
  if (!trimmed) return "";
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}…`;
}

export default function BulletinFeedItem({
  theme,
  post,
  onOpenDetail,
}: BulletinFeedItemProps) {
  const preview = excerpt(post.body);
  const dateLabel = formatBulletinDate(post.publishedAt ?? post.createdAt);
  const canOpenDetail = Boolean(post.body.trim() || post.attachments.length > 0);

  return (
    <article
      className="rounded-lg border p-3"
      style={{
        borderColor: theme.line,
        backgroundColor: theme.white,
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.infoBg }}
        >
          <Megaphone className="h-3.5 w-3.5" style={{ color: theme.info }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-0.5">
            <strong
              className="block text-[13px] leading-snug"
              style={{ color: theme.ink }}
            >
              {post.title}
            </strong>
            {dateLabel ? (
              <span className="text-[11px]" style={{ color: theme.muted }}>
                {dateLabel}
              </span>
            ) : null}
          </div>
          {preview ? (
            <p
              className="mt-1.5 text-xs leading-relaxed"
              style={{ color: "#65747A" }}
            >
              {preview}
            </p>
          ) : null}
        </div>
      </div>
      {post.attachments.length > 0 ? (
        <div className="-mx-3 mt-2.5 w-[calc(100%+1.5rem)]">
          <BulletinAttachmentPreviewGrid
            theme={theme}
            attachments={post.attachments}
            onOpen={onOpenDetail}
          />
        </div>
      ) : null}
      {canOpenDetail ? (
        <div className="mt-2.5">
          <ParentTextLink theme={theme} onClick={onOpenDetail}>
            Read more
          </ParentTextLink>
        </div>
      ) : null}
    </article>
  );
}
