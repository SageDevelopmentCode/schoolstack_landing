"use client";

import { useEffect, useState } from "react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { postAdminStaffHoursAdjustmentReview } from "@/lib/school-admin/staff-hours/fetch-admin-staff-hours";
import type {
  AdminStaffHoursAdjustmentRequest,
  AdminStaffHoursAdjustmentSession,
  AdminStaffHoursPageData,
} from "@/lib/school-admin/staff-hours/staff-hours-types";
import { formatTimeFromMinutes, parseTimeToMinutes } from "@/lib/school-events/calendar-time";
import {
  formatShortWeekdayDate,
  parseDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import {
  parseOperationalError,
  reportClientOperationalError,
  shouldReportPortalClientError,
} from "@/lib/operational-errors-client";
import { isBenignPortalErrorCode } from "@/lib/portal-operational-errors";
import {
  portalJsonApiErrorCode,
  portalJsonApiErrorStatus,
} from "@/lib/portal-json-api-error";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const TABLE_LINE = "#EDF1ED";

type StaffHoursRequestsPanelProps = {
  theme: ParentThemeTokens;
  organizationId: string;
  requests: AdminStaffHoursAdjustmentRequest[];
  focusRequestId: string | null;
  onPageData: (pageData: AdminStaffHoursPageData) => void;
};

function sessionLabel(sessions: AdminStaffHoursAdjustmentSession[]): string {
  if (sessions.length === 0) return "No sessions";
  return sessions
    .map((session) => {
      const start = parseTimeToMinutes(session.clockIn);
      const end = parseTimeToMinutes(session.clockOut);
      if (start == null || end == null) return `${session.clockIn}–${session.clockOut}`;
      return `${formatTimeFromMinutes(start)} – ${formatTimeFromMinutes(end)}`;
    })
    .join("; ");
}

function statusLabel(status: AdminStaffHoursAdjustmentRequest["status"]): string {
  if (status === "approved") return "Approved";
  if (status === "denied") return "Denied";
  return "Pending";
}

export default function StaffHoursRequestsPanel({
  theme,
  organizationId,
  requests,
  focusRequestId,
  onPageData,
}: StaffHoursRequestsPanelProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const pending = requests.filter((request) => request.status === "pending");
  const history = requests.filter((request) => request.status !== "pending");

  useEffect(() => {
    if (!focusRequestId) return;
    document
      .getElementById(`staff-hours-request-${focusRequestId}`)
      ?.scrollIntoView({ block: "center" });
  }, [focusRequestId, requests]);

  const review = async (
    requestId: string,
    decision: "approved" | "denied",
  ) => {
    if (busyId) return;
    setBusyId(requestId);
    try {
      const next = await postAdminStaffHoursAdjustmentReview({
        organizationId,
        requestId,
        decision,
      });
      onPageData(next);
      adminToast.success(decision === "approved" ? "Hours approved." : "Request denied.");
    } catch (err) {
      const message = formatActionError(err, "Failed to review the adjustment.");
      adminToast.error(message);
      if (shouldReportPortalClientError(err, portalJsonApiErrorStatus(err))) {
        const parsed = parseOperationalError(err);
        const code = portalJsonApiErrorCode(err) ?? parsed.code;
        if (!isBenignPortalErrorCode(code)) {
          void reportClientOperationalError({
            organizationId,
            operation: "staff_hours.review_adjustment",
            error: message,
            code,
          });
        }
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6" data-testid="staff-hours-requests-panel">
      <RequestSection
        theme={theme}
        title="Pending"
        emptyMessage="No hour adjustments are waiting for approval."
        requests={pending}
        focusRequestId={focusRequestId}
        busyId={busyId}
        showActions
        onReview={review}
      />
      <RequestSection
        theme={theme}
        title="History"
        emptyMessage="Approved and denied adjustments will show up here."
        requests={history}
        focusRequestId={focusRequestId}
        busyId={busyId}
        showActions={false}
        onReview={review}
      />
    </div>
  );
}

function RequestSection({
  theme,
  title,
  emptyMessage,
  requests,
  focusRequestId,
  busyId,
  showActions,
  onReview,
}: {
  theme: ParentThemeTokens;
  title: string;
  emptyMessage: string;
  requests: AdminStaffHoursAdjustmentRequest[];
  focusRequestId: string | null;
  busyId: string | null;
  showActions: boolean;
  onReview: (requestId: string, decision: "approved" | "denied") => void;
}) {
  return (
    <AdminCard theme={theme} padding="none" className="overflow-hidden">
      <div className="border-b px-5 py-4" style={{ borderColor: TABLE_LINE }}>
        <h2 className="font-display text-lg font-semibold" style={{ color: theme.ink }}>
          {title}
        </h2>
      </div>
      {requests.length === 0 ? (
        <p className="px-5 py-4 text-sm" style={{ color: theme.muted }}>
          {emptyMessage}
        </p>
      ) : (
        <ul>
          {requests.map((request, index) => {
            const focused = request.id === focusRequestId;
            return (
              <li
                key={request.id}
                id={`staff-hours-request-${request.id}`}
                className="px-5 py-4"
                style={{
                  borderTop: index === 0 ? undefined : `1px solid ${TABLE_LINE}`,
                  backgroundColor: focused ? theme.primarySoft : undefined,
                }}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium" style={{ color: theme.ink }}>
                        {request.staffName}
                      </p>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                        style={{
                          backgroundColor: theme.primarySoft,
                          color: theme.primary,
                        }}
                      >
                        {statusLabel(request.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                      {formatShortWeekdayDate(parseDateKey(request.workDate))}
                    </p>
                    <p className="mt-2 text-sm" style={{ color: theme.ink }}>
                      Current: {sessionLabel(request.previousSessions)}
                    </p>
                    <p className="mt-1 text-sm" style={{ color: theme.ink }}>
                      Proposed: {sessionLabel(request.proposedSessions)}
                    </p>
                    {request.note.trim() ? (
                      <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                        {request.note}
                      </p>
                    ) : null}
                  </div>
                  {showActions ? (
                    <div className="flex shrink-0 gap-2">
                      <AdminButton
                        theme={theme}
                        variant="primary"
                        size="compact"
                        disabled={busyId != null}
                        onClick={() => onReview(request.id, "approved")}
                        data-testid={`staff-hours-approve-${request.id}`}
                      >
                        {busyId === request.id ? "Saving…" : "Approve"}
                      </AdminButton>
                      <AdminButton
                        theme={theme}
                        variant="danger"
                        size="compact"
                        disabled={busyId != null}
                        onClick={() => onReview(request.id, "denied")}
                        data-testid={`staff-hours-deny-${request.id}`}
                      >
                        Deny
                      </AdminButton>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminCard>
  );
}
