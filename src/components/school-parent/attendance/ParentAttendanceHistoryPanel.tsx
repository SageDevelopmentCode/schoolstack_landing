"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ParentAttendanceHistoryDetailSidebar from "@/components/school-parent/attendance/ParentAttendanceHistoryDetailSidebar";
import ParentAttendanceHistoryList from "@/components/school-parent/attendance/ParentAttendanceHistoryList";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type {
  AttendanceHistoryEntry,
  AttendanceHistoryResponse,
} from "@/lib/school-admin/attendance/attendance-types";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

const PAGE_SIZE = 20;

type ParentAttendanceHistoryPanelProps = {
  organizationId: string;
  studentId: string;
  studentName: string;
  previewMode?: boolean;
  initialHistory?: AttendanceHistoryResponse;
};

export default function ParentAttendanceHistoryPanel({
  organizationId,
  studentId,
  studentName,
  previewMode = false,
  initialHistory,
}: ParentAttendanceHistoryPanelProps) {
  const { theme } = useParentTheme();
  const [entries, setEntries] = useState<AttendanceHistoryEntry[]>(
    initialHistory?.entries ?? [],
  );
  const [totalCount, setTotalCount] = useState(initialHistory?.totalCount ?? 0);
  const [hasMore, setHasMore] = useState(
    previewMode ? false : (initialHistory?.hasMore ?? false),
  );
  const [loading, setLoading] = useState(!previewMode && !initialHistory);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AttendanceHistoryEntry | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setSelectedEntry(null);
    });
  }, [studentId]);

  const loadHistory = useCallback(
    async (offset: number, append: boolean) => {
      if (previewMode) {
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await fetch(
          `/api/parent-portal/students/${encodeURIComponent(studentId)}/attendance/history?organizationId=${encodeURIComponent(organizationId)}&limit=${PAGE_SIZE}&offset=${offset}`,
        );
        const payload = (await response.json().catch(() => null)) as {
          entries?: AttendanceHistoryEntry[];
          totalCount?: number;
          hasMore?: boolean;
          error?: string;
        } | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to load attendance history.");
        }

        const nextEntries = payload?.entries ?? [];
        setEntries((current) => (append ? [...current, ...nextEntries] : nextEntries));
        setTotalCount(payload?.totalCount ?? 0);
        setHasMore(payload?.hasMore ?? false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load attendance history.";
        setError(message);
        if (!append) {
          setEntries([]);
          setTotalCount(0);
          setHasMore(false);
        }
        void reportPortalOperationalError(
          "parent_portal",
          {
            organizationId,
            operation: "attendance.load_history",
            error: "",
            entityType: "student",
            entityId: studentId,
          },
          err,
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [organizationId, previewMode, studentId],
  );

  useEffect(() => {
    if (previewMode) {
      queueMicrotask(() => {
        setEntries(initialHistory?.entries ?? []);
        setTotalCount(initialHistory?.totalCount ?? 0);
        setHasMore(false);
        setLoading(false);
        setError(null);
      });
      return;
    }

    queueMicrotask(() => {
      void loadHistory(0, false);
    });
  }, [initialHistory, loadHistory, previewMode, studentId]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    void loadHistory(entries.length, true);
  };

  const firstName = studentName.trim().split(/\s+/)[0] ?? studentName;

  return (
    <>
      <ParentCard theme={theme} data-testid="parent-attendance-history-panel">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-bold" style={{ color: theme.ink }}>
            {firstName}&apos;s history
          </h2>
          {totalCount > 0 ? (
            <p className="text-[11px]" style={{ color: theme.muted }}>
              {entries.length} of {totalCount}
            </p>
          ) : null}
        </div>

        {error ? (
          <p className="py-2 text-[13px]" style={{ color: theme.alert }} data-testid="parent-attendance-history-error">
            {error}
          </p>
        ) : (
          <ParentAttendanceHistoryList
            entries={entries}
            theme={theme}
            loading={loading}
            loadingMore={loadingMore}
            onSelectEntry={setSelectedEntry}
          />
        )}

        {!previewMode && hasMore ? (
          <div className="mt-4 flex justify-center">
            <ParentButton
              theme={theme}
              variant="outline"
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              data-testid="parent-attendance-load-more"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-1.5 inline h-4 w-4 animate-spin" aria-hidden />
                  Loading…
                </>
              ) : (
                "Load more"
              )}
            </ParentButton>
          </div>
        ) : null}
      </ParentCard>

      <ParentAttendanceHistoryDetailSidebar
        open={selectedEntry !== null}
        entry={selectedEntry}
        studentName={studentName}
        onClose={() => setSelectedEntry(null)}
      />
    </>
  );
}
