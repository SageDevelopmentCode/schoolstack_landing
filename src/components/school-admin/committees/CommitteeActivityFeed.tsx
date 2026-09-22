"use client";

import Link from "next/link";
import type { AdminChipTone } from "@/components/school-admin/ui/story/AdminChip";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { CommitteeActivityItem } from "@/lib/committees/activity-feed";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";

const CATEGORY_TONE: Record<CommitteeActivityItem["category"], AdminChipTone> = {
  Members: "success",
  Tasks: "info",
  Resources: "purple",
  Calendar: "warning",
  Messages: "info",
  Roles: "alert",
};

type CommitteeActivityFeedProps = {
  theme: ParentThemeTokens;
  items: CommitteeActivityItem[];
  compact?: boolean;
  showCommitteeName?: boolean;
  onViewAll?: () => void;
  onItemClick?: (item: CommitteeActivityItem) => void;
  emptyMessage?: string;
  title?: string;
};

function ActivityFeedRow({
  item,
  theme,
  showCommitteeName,
  onItemClick,
}: {
  item: CommitteeActivityItem;
  theme: ParentThemeTokens;
  showCommitteeName: boolean;
  onItemClick?: (item: CommitteeActivityItem) => void;
}) {
  const metaLine = [item.actorName, formatRelativeTime(item.createdAt)]
    .filter(Boolean)
    .join(" · ");

  const row = (
    <div
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-2.5 py-2 ${
        onItemClick ? "cursor-pointer transition-colors hover:bg-[#FAFBFA]" : ""
      }`}
    >
      <AdminChip theme={theme} tone={CATEGORY_TONE[item.category]}>
        {item.category}
      </AdminChip>
      <div className="min-w-0">
        <p className="truncate text-xs leading-snug" style={{ color: theme.ink }}>
          {showCommitteeName && item.committeeName ? (
            <>
              <span className="font-semibold" style={{ color: theme.primary }}>
                {item.committeeName}
              </span>
              <span style={{ color: theme.muted }}> · </span>
            </>
          ) : null}
          {item.summary}
        </p>
        {metaLine ? (
          <p className="truncate text-[11px] leading-snug" style={{ color: theme.muted }}>
            {metaLine}
          </p>
        ) : null}
      </div>
      {item.href && !onItemClick ? (
        <Link
          href={item.href}
          className="shrink-0 text-[11px] font-extrabold no-underline"
          style={{ color: theme.primary }}
        >
          View →
        </Link>
      ) : null}
    </div>
  );

  if (onItemClick) {
    return (
      <button
        type="button"
        className="block w-full border-0 bg-transparent p-0 text-left"
        onClick={() => onItemClick(item)}
      >
        {row}
      </button>
    );
  }

  return row;
}

export default function CommitteeActivityFeed({
  theme,
  items,
  compact = false,
  showCommitteeName = false,
  onViewAll,
  onItemClick,
  emptyMessage = "No recent activity yet.",
  title = "Recent activity",
}: CommitteeActivityFeedProps) {
  return (
    <div>
      {(title || onViewAll) && (
        <div className="mb-2 flex items-center justify-between gap-3">
          {title ? (
            <AdminDisplayHeading theme={theme} as="h3" size="section">
              {title}
            </AdminDisplayHeading>
          ) : (
            <span />
          )}
          {onViewAll ? (
            <AdminTextLink theme={theme} onClick={onViewAll}>
              View all →
            </AdminTextLink>
          ) : null}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-xs" style={{ color: theme.muted }}>
          {emptyMessage}
        </p>
      ) : (
        <div
          className={
            compact
              ? "max-h-64 divide-y overflow-y-auto pr-1"
              : "divide-y"
          }
          style={{ borderColor: "#EDF1ED" }}
        >
          {items.map((item) => (
            <div key={item.id} style={{ borderColor: "#EDF1ED" }}>
              <ActivityFeedRow
                item={item}
                theme={theme}
                showCommitteeName={showCommitteeName}
                onItemClick={onItemClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
