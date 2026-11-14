"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { childFirstName } from "@/components/school-parent/children/parent-children-utils";
import type {
  AttendanceHistoryEntry,
  AttendanceHistoryResponse,
} from "@/lib/school-admin/attendance/attendance-types";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { parentToast } from "@/lib/school-parent/parent-toast";

export const ATTENDANCE_PAGE_SIZE = 20;

export type ParentAttendanceHistoryOptions = {
  organizationId: string;
  studentId: string;
  studentName: string;
  previewMode?: boolean;
  initialHistory?: AttendanceHistoryResponse;
};

/**
 * One child's paged attendance history (same API, page size and preview
 * behaviour as before) plus Garden feedback: a toast with Retry on failure,
 * a confirmation once a retry works, and an aria-live announcement after
 * "Load more". A failed "Load more" keeps the days already shown.
 */
export function useParentAttendanceHistory({
  organizationId,
  studentId,
  studentName,
  previewMode = false,
  initialHistory,
}: ParentAttendanceHistoryOptions) {
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
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const firstName = childFirstName(studentName);
  const toastId = `parent-attendance-load-${studentId}`;
  const failedRef = useRef(false);
  const retryRef = useRef<() => void>(() => {});

  const loadHistory = useCallback(
    async (offset: number, append: boolean): Promise<AttendanceHistoryEntry[] | null> => {
      if (previewMode) {
        return null;
      }

      if (append) {
        setLoadingMore(true);
        setLoadMoreError(null);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const response = await fetch(
          `/api/parent-portal/students/${encodeURIComponent(studentId)}/attendance/history?organizationId=${encodeURIComponent(organizationId)}&limit=${ATTENDANCE_PAGE_SIZE}&offset=${offset}`,
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

        if (append) {
          setAnnouncement(
            nextEntries.length === 1
              ? "Loaded 1 more day."
              : `Loaded ${nextEntries.length} more days.`,
          );
        }
        if (failedRef.current) {
          failedRef.current = false;
          // Replace the error toast (a fresh id, so its "Try again" action doesn't carry over).
          parentToast.dismiss(toastId);
          parentToast.success(append ? "More days loaded" : `${firstName}'s attendance is back`, {
            id: `${toastId}-ok`,
            description: append
              ? `Added ${nextEntries.length} more ${nextEntries.length === 1 ? "day" : "days"} to the list.`
              : "Everything loaded this time.",
          });
        }
        return nextEntries;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load attendance history.";
        failedRef.current = true;
        if (append) {
          // Keep the days already on screen; only the next page failed.
          setLoadMoreError(message);
        } else {
          setError(message);
          setEntries([]);
          setTotalCount(0);
          setHasMore(false);
        }
        parentToast.error(
          append ? "Couldn't load more days" : `Couldn't load ${firstName}'s attendance`,
          {
            id: toastId,
            description: `${message} Check your connection, then try again.`,
            action: { label: "Try again", onClick: () => retryRef.current() },
          },
        );
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
        return null;
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [firstName, organizationId, previewMode, studentId, toastId],
  );

  useEffect(() => {
    if (previewMode) {
      queueMicrotask(() => {
        setEntries(initialHistory?.entries ?? []);
        setTotalCount(initialHistory?.totalCount ?? 0);
        setHasMore(false);
        setLoading(false);
        setError(null);
        setLoadMoreError(null);
      });
      return;
    }

    queueMicrotask(() => {
      void loadHistory(0, false);
    });
  }, [initialHistory, loadHistory, previewMode, studentId]);

  // Leaving the child (or the page) clears a stale error toast for it.
  useEffect(
    () => () => {
      parentToast.dismiss(toastId);
      parentToast.dismiss(`${toastId}-ok`);
    },
    [toastId],
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return null;
    return loadHistory(entries.length, true);
  }, [entries.length, hasMore, loadHistory, loadingMore]);

  const retry = useCallback(() => {
    if (loadMoreError && entries.length > 0) {
      void loadHistory(entries.length, true);
      return;
    }
    void loadHistory(0, false);
  }, [entries.length, loadHistory, loadMoreError]);

  useEffect(() => {
    retryRef.current = retry;
  }, [retry]);

  return {
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
  };
}

export type ParentAttendanceHistoryModel = ReturnType<typeof useParentAttendanceHistory>;
