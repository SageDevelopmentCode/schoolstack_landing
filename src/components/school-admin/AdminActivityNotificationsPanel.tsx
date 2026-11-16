"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Heart,
  Loader2,
  MessageSquare,
  RotateCw,
  type LucideIcon,
} from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GChip, GSkeleton, gLinkSm } from "@/components/school-parent/garden/ui";
import {
  GardenEmptyState,
  GardenFilterChips,
  GardenLoadError,
  ROW_INTERACTIVE,
  gBtnOutlineXs,
  useRelativeTime,
} from "@/components/school-admin/garden/kit";
import { GardenGroupHeading } from "@/components/school-admin/garden/blocks";
import {
  useActivityNotifications,
  useInfiniteScroll,
} from "@/components/school-admin/activity/useActivityNotifications";
import {
  ACTIVITY_NOTIFICATION_DAYS,
  formatRelativeTime,
  type ActivityNotificationCategory,
  type SchoolAdminActivityNotification,
} from "@/lib/school-admin/activity-notifications";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminActivityNotificationsPanelProps = {
  /** Story theme tokens (school accent + fonts) for the Garden drawer. */
  theme: ParentThemeTokens;
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onMarkedRead?: () => void;
  /** Unread count when the drawer opened: the newest N rows get a "New" marker. */
  newCount?: number;
};

/* ------------------------------------------------------------------ */
/* Category look                                                       */
/* ------------------------------------------------------------------ */

const CATEGORY_VISUAL: Record<
  ActivityNotificationCategory,
  { Icon: LucideIcon; tint: string; label: string }
> = {
  applications: { Icon: ClipboardList, tint: "bg-[var(--sf-butter)]", label: "Admissions" },
  enrollment: { Icon: GraduationCap, tint: "bg-[var(--sf-mint)]", label: "Enrollment" },
  payments: { Icon: CreditCard, tint: "bg-[var(--sf-sky)]", label: "Payments" },
  committees: { Icon: Heart, tint: "bg-[var(--sf-peach)]", label: "Community" },
  program_signups: { Icon: CalendarDays, tint: "bg-[var(--sf-butter)]", label: "Program sign-ups" },
  messages: { Icon: MessageSquare, tint: "bg-[var(--sf-lav)]", label: "Messages" },
  other: { Icon: Bell, tint: "bg-[var(--sf-ink)]/[0.06]", label: "School" },
};

const CATEGORY_ORDER: ActivityNotificationCategory[] = [
  "applications",
  "enrollment",
  "payments",
  "program_signups",
  "messages",
  "committees",
  "other",
];

function categoryVisual(category: ActivityNotificationCategory) {
  return CATEGORY_VISUAL[category] ?? CATEGORY_VISUAL.other;
}

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

const DOLLAR_AMOUNT_PATTERN = /(\$[\d,]+(?:\.\d{2})?)/g;

