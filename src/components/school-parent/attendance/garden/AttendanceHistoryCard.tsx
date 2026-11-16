"use client";

import { AlertTriangle, ArrowDown, Loader2, RotateCcw } from "lucide-react";
import ParentAttendanceHistoryList from "@/components/school-parent/attendance/ParentAttendanceHistoryList";
import {
  ATTENDANCE_STATUSES,
  attendanceStatusLabel,
  filterAttendanceEntries,
  type AttendanceFilter,
  type AttendanceStatusCounts,
} from "@/components/school-parent/attendance/attendance-format";
import type { ParentAttendanceHistoryModel } from "@/components/school-parent/attendance/useParentAttendanceHistory";
import { GCard, GChip, GTabBar, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";
import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";

/*
 * The history notebook: status filter → month-grouped days → load more /
 * end of history. Errors show inline with a retry (plus the hook's toast).
 */
export default function AttendanceHistoryCard({
  history,
  counts,
  filter,
  onFilterChange,
  selectedDate,
  onSelectEntry,
  previewMode,
}: {
  history: ParentAttendanceHistoryModel;
  counts: AttendanceStatusCounts;
  filter: AttendanceFilter;
  onFilterChange: (filter: AttendanceFilter) => void;
  selectedDate: string | null;
  onSelectEntry: (entry: AttendanceHistoryEntry) => void;
  previewMode: boolean;
}) {
  const {
    entries,
    totalCount,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMoreError,
    announcement,
    firstName,
    loadMore,
    retry,
  } = history;

  const visible = filterAttendanceEntries(entries, filter);
  const showFilters = !error && entries.length > 0;
  const filterLabel = filter === "all" ? "" : attendanceStatusLabel(filter).toLowerCase();

  return (
    <GCard
      index={2}
      kicker="History"
      title={`${firstName}'s history`}
      action={
        totalCount > 0 ? (
          <GChip tone="neutral" className="!text-[12px]">
            {entries.length} of {totalCount} days
          </GChip>
        ) : null
      }
      data-testid="parent-attendance-history-panel"
    >
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {showFilters ? (
        <div className="mb-4 flex flex-col gap-1.5">
          <GTabBar
            ariaLabel="Filter attendance history"
            activeKey={filter}
            onChange={(key) => onFilterChange(key as AttendanceFilter)}
            data-testid="parent-attendance-history-filter"
            items={[
              { key: "all", label: "All", suffix: <FilterCount value={entries.length} active={filter === "all"} /> },
              ...ATTENDANCE_STATUSES.map((status) => ({
                key: status,
                label: attendanceStatusLabel(status),
                suffix: <FilterCount value={counts[status]} active={filter === status} />,
                testId: `parent-attendance-history-filter-${status}`,
              })),
            ]}
          />
          {hasMore ? (
            <p className="m-0 text-[12px] font-semibold text-[var(--sf-soft)]">
              Counts cover the {entries.length} days loaded so far.
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-[18px] border-[1.5px] border-[#6b4f00]/20 bg-[var(--sf-butter)]/60 p-4 sm:flex-row sm:items-center"
          data-testid="parent-attendance-history-error"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-[#6b4f00]" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
              We couldn&apos;t load {firstName}&apos;s attendance
            </p>
            <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-ink)]/75">{error}</p>
          </div>
          <button
            type="button"
            className={`${gBtnOutlineSm} shrink-0`}
            onClick={retry}
            disabled={loading}
            aria-busy={loading || undefined}
            data-testid="parent-attendance-history-retry"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Trying again…" : "Try again"}
          </button>
        </div>
      ) : filter !== "all" && visible.length === 0 && !loading ? (
        <div
          className="flex flex-col items-start gap-2 rounded-[18px] bg-[var(--sf-paper)] p-5"
          data-testid="parent-attendance-history-filter-empty"
        >
          <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
            No {filterLabel} days in the history loaded so far
          </p>
          <button type="button" className={gLinkSm} onClick={() => onFilterChange("all")}>
            Show all days
          </button>
        </div>
      ) : (
        <ParentAttendanceHistoryList
          entries={visible}
          loading={loading}
          loadingMore={loadingMore}
          selectedDate={selectedDate}
          onSelectEntry={onSelectEntry}
        />
      )}

      {!error && entries.length > 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4">
          {!previewMode && hasMore ? (
            <>
              {loadMoreError ? (
                <p role="alert" className="m-0 text-center text-[13px] font-bold text-[#6b4f00]">
                  Couldn&apos;t load more days. {loadMoreError}
                </p>
              ) : null}
              <button
                type="button"
                className={gBtnOutlineSm}
                onClick={() => {
                  if (loadMoreError) retry();
                  else void loadMore();
                }}
                disabled={loadingMore}
                aria-busy={loadingMore || undefined}
                data-testid="parent-attendance-load-more"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Loading…
                  </>
                ) : loadMoreError ? (
                  <>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Try again
                  </>
                ) : (
                  <>
                    Load more
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
              <p className="m-0 text-[12px] font-semibold text-[var(--sf-soft)]">
                Showing {entries.length} of {totalCount} recorded days
              </p>
            </>
          ) : previewMode && totalCount > entries.length ? (
            <p className="m-0 text-center text-[13px] font-semibold text-[var(--sf-soft)]">
              Preview shows the latest {entries.length} of {totalCount} recorded days.
            </p>
          ) : (
            <p
              className="m-0 text-center text-[13px] font-semibold text-[var(--sf-soft)]"
              data-testid="parent-attendance-history-end"
            >
              That&apos;s every recorded day for {firstName} ({totalCount}{" "}
              {totalCount === 1 ? "day" : "days"}).
            </p>
          )}
        </div>
      ) : null}
    </GCard>
  );
}

function FilterCount({ value, active }: { value: number; active: boolean }) {
  return (
    <span
      className={`ml-0.5 rounded-full px-1.5 text-[11px] font-extrabold ${
        active ? "bg-white/25 text-white" : "bg-[var(--sf-ink)]/[0.06] text-[var(--sf-ink)]/70"
      }`}
    >
      {value}
    </span>
  );
}
