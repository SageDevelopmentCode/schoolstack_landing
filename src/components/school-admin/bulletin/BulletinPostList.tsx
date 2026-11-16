"use client";

import { ChevronRight, Megaphone, Paperclip } from "lucide-react";
import { ROW_INTERACTIVE } from "@/components/school-admin/garden/kit";
import { BulletinStatusChip } from "@/components/school-admin/bulletin/bulletin-status";
import { formatBulletinDate } from "@/components/school-admin/bulletin/BulletinPostEditor";
import {
  formatBulletinAudiencesLabel,
  resolveBulletinDisplayStatus,
} from "@/lib/school-bulletin/bulletin-audience";
import type { BulletinPost, BulletinPostDisplayStatus, ProgramOption } from "@/lib/school-bulletin/types";

type BulletinPostListProps = {
  posts: BulletinPost[];
  programs: ProgramOption[];
  selectedPostId?: string | null;
  flashPostId?: string | null;
  onSelect: (postId: string) => void;
};

const ICON_TINTS: Record<BulletinPostDisplayStatus, string> = {
  active: "bg-[var(--sf-mint)]",
  scheduled: "bg-[var(--sf-sky)]",
  draft: "bg-[var(--sf-butter)]",
  expired: "bg-[var(--sf-peach)]",
  archived: "bg-[var(--sf-ink)]/[0.06]",
};

function whenLabel(post: BulletinPost, status: BulletinPostDisplayStatus): string {
  if (status === "scheduled") return `Publishes ${formatBulletinDate(post.publishedAt)}`;
  if (status === "expired") return `Expired ${formatBulletinDate(post.expiresAt)}`;
  if (status === "active" && post.expiresAt) return `Live until ${formatBulletinDate(post.expiresAt)}`;
  return `Updated ${formatBulletinDate(post.updatedAt)}`;
}

/** Garden rows: icon chip, title, audience · when · files, status chip, chevron. */
export default function BulletinPostList({
  posts,
  programs,
  selectedPostId,
  flashPostId,
  onSelect,
}: BulletinPostListProps) {
  const programNameById = new Map(programs.map((program) => [program.id, program.name]));

  return (
    <ul className="m-0 -mx-2 flex list-none flex-col gap-0.5 p-0" aria-label="Bulletin posts" data-testid="bulletin-post-list">
      {posts.map((post) => {
        const status = resolveBulletinDisplayStatus(post);
        const selected = selectedPostId === post.id;
        const flashed = flashPostId === post.id;
        const audience = formatBulletinAudiencesLabel(post.audiences, programNameById, post.programIds);
        return (
          <li key={post.id}>
            <button
              type="button"
              onClick={() => onSelect(post.id)}
              aria-current={selected ? "true" : undefined}
              className={`${ROW_INTERACTIVE} duration-300 ${
                flashed
                  ? "!bg-[var(--sf-mint)]"
                  : selected
                    ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-inset ring-[var(--sf-clay)]/35"
                    : ""
              }`}
              data-testid={`bulletin-row-${post.id}`}
            >
              <span
                aria-hidden
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/12 ${ICON_TINTS[status]}`}
              >
                <Megaphone className="h-4 w-4 text-[var(--sf-ink)]/70" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-extrabold text-[var(--sf-ink)]">
                  {post.title || "Untitled post"}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                  <span className="truncate">{audience}</span>
                  <span aria-hidden>·</span>
                  <span>{whenLabel(post, status)}</span>
                  {post.attachments.length > 0 ? (
                    <>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-0.5 tabular-nums">
                        <Paperclip className="h-3 w-3" aria-hidden />
                        {post.attachments.length}
                        <span className="sr-only"> {post.attachments.length === 1 ? "attachment" : "attachments"}</span>
                      </span>
                    </>
                  ) : null}
                </span>
              </span>
              <BulletinStatusChip status={status} />
              <ChevronRight
                aria-hidden
                className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/30 transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
