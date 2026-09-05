"use client";

import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import {
  formatBulletinAudiencesLabel,
  resolveBulletinDisplayStatus,
} from "@/lib/school-bulletin/bulletin-audience";
import type { BulletinPost, ProgramOption } from "@/lib/school-bulletin/types";

type BulletinPostListProps = {
  posts: BulletinPost[];
  programs: ProgramOption[];
  selectedPostId?: string | null;
  onSelect: (postId: string) => void;
};

function displayStatusChip(
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"],
  status: ReturnType<typeof resolveBulletinDisplayStatus>,
) {
  switch (status) {
    case "active":
      return (
        <AdminChip theme={theme} tone="success">
          Active
        </AdminChip>
      );
    case "scheduled":
      return (
        <AdminChip theme={theme} tone="info">
          Scheduled
        </AdminChip>
      );
    case "expired":
      return (
        <AdminChip theme={theme} tone="warning">
          Expired
        </AdminChip>
      );
    case "archived":
      return (
        <AdminChip theme={theme} tone="purple">
          Archived
        </AdminChip>
      );
    default:
      return (
        <AdminChip theme={theme} tone="info">
          Draft
        </AdminChip>
      );
  }
}

function formatPostDate(value?: string): string {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BulletinPostList({
  posts,
  programs,
  selectedPostId,
  onSelect,
}: BulletinPostListProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const programNameById = new Map(programs.map((program) => [program.id, program.name]));

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#DCE4DC] bg-[#FAFBFA] px-4 py-8 text-center">
        <p className="text-sm font-medium text-[#1E2A24]">No bulletin posts yet</p>
        <p className="mt-1 text-sm text-[#65747A]">
          Create your first announcement for families and staff.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => {
        const displayStatus = resolveBulletinDisplayStatus(post);
        const selected = selectedPostId === post.id;

        return (
          <button
            key={post.id}
            type="button"
            onClick={() => onSelect(post.id)}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
              selected
                ? "border-[#4A6741] bg-[#F3F7F3] shadow-sm"
                : "border-[#DCE4DC] bg-white hover:border-[#B8C7B8]"
            }`}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <strong className="block text-sm text-[#1E2A24]">{post.title}</strong>
              {displayStatusChip(theme, displayStatus)}
            </div>
            <p className="text-xs text-[#65747A]">
              {formatBulletinAudiencesLabel(
                post.audiences,
                programNameById,
                post.programIds,
              )}
            </p>
            <p className="mt-1 text-xs text-[#78858A]">
              {displayStatus === "scheduled"
                ? `Publishes ${formatPostDate(post.publishedAt)}`
                : `Updated ${formatPostDate(post.updatedAt)}`}
            </p>
          </button>
        );
      })}
    </div>
  );
}