function renderEmphasizedText(text: string) {
  return text.split(DOLLAR_AMOUNT_PATTERN).map((part, index) =>
    part.startsWith("$") ? (
      <span key={index} className="font-extrabold tabular-nums text-[var(--sf-ink)]">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Bold the guardian or student name the detail starts with, plus $ amounts. */
function NotificationDetailText({
  notification,
}: {
  notification: SchoolAdminActivityNotification;
}) {
  const { detail, guardianLabel, subjectLabel } = notification;
  const lead =
    guardianLabel && detail.startsWith(guardianLabel)
      ? guardianLabel
      : subjectLabel && detail.startsWith(subjectLabel)
        ? subjectLabel
        : null;
  return (
    <span className="line-clamp-2 text-[14px] font-semibold leading-snug text-[var(--sf-ink)]/85">
      {lead ? (
        <>
          <span className="font-extrabold text-[var(--sf-ink)]">{lead}</span>
          {renderEmphasizedText(detail.slice(lead.length))}
        </>
      ) : (
        renderEmphasizedText(detail)
      )}
    </span>
  );
}

function ctaText(label: string): string {
  return label.replace(/\s*(→|->)\s*$/, "").trim();
}

/* ------------------------------------------------------------------ */
/* Day groups                                                          */
/* ------------------------------------------------------------------ */

type DayGroupKey = "today" | "yesterday" | "week" | "older";

const DAY_GROUP_LABEL: Record<DayGroupKey, string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "Earlier this week",
  older: "Older",
};

function startOfDay(ms: number): number {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function dayGroupOf(iso: string, todayStart: number): DayGroupKey {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time) || time >= todayStart) return "today";
  const day = 24 * 60 * 60 * 1000;
  if (time >= todayStart - day) return "yesterday";
  if (time >= todayStart - 6 * day) return "week";
  return "older";
}

/* ------------------------------------------------------------------ */
/* Rows                                                                */
/* ------------------------------------------------------------------ */

function NotificationRow({
  notification,
  isNew,
  onNavigate,
}: {
  notification: SchoolAdminActivityNotification;
  isNew: boolean;
  onNavigate: () => void;
}) {
  const { Icon, tint, label } = categoryVisual(notification.category);
  const cta = ctaText(notification.ctaLabel || "Open");
  return (
    <li>
      <Link
        href={notification.href}
        onClick={onNavigate}
        data-testid="admin-activity-row"
        data-new={isNew ? "true" : undefined}
        className={`${ROW_INTERACTIVE} relative !items-start no-underline ${
          isNew ? "bg-[var(--sf-accent-wash)]/55" : ""
        }`}
      >
        {isNew ? (
          <span
            aria-hidden
            className="absolute bottom-3 left-0 top-3 w-[3px] rounded-full bg-[var(--sf-clay)]"
          />
        ) : null}
        <span
          aria-hidden
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/10 ${tint}`}
        >
          <Icon className="h-4 w-4 text-[var(--sf-ink)]/75" />
        </span>
        <span className="min-w-0 flex-1">
          <NotificationDetailText notification={notification} />
          <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] font-bold text-[var(--sf-ink)]/45">
            {isNew ? (
              <GChip tone="alert" className="!px-2 !py-0 !text-[11px]">
                New
              </GChip>
            ) : null}
            <span>{formatRelativeTime(notification.createdAt)}</span>
            <span aria-hidden>·</span>
            <span>{label}</span>
          </span>
        </span>
        <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-[12.5px] font-extrabold text-[var(--sf-clay-deep)]">
          <span className="hidden opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:inline">
            {cta}
          </span>
          <ChevronRight
            className="h-4 w-4 text-[var(--sf-ink)]/35 transition-colors group-hover:text-[var(--sf-clay-deep)]"
            aria-hidden
          />
        </span>
      </Link>
    </li>
  );
}

function ActivitySkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-2">
      <span className="sr-only">Loading activity…</span>
      <GSkeleton className="h-3 w-20 !rounded-full" />
      <div className="flex flex-col gap-1 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="flex items-start gap-3 px-3 py-3" aria-hidden>
            <GSkeleton className="h-9 w-9 shrink-0 !rounded-[12px]" />
            <div className="min-w-0 flex-1">
              <GSkeleton className={`h-3.5 !rounded-full ${index % 2 ? "w-3/5" : "w-4/5"}`} />
              <GSkeleton className="mt-2 h-2.5 w-24 !rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpdatedLabel({ at }: { at: number }) {
  const relative = useRelativeTime(at);
  return (
    <span className="text-[12px] font-bold text-[var(--sf-ink)]/45" aria-live="polite">
      Updated {relative}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

export default function AdminActivityNotificationsPanel({
  theme,
  open,
  onClose,
  organizationId,
  onMarkedRead,
  newCount = 0,
}: AdminActivityNotificationsPanelProps) {
  const model = useActivityNotifications({ organizationId, open, onMarkedRead });
  const {
    notifications,
    loading,
    loadingMore,
    refreshing,
    loadError,
    loadMoreError,
    hasMore,
    lastLoadedAt,
  } = model;

  // The shell resets its unread count once mark-read lands; keep the count the
  // admin opened the drawer with so the newest rows stay marked.
  const [newCountAtOpen] = useState(() => Math.max(0, newCount));
  const [filter, setFilter] = useState<string>("all");

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const newIds = useMemo(
    () => new Set(notifications.slice(0, newCountAtOpen).map((item) => item.id)),
    [newCountAtOpen, notifications],
  );

  const presentCategories = useMemo(() => {
    const seen = new Set(notifications.map((item) => item.category));
    return CATEGORY_ORDER.filter((category) => seen.has(category));
  }, [notifications]);

  const activeFilter =
    filter !== "all" && presentCategories.includes(filter as ActivityNotificationCategory)
      ? (filter as ActivityNotificationCategory)
      : "all";

  const visible = useMemo(
    () =>
      activeFilter === "all"
        ? notifications
        : notifications.filter((item) => item.category === activeFilter),
    [activeFilter, notifications],
  );

  const groups = useMemo(() => {
    const todayStart = startOfDay(lastLoadedAt ?? 0);
    const result: { key: DayGroupKey; items: SchoolAdminActivityNotification[] }[] = [];
    for (const item of visible) {
      const key = dayGroupOf(item.createdAt, todayStart);
      const last = result[result.length - 1];
      if (last && last.key === key) last.items.push(item);
      else result.push({ key, items: [item] });
    }
    return result;
  }, [lastLoadedAt, visible]);

  useInfiniteScroll({
    enabled: open && hasMore && !loading && !loadingMore && !loadMoreError && !loadError,
    rootRef: bodyRef,
    sentinelRef,
    onReachEnd: () => void model.loadMore(),
    watch: notifications.length,
  });

  const showFilters = !loadError && presentCategories.length > 1;
  const newShown = Math.min(newCountAtOpen, notifications.length);

  const headerAside = (
    <div className="flex flex-wrap items-center gap-2">
      {newShown > 0 ? (
        <GChip tone="alert" className="tabular-nums">
          ● {newShown} new
        </GChip>
      ) : null}
      <button
        type="button"
        onClick={() => void model.refresh()}
        disabled={loading || refreshing}
        aria-busy={refreshing || undefined}
        className={gBtnOutlineXs}
        data-testid="admin-activity-refresh"
      >
        <RotateCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>
      {lastLoadedAt ? <UpdatedLabel at={lastLoadedAt} /> : null}
    </div>
  );

  const filterOptions = [
    { key: "all", label: "All" },
    ...presentCategories.map((category) => ({
      key: category,
      label: categoryVisual(category).label,
    })),
  ];

  let body: React.ReactNode;
  if (loading && notifications.length === 0) {
    body = <ActivitySkeleton />;
  } else if (loadError) {
    body = (
      <GardenLoadError
        title="Couldn't load activity"
        description={
          loadError === "Failed to load activity."
            ? "Your activity is safe. Try again in a moment."
            : `${loadError} Your activity is safe — try again in a moment.`
        }
        onRetry={() => void model.reload()}
        retrying={loading}
      />
    );
  } else if (notifications.length === 0) {
    body = (
      <GardenEmptyState
        icon={Bell}
        tint="bg-[var(--sf-mint)]"
        title="No recent activity yet"
        description="New applications, payments, and enrollment updates will show up here."
        data-testid="admin-activity-empty"
      />
    );
  } else {
    body = (
      <>
        {visible.length === 0 ? (
          <GardenEmptyState
            title={`No ${categoryVisual(activeFilter as ActivityNotificationCategory).label.toLowerCase()} updates in what's loaded.`}
            description={hasMore ? "Scroll to load older activity, or show everything." : undefined}
            action={
              <button type="button" onClick={() => setFilter("all")} className={gLinkSm}>
                Show everything
              </button>
            }
          />
        ) : (
          groups.map((group, index) => (
            <section key={`${group.key}-${index}`} aria-label={DAY_GROUP_LABEL[group.key]}>
              <GardenGroupHeading>{DAY_GROUP_LABEL[group.key]}</GardenGroupHeading>
              <ul className="m-0 flex list-none flex-col divide-y divide-[var(--sf-ink)]/[0.07] rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-1">
                {group.items.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    isNew={newIds.has(notification.id)}
                    onNavigate={onClose}
                  />
                ))}
              </ul>
            </section>
          ))
        )}

        <div ref={sentinelRef} className="h-px shrink-0" aria-hidden />

        <div aria-live="polite" className="shrink-0">
          {loadingMore ? (
            <p className="m-0 flex items-center justify-center gap-2 py-2 text-[13px] font-bold text-[var(--sf-soft)]">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--sf-clay)]" aria-hidden />
              Loading more activity…
            </p>
          ) : loadMoreError ? (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] border-[1.5px] border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-paper)] px-3.5 py-2.5"
            >
              <span className="text-[13px] font-bold text-[var(--sf-ink)]/80">
                Couldn&apos;t load older activity.
              </span>
              <button
                type="button"
                onClick={() => void model.retryLoadMore()}
                className={gBtnOutlineXs}
              >
                <RotateCw className="h-3.5 w-3.5" aria-hidden />
                Try again
              </button>
            </div>
          ) : !hasMore ? (
            <p className="m-0 flex items-center justify-center gap-1.5 py-2 text-[12.5px] font-bold text-[var(--sf-ink)]/45">
              <Check className="h-3.5 w-3.5 text-[var(--sf-forest)]" aria-hidden />
              That&apos;s everything from the last {ACTIVITY_NOTIFICATION_DAYS} days.
            </p>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <GSidePanel
      theme={theme}
      open={open}
      onClose={onClose}
      panelId="admin-activity-notifications"
      testId="admin-activity-panel"
      kicker="School activity"
      title="Activity"
      subtitle="Recent admissions and enrollment updates"
      headerAside={headerAside}
      headerBelow={
        showFilters ? (
          <GardenFilterChips
            ariaLabel="Filter activity"
            options={filterOptions}
            value={activeFilter}
            onChange={setFilter}
            className="-mx-1 !flex-nowrap overflow-x-auto px-1 py-1 [scrollbar-width:none] [&>button]:shrink-0"
          />
        ) : undefined
      }
      bodyRef={bodyRef}
      closeLabel="Close activity"
    >
      {body}
    </GSidePanel>
  );
}
