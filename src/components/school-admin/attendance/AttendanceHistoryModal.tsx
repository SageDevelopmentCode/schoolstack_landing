"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";
import AttendanceHistoryList from "./AttendanceHistoryList";

const PAGE_SIZE = 20;

type AttendanceHistoryModalProps = {
  open: boolean;
  organizationId: string;
  studentId: string;
  studentName: string;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  highlightDate?: string | null;
  onClose: () => void;
};

export default function AttendanceHistoryModal({
  open,
  organizationId,
  studentId,
  studentName,
  theme,
  C,
  highlightDate,
  onClose,
}: AttendanceHistoryModalProps) {
  const [page, setPage] = useState(0);
  const [entries, setEntries] = useState<AttendanceHistoryEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (pageIndex: number) => {
      setLoading(true);
      setError(null);
      try {
        const offset = pageIndex * PAGE_SIZE;
        const response = await fetch(
          `/api/school-admin/attendance/history?organizationId=${encodeURIComponent(organizationId)}&studentId=${encodeURIComponent(studentId)}&limit=${PAGE_SIZE}&offset=${offset}`,
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

        setEntries(payload?.entries ?? []);
        setTotalCount(payload?.totalCount ?? 0);
        setHasMore(payload?.hasMore ?? false);
        setPage(pageIndex);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load attendance history.");
        setEntries([]);
        setTotalCount(0);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [organizationId, studentId],
  );

  useEffect(() => {
    if (!open) return;
    void loadPage(0);
  }, [open, loadPage]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rangeStart = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(totalCount, page * PAGE_SIZE + entries.length);

  const titleId = "attendance-history-modal-title";

  return (
    <SchoolAdminModalShell
      open={open}
      onClose={onClose}
      maxWidth="2xl"
      zIndex={120}
      ariaLabelledBy={titleId}
      testId="attendance-history-modal"
      panelClassName="flex max-h-[min(90vh,40rem)] flex-col overflow-hidden"
      panelStyle={{
        backgroundColor: C.surface,
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        className="flex flex-shrink-0 items-start justify-between gap-3 border-b px-5 py-4"
        style={{ borderColor: C.border }}
      >
        <div className="min-w-0">
          <h2 id={titleId} className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            {studentName} — Attendance history
          </h2>
          {totalCount > 0 ? (
            <p className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
              Showing {rangeStart}–{rangeEnd} of {totalCount}
            </p>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
        {error ? (
          <p className="py-4 text-sm" style={{ color: C.error }}>{error}</p>
        ) : (
          <AttendanceHistoryList
            entries={entries}
            C={C}
            loading={loading}
            highlightDate={highlightDate}
          />
        )}
      </div>

      <div
        className="flex flex-shrink-0 items-center justify-between gap-3 border-t px-5 py-4"
        style={{ borderColor: C.border, backgroundColor: C.elevated }}
      >
        <p className="text-[11px]" style={{ color: C.textTertiary }}>
          Page {page + 1} of {totalPages}
        </p>
        <div className="flex gap-2">
          <AdminButton
            theme={theme}
            variant="outline"
            type="button"
            disabled={loading || page === 0}
            onClick={() => void loadPage(page - 1)}
          >
            Previous
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="outline"
            type="button"
            disabled={loading || !hasMore}
            onClick={() => void loadPage(page + 1)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 inline h-4 w-4 animate-spin" aria-hidden />
                Loading…
              </>
            ) : (
              "Next"
            )}
          </AdminButton>
        </div>
      </div>
    </SchoolAdminModalShell>
  );
}
