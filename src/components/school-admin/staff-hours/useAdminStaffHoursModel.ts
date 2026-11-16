"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAdminAction } from "@/components/school-admin/garden/useAdminAction";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { useAdminNavCounts } from "@/lib/school-admin/admin-nav-counts-context";
import {
  parseOperationalError,
  reportClientOperationalError,
  shouldReportPortalClientError,
} from "@/lib/operational-errors-client";
import { isBenignPortalErrorCode } from "@/lib/portal-operational-errors";
import { portalJsonApiErrorCode, portalJsonApiErrorStatus } from "@/lib/portal-json-api-error";
import {
  fetchAdminStaffHoursPageData,
  patchAdminStaffHoursAdjustmentSettings,
  postAdminStaffHoursAdjustmentReview,
} from "@/lib/school-admin/staff-hours/fetch-admin-staff-hours";
import type {
  AdminStaffHoursAdjustmentRequest,
  AdminStaffHoursPageData,
} from "@/lib/school-admin/staff-hours/staff-hours-types";
import {
  addDays,
  formatShortWeekdayDate,
  parseDateKey,
  startOfWeekMonday,
  toDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";

/*
 * Staff Hours view-model (admin Garden page). Views live in `?view=`, the
 * `?request=` deep link highlights one adjustment. Reload keeps the last data
 * on screen and reports failures inline (never a toast for loads).
 */

export type StaffHoursView = "live" | "summary" | "requests" | "settings";

function viewFromQuery(value: string | null): StaffHoursView {
  if (value === "summary" || value === "requests" || value === "settings") return value;
  return "live";
}

function reportStaffHoursError(organizationId: string, operation: string, err: unknown, message: string) {
  if (!shouldReportPortalClientError(err, portalJsonApiErrorStatus(err))) return;
  const parsed = parseOperationalError(err);
  const code = portalJsonApiErrorCode(err) ?? parsed.code;
  if (isBenignPortalErrorCode(code)) return;
  void reportClientOperationalError({ organizationId, operation, error: message, code });
}

export type SummaryPreset = { id: string; label: string; from: string; to: string };

export function useAdminStaffHoursModel({
  organizationId,
  initialData,
}: {
  organizationId: string;
  initialData: AdminStaffHoursPageData;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewFromUrl = viewFromQuery(searchParams.get("view"));
  const [view, setView] = useState<StaffHoursView>(viewFromUrl);
  const [urlView, setUrlView] = useState(viewFromUrl);
  if (viewFromUrl !== urlView) {
    setUrlView(viewFromUrl);
    setView(viewFromUrl);
  }
  const focusRequestId = searchParams.get("request");

  const [pageData, setPageData] = useState(initialData);
  const [summaryFrom, setSummaryFrom] = useState(initialData.summaryFrom);
  const [summaryTo, setSummaryTo] = useState(initialData.summaryTo);
  const [staffFilter, setStaffFilter] = useState("");
  const [applied, setApplied] = useState({ from: initialData.summaryFrom, to: initialData.summaryTo, staff: "" });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const reviewAction = useAdminAction();
  const requestIdRef = useRef(0);

  const reload = useCallback(
    async (options?: { announce?: boolean }) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const next = await fetchAdminStaffHoursPageData(organizationId, {
          from: summaryFrom,
          to: summaryTo,
          staffMemberId: staffFilter || null,
          view: "all",
        });
        if (requestId !== requestIdRef.current) return false;
        setPageData(next);
        setApplied({ from: summaryFrom, to: summaryTo, staff: staffFilter });
        setLoadError(null);
        setLastUpdatedAt(Date.now());
        if (options?.announce) {
          adminToast.success("Staff hours updated.", {
            id: "staff-hours-refresh",
            description: `${next.liveRows.length} clocked in now · ${next.todayClosedSessions.length} session${
              next.todayClosedSessions.length === 1 ? "" : "s"
            } finished today.`,
          });
        }
        return true;
      } catch (err) {
        if (requestId !== requestIdRef.current) return false;
        const message = formatActionError(err, "Failed to load staff hours.");
        setLoadError(message);
        reportStaffHoursError(organizationId, "staff_hours.load", err, message);
        return false;
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [organizationId, summaryFrom, summaryTo, staffFilter],
  );

  const selectView = useCallback(
    (nextView: StaffHoursView) => {
      setView(nextView);
      const params = new URLSearchParams(searchParams.toString());
      if (nextView === "live") {
        params.delete("view");
        params.delete("request");
      } else {
        params.set("view", nextView);
        if (nextView !== "requests") params.delete("request");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      if (nextView === "live") void reload();
    },
    [pathname, reload, router, searchParams],
  );

  const applySummary = useCallback(async () => {
    await reload();
    selectView("summary");
  }, [reload, selectView]);

  const summaryDirty =
    summaryFrom !== applied.from || summaryTo !== applied.to || staffFilter !== applied.staff;

  const presets: SummaryPreset[] = useMemo(() => {
    const today = parseDateKey(pageData.referenceDateKey);
    const todayKey = pageData.referenceDateKey;
    return [
      { id: "week", label: "This week", from: toDateKey(startOfWeekMonday(today)), to: todayKey },
      { id: "last7", label: "Last 7 days", from: toDateKey(addDays(today, -6)), to: todayKey },
      { id: "last30", label: "Last 30 days", from: toDateKey(addDays(today, -29)), to: todayKey },
    ];
  }, [pageData.referenceDateKey]);

  const applyPreset = useCallback((preset: SummaryPreset) => {
    setSummaryFrom(preset.from);
    setSummaryTo(preset.to);
  }, []);

  const requests = useMemo(() => pageData.adjustmentRequests ?? [], [pageData.adjustmentRequests]);
  const pendingRequests = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);
  const historyRequests = useMemo(() => requests.filter((r) => r.status !== "pending"), [requests]);

  // Keep the sidebar's Staff hours badge in step with this page: approving or
  // denying a request drops it at once, and every reload syncs it.
  const { report: reportNavCount } = useAdminNavCounts();
  const pendingCount = pendingRequests.length;
  useEffect(() => {
    reportNavCount("staffHoursPending", pendingCount);
  }, [pendingCount, reportNavCount]);

  const review = useCallback(
    async (request: AdminStaffHoursAdjustmentRequest, decision: "approved" | "denied") => {
      if (reviewAction.pendingKey) return;
      const dateLabel = formatShortWeekdayDate(parseDateKey(request.workDate));
      await reviewAction.run(
        async () => {
          try {
            const next = await postAdminStaffHoursAdjustmentReview({
              organizationId,
              requestId: request.id,
              decision,
            });
            setPageData(next);
            setLastUpdatedAt(Date.now());
            return next;
          } catch (err) {
            const message = formatActionError(err, "Failed to review the adjustment.");
            reportStaffHoursError(organizationId, "staff_hours.review_adjustment", err, message);
            throw err;
          }
        },
        {
          key: `review-${request.id}-${decision}`,
          id: `staff-hours-review-${request.id}`,
          flashKey: request.id,
          success: (next) => {
            const left = (next.adjustmentRequests ?? []).filter((r) => r.status === "pending").length;
            const leftLine = left === 0 ? "No more requests waiting." : `${left} more waiting.`;
            return decision === "approved"
              ? {
                  title: `${request.staffName}'s hours approved.`,
                  description: `${dateLabel} now uses the proposed times. ${leftLine}`,
                }
              : {
                  title: `${request.staffName}'s request denied.`,
                  description: `Their hours for ${dateLabel} stay as they were. ${leftLine}`,
                };
          },
          error: {
            title: decision === "approved" ? "Couldn't approve the hours." : "Couldn't deny the request.",
            description: "The request is still waiting.",
            fallback: "Failed to review the adjustment.",
          },
        },
      );
    },
    [organizationId, reviewAction],
  );

  const toggleRef = useRef<() => Promise<void>>(async () => {});
  const toggleRequireApproval = useCallback(async () => {
    if (settingsSaving) return;
    const next = !(pageData.adjustmentsRequireApproval !== false);
    setSettingsSaving(true);
    setPageData((current) => ({ ...current, adjustmentsRequireApproval: next }));
    try {
      await patchAdminStaffHoursAdjustmentSettings({ organizationId, adjustmentsRequireApproval: next });
      adminToast.dismiss("staff-hours-settings-error");
      adminToast.success(
        next ? "Hour adjustments now wait for approval." : "Hour adjustments now save immediately.",
        {
          id: "staff-hours-settings",
          description: next
            ? "Teacher changes show up under Requests until you approve them."
            : "Teacher changes update their hours right away.",
        },
      );
    } catch (err) {
      setPageData((current) => ({ ...current, adjustmentsRequireApproval: !next }));
      const message = formatActionError(err, "Failed to save staff hours settings.");
      adminToast.error("Couldn't change the approval setting.", {
        id: "staff-hours-settings-error",
        description: `${message} The setting is unchanged.`,
        action: { label: "Retry", onClick: () => void toggleRef.current() },
      });
      reportStaffHoursError(organizationId, "staff_hours.adjustment_settings", err, message);
    } finally {
      setSettingsSaving(false);
    }
  }, [organizationId, pageData.adjustmentsRequireApproval, settingsSaving]);
  useEffect(() => {
    toggleRef.current = toggleRequireApproval;
  }, [toggleRequireApproval]);

  const sessionsForStaff = useCallback(
    (staffMemberId: string) => pageData.sessions.filter((session) => session.staffMemberId === staffMemberId),
    [pageData.sessions],
  );

  const todayMinutes = useMemo(
    () => pageData.todayClosedSessions.reduce((sum, session) => sum + session.minutes, 0),
    [pageData.todayClosedSessions],
  );
  const summaryTotals = useMemo(
    () =>
      pageData.summaryRows.reduce(
        (acc, row) => ({
          minutes: acc.minutes + row.totalMinutes,
          sessions: acc.sessions + row.sessionCount,
          staffWithHours: acc.staffWithHours + (row.totalMinutes > 0 ? 1 : 0),
        }),
        { minutes: 0, sessions: 0, staffWithHours: 0 },
      ),
    [pageData.summaryRows],
  );

  return {
    view,
    selectView,
    focusRequestId,
    pageData,
    loading,
    loadError,
    lastUpdatedAt,
    reload,
    summaryFrom,
    setSummaryFrom,
    summaryTo,
    setSummaryTo,
    staffFilter,
    setStaffFilter,
    applied,
    summaryDirty,
    applySummary,
    presets,
    applyPreset,
    expandedStaffId,
    setExpandedStaffId,
    sessionsForStaff,
    pendingRequests,
    historyRequests,
    review,
    reviewPendingKey: reviewAction.pendingKey,
    lastReviewedId: reviewAction.lastSavedKey,
    requireApproval: pageData.adjustmentsRequireApproval !== false,
    settingsSaving,
    toggleRequireApproval,
    todayMinutes,
    summaryTotals,
  };
}

export type AdminStaffHoursModel = ReturnType<typeof useAdminStaffHoursModel>;
