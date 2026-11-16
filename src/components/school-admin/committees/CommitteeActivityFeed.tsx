"use client";

import Link from "next/link";
import type { AdminChipTone } from "@/components/school-admin/ui/story/AdminChip";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { CommitteeActivityItem } from "@/lib/committees/activity-feed";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";
import { ArrowRight } from "lucide-react";
import { GChip, G_FOCUS, gLinkSm, type GChipTone } from "@/components/school-parent/garden/ui";
import { useIsGardenCommittee } from "./committee-surface";

const GARDEN_CATEGORY_TONE: Record<CommitteeActivityItem["category"], GChipTone> = {
  Members: "success",
  Tasks: "info",
  Resources: "neutral",
  Calendar: "warning",
  Messages: "info",
  Roles: "alert",
  Projects: "success",
};

/** Garden activity list (parent/teacher workspace): notebook rows with a category chip. */
function GardenActivityFeed({
  items,
  compact,
  showCommitteeName,
  onViewAll,
  onItemClick,
  emptyMessage,
  title,
}: Omit<CommitteeActivityFeedProps, "theme">) {
  return (
    <div>
      {(title || onViewAll) && (
        <div className="mb-3 flex items-end justify-between gap-3">
          {title ? <h3 className="sf-display m-0 text-[1.3rem] leading-[1.05] text-[var(--sf-ink)]">{title}</h3> : <span />}
          {onViewAll ? (
            <button type="button" className={gLinkSm} onClick={onViewAll}>
              View all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      )}
      {items.length === 0 ? (
        <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">{emptyMessage}</p>
      ) : (
        <ul
          className={`m-0 list-none divide-y-[1.5px] divide-dashed divide-[var(--sf-ink)]/10 p-0 ${compact ? "max-h-72 overflow-y-auto pr-1" : ""}`}
        >
          {items.map((item) => {
            const meta = [item.actorName, formatRelativeTime(item.createdAt)].filter(Boolean).join(" · ");
            const content = (
              <>
                <GChip tone={GARDEN_CATEGORY_TONE[item.category]} className="mt-0.5">
                  {item.category}
                </GChip>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold leading-snug text-[var(--sf-ink)]">
                    {showCommitteeName && item.committeeName ? (
                      <span className="text-[var(--sf-clay-deep)]">{item.committeeName} · </span>
                    ) : null}
                    {item.summary}
                  </span>
                  {meta ? (
                    <span className="mt-0.5 block text-[12.5px] font-semibold text-[var(--sf-soft)]">{meta}</span>
                  ) : null}
                </span>
              </>
            );
            return (
              <li key={item.id}>
                {onItemClick ? (
                  <button
                    type="button"
                    onClick={() => onItemClick(item)}
                    className={`flex w-full items-start gap-3 rounded-[12px] px-1 py-2.5 text-left hover:bg-[var(--sf-accent-wash)] ${G_FOCUS} focus-visible:ring-inset`}
                  >
                    {content}
                  </button>
                ) : (
                  <div className="flex items-start gap-3 px-1 py-2.5">
                    {content}
                    {item.href ? (
                      <Link href={item.href} className={`${gLinkSm} shrink-0 text-[13px]`}>
                        View <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const CATEGORY_TONE: Record<CommitteeActivityItem["category"], AdminChipTone> = {
  Members: "success",
  Tasks: "info",
  Resources: "purple",
  Calendar: "warning",
  Messages: "info",
  Roles: "alert",
  Projects: "success",
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
  const garden = useIsGardenCommittee();
  if (garden) {
    return (
      <GardenActivityFeed
        items={items}
        compact={compact}
        showCommitteeName={showCommitteeName}
        onViewAll={onViewAll}
        onItemClick={onItemClick}
        emptyMessage={emptyMessage}
        title={title}
      />
    );
  }
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
