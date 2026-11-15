"use client";

import { useEffect } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { BusyLabel, GardenEmptyState } from "@/components/school-admin/garden/kit";
import { GardenAvatar } from "@/components/school-admin/garden/blocks";
import { gBtnDangerTight, gBtnSolidSm } from "@/components/school-admin/garden/skin";
import { GCard, GChip, type GChipTone } from "@/components/school-parent/garden/ui";
import type {
  AdminStaffHoursAdjustmentRequest,
  AdminStaffHoursAdjustmentSession,
} from "@/lib/school-admin/staff-hours/staff-hours-types";
import { formatTimeFromMinutes, parseTimeToMinutes } from "@/lib/school-events/calendar-time";
import { formatShortWeekdayDate, parseDateKey } from "@/lib/school-teacher/my-hours/format-duration";
import type { AdminStaffHoursModel } from "./useAdminStaffHoursModel";

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

const STATUS: Record<AdminStaffHoursAdjustmentRequest["status"], { label: string; tone: GChipTone }> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  denied: { label: "Denied", tone: "alert" },
  superseded: { label: "Superseded", tone: "neutral" },
};

/** Pending adjustments with Approve / Deny (Live tab and Requests tab). */
export function StaffHoursPendingRequestsSection({
  model,
  title = "Pending requests",
  emptyMessage = "No hour adjustments are waiting.",
}: {
  model: AdminStaffHoursModel;
  title?: string;
  emptyMessage?: string;
}) {
  return (
    <RequestSection
      model={model}
      kicker="Needs your decision"
      title={title}
      emptyMessage={emptyMessage}
      requests={model.pendingRequests}
      showActions
    />
  );
}

export default function StaffHoursRequestsPanel({ model }: { model: AdminStaffHoursModel }) {
  const { focusRequestId } = model;
  useEffect(() => {
    if (!focusRequestId) return;
    document.getElementById(`staff-hours-request-${focusRequestId}`)?.scrollIntoView({ block: "center" });
  }, [focusRequestId]);

  return (
    <div className="flex flex-col gap-5" data-testid="staff-hours-requests-panel">
      {model.pendingRequests.length === 0 ? (
        <GardenEmptyState
          icon={Check}
          tint="bg-[var(--sf-mint)]"
          title="You're all caught up"
          description={
            model.requireApproval
              ? "No hour adjustments are waiting for approval. New ones show up here and on the Live tab."
              : "Hour adjustments save immediately right now, so nothing waits for approval. You can change that in Settings."
          }
        />
      ) : (
        <StaffHoursPendingRequestsSection
          model={model}
          title="Pending"
          emptyMessage="No hour adjustments are waiting for approval."
        />
      )}
      <RequestSection
        model={model}
        kicker="Decided"
        title="History"
        emptyMessage="Approved and denied adjustments will show up here."
        requests={model.historyRequests}
        showActions={false}
      />
    </div>
  );
}

function RequestSection({
  model,
  kicker,
  title,
  emptyMessage,
  requests,
  showActions,
}: {
  model: AdminStaffHoursModel;
  kicker: string;
  title: string;
  emptyMessage: string;
  requests: AdminStaffHoursAdjustmentRequest[];
  showActions: boolean;
}) {
  const anyBusy = model.reviewPendingKey != null;
  return (
    <GCard
      index={2}
      kicker={kicker}
      title={title}
      action={requests.length > 0 ? <GChip tone={showActions ? "warning" : "neutral"}>{requests.length}</GChip> : undefined}
    >
      {requests.length === 0 ? (
        <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
          {emptyMessage}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {requests.map((request) => {
            const focused = request.id === model.focusRequestId;
            const flashed = request.id === model.lastReviewedId;
            const approving = model.reviewPendingKey === `review-${request.id}-approved`;
            const denying = model.reviewPendingKey === `review-${request.id}-denied`;
            const status = STATUS[request.status];
            return (
              <li
                key={request.id}
                id={`staff-hours-request-${request.id}`}
                className={`rounded-[16px] border-[1.5px] p-3.5 transition-colors duration-500 ${
                  flashed
                    ? "border-[var(--sf-forest)]/35 bg-[var(--sf-mint)]"
                    : focused
                      ? "border-[var(--sf-clay)]/45 bg-[var(--sf-accent-wash)]"
                      : "border-[var(--sf-ink)]/10 bg-white"
                }`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <GardenAvatar name={request.staffName} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="m-0 text-[14.5px] font-extrabold text-[var(--sf-ink)]">{request.staffName}</p>
                        <GChip tone={status.tone}>{status.label}</GChip>
                      </div>
                      <p className="m-0 mt-0.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                        {formatShortWeekdayDate(parseDateKey(request.workDate))}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] font-bold tabular-nums">
                        <span className="rounded-[10px] bg-[var(--sf-ink)]/[0.05] px-2.5 py-1 text-[var(--sf-ink)]/65 line-through decoration-[var(--sf-ink)]/30">
                          <span className="sr-only">Current: </span>
                          {sessionLabel(request.previousSessions)}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-[var(--sf-ink)]/40" aria-hidden />
                        <span className="rounded-[10px] bg-[var(--sf-butter)]/70 px-2.5 py-1 text-[var(--sf-ink)]">
                          <span className="sr-only">Proposed: </span>
                          {sessionLabel(request.proposedSessions)}
                        </span>
                      </div>
                      {request.note.trim() ? (
                        <p className="m-0 mt-2 text-[13px] font-semibold italic text-[var(--sf-ink)]/70">“{request.note}”</p>
                      ) : null}
                    </div>
                  </div>
                  {showActions ? (
                    <div className="flex shrink-0 gap-2 lg:pt-1">
                      <button
                        type="button"
                        className={gBtnSolidSm}
                        disabled={anyBusy}
                        aria-busy={approving || undefined}
                        onClick={() => void model.review(request, "approved")}
                        data-testid={`staff-hours-approve-${request.id}`}
                      >
                        <BusyLabel busy={approving} busyLabel="Saving…" icon={<Check className="h-4 w-4" aria-hidden />}>
                          Approve
                        </BusyLabel>
                      </button>
                      <button
                        type="button"
                        className={gBtnDangerTight}
                        disabled={anyBusy}
                        aria-busy={denying || undefined}
                        onClick={() => void model.review(request, "denied")}
                        data-testid={`staff-hours-deny-${request.id}`}
                      >
                        <BusyLabel busy={denying} busyLabel="Denying…" icon={<X className="h-4 w-4" aria-hidden />}>
                          Deny
                        </BusyLabel>
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </GCard>
  );
}
