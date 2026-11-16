"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, UserPlus, X } from "lucide-react";
import { GChip, GKicker, GSkeleton, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import { GardenLoadError } from "@/components/school-admin/dashboard/garden/shared";
import { GardenSelect, gBtnDangerSm } from "@/components/school-admin/garden/kit";
import { COMMITTEE_ROLE_LABELS } from "@/lib/committees/committee-role-labels";
import type { CommitteeDutyRoleSummary } from "@/lib/committees/duty-roles";
import { getCommitteeJoinRequestDisplayName } from "@/lib/committees/join-request-display";
import { COMMITTEE_ASSIGNABLE_ROLE_OPTIONS } from "@/lib/committees/committee-role-labels";
import type { CommitteeJoinRequest, CommitteeRole } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";

type CommitteeJoinRequestsPanelProps = {
  organizationId: string;
  schoolSlug: string;
  /** Kept for callers; the panel renders in the admin Garden look. */
  theme?: ParentThemeTokens;
  committeeId?: string;
  committeeDutyRoles?: CommitteeDutyRoleSummary[];
  compact?: boolean;
  onChanged?: () => void;
};

function formatSubmittedAt(value: string): string {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function buildDefaultDutyRoleIds(
  requests: CommitteeJoinRequest[],
): Record<string, string> {
  return Object.fromEntries(
    requests.map((request) => [
      request.id,
      request.preferredDutyRoleId ?? "",
    ]),
  );
}

export default function CommitteeJoinRequestsPanel({
  organizationId,
  schoolSlug,
  committeeId,
  committeeDutyRoles,
  compact = false,
  onChanged,
}: CommitteeJoinRequestsPanelProps) {
  const [requests, setRequests] = useState<CommitteeJoinRequest[]>([]);
  const [dutyRolesByCommitteeId, setDutyRolesByCommitteeId] = useState<
    Record<string, CommitteeDutyRoleSummary[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [memberRoles, setMemberRoles] = useState<Record<string, CommitteeRole>>({});
  const [assignDutyRoleIds, setAssignDutyRoleIds] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const reducedMotion = useReducedMotion() ?? false;

  const applyRequestsResponse = useCallback(
    (
      nextRequests: CommitteeJoinRequest[],
      nextDutyRolesByCommitteeId?: Record<string, CommitteeDutyRoleSummary[]>,
    ) => {
      setRequests(nextRequests);
      setAssignDutyRoleIds(buildDefaultDutyRoleIds(nextRequests));
      if (nextDutyRolesByCommitteeId) {
        setDutyRolesByCommitteeId(nextDutyRolesByCommitteeId);
      }
    },
    [],
  );

  const reloadRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        organizationId,
        status: "pending",
      });
      if (committeeId) params.set("committeeId", committeeId);
      const res = await fetch(`/api/school-admin/committees/join-requests?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to load join requests.");
      applyRequestsResponse(
        data.requests ?? [],
        committeeDutyRoles ? undefined : (data.dutyRolesByCommitteeId ?? {}),
      );
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.join_requests.load",
        error: "",
      }, err);
      setLoadError(formatActionError(err, "Failed to load join requests."));
    }
  }, [applyRequestsResponse, committeeDutyRoles, committeeId, organizationId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const params = new URLSearchParams({
          organizationId,
          status: "pending",
        });
        if (committeeId) params.set("committeeId", committeeId);
        const res = await fetch(`/api/school-admin/committees/join-requests?${params}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Failed to load join requests.");
        if (!cancelled) {
          applyRequestsResponse(
            data.requests ?? [],
            committeeDutyRoles ? undefined : (data.dutyRolesByCommitteeId ?? {}),
          );
        }
      } catch (err) {
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "committees.join_requests.load",
          error: "",
        }, err);
        if (!cancelled) {
          // Load failures show inline with "Try again" (admin feedback contract).
          setLoadError(formatActionError(err, "Failed to load join requests."));
          setRequests([]);
          setAssignDutyRoleIds({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyRequestsResponse, committeeDutyRoles, committeeId, organizationId, reloadNonce]);

  const resolveDutyRoles = useCallback(
    (request: CommitteeJoinRequest): CommitteeDutyRoleSummary[] => {
      if (committeeDutyRoles) return committeeDutyRoles;
      return dutyRolesByCommitteeId[request.committeeId] ?? [];
    },
    [committeeDutyRoles, dutyRolesByCommitteeId],
  );

  const handleApprove = async (request: CommitteeJoinRequest) => {
    const errorId = `committee-join-${request.id}-error`;
    const requesterName = getCommitteeJoinRequestDisplayName(request);
    const memberRole = memberRoles[request.id] ?? "member";
    setActingId(request.id);
    try {
      const selectedDutyRoleId = assignDutyRoleIds[request.id] ?? "";
      const dutyRoleTitle = resolveDutyRoles(request).find((role) => role.id === selectedDutyRoleId)?.title;
      const res = await fetch(
        `/api/school-admin/committees/join-requests/${request.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            schoolSlug,
            memberRole,
            assignDutyRoleId: selectedDutyRoleId || null,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to approve request.");
      adminToast.dismiss(errorId);
      adminToast.success(`${requesterName} joined${request.committeeName ? ` ${request.committeeName}` : ""}.`, {
        id: `committee-join-${request.id}`,
        description: `Added as ${COMMITTEE_ROLE_LABELS[memberRole] ?? memberRole}${
          dutyRoleTitle ? ` · ${dutyRoleTitle}` : ""
        }. They can open the committee workspace now.`,
      });
      await reloadRequests();
      onChanged?.();
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.join_requests.approve",
        error: "",
      }, err);
      adminToast.error(`Couldn't approve ${requesterName}.`, {
        id: errorId,
        description: `${formatActionError(err, "Failed to approve request.")} Their request is still waiting.`,
        action: { label: "Retry", onClick: () => void handleApprove(request) },
      });
    } finally {
      setActingId(null);
    }
  };

  const handleDecline = async (request: CommitteeJoinRequest) => {
    const errorId = `committee-join-${request.id}-error`;
    const requesterName = getCommitteeJoinRequestDisplayName(request);
    setActingId(request.id);
    try {
      const res = await fetch(
        `/api/school-admin/committees/join-requests/${request.id}/decline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId, schoolSlug }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to decline request.");
      adminToast.dismiss(errorId);
      adminToast.success(`Declined ${requesterName}'s request.`, {
        id: `committee-join-${request.id}`,
        description: "They weren't added to the committee.",
      });
      await reloadRequests();
      onChanged?.();
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.join_requests.decline",
        error: "",
      }, err);
      adminToast.error(`Couldn't decline ${requesterName}'s request.`, {
        id: errorId,
        description: `${formatActionError(err, "Failed to decline request.")} Their request is still waiting.`,
        action: { label: "Retry", onClick: () => void handleDecline(request) },
      });
    } finally {
      setActingId(null);
    }
  };

  const header = !compact ? (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <GKicker>Join requests</GKicker>
        <h3 className="sf-display m-0 mt-1 text-[1.2rem] leading-tight text-[var(--sf-ink)]">
          {requests.length > 0 ? "People who want to help" : "Join requests"}
        </h3>
      </div>
      {requests.length > 0 ? (
        <GChip tone="alert" className="tabular-nums">
          {requests.length} waiting
        </GChip>
      ) : null}
    </div>
  ) : null;

  if (loading) {
    return (
      <section aria-label="Join requests" aria-busy="true" className={compact ? "" : "rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-5 shadow-[0_3px_0_0_rgba(43,36,29,0.08)]"}>
        {header}
        <div className="space-y-2" role="status" aria-label="Loading join requests">
          <GSkeleton className="h-16 w-full !rounded-[16px]" />
          <GSkeleton className="h-16 w-full !rounded-[16px]" />
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section aria-label="Join requests" className={compact ? "" : "rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-5 shadow-[0_3px_0_0_rgba(43,36,29,0.08)]"}>
        {header}
        <GardenLoadError
          title="Couldn't load join requests."
          description={`${loadError} Nobody was approved or declined.`}
          onRetry={() => setReloadNonce((n) => n + 1)}
        />
      </section>
    );
  }

  if (requests.length === 0) {
    if (compact) return null;
    return (
      <section aria-label="Join requests" className="rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-5 shadow-[0_3px_0_0_rgba(43,36,29,0.08)]">
        {header}
        <p className="sf-paper m-0 flex items-center gap-2 rounded-2xl px-3.5 py-3 text-[13px] font-semibold text-[var(--sf-soft)]">
          <UserPlus className="h-4 w-4 shrink-0 text-[var(--sf-forest)]" aria-hidden />
          No pending requests right now. When parents or staff ask to join a committee, they&apos;ll show up here.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Join requests"
      data-testid="committee-join-requests"
      className={compact ? "rounded-[20px] border-[1.5px] border-[var(--sf-clay)]/30 bg-[var(--sf-accent-wash)] p-4" : "rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-5 shadow-[0_3px_0_0_rgba(43,36,29,0.08)]"}
    >
      {compact ? (
        <div className="mb-3 flex items-center justify-between gap-2">
          <GKicker>Waiting to join</GKicker>
          <GChip tone="alert" className="tabular-nums">{requests.length}</GChip>
        </div>
      ) : (
        header
      )}

      <motion.ul
        key={requests.map((request) => request.id).join("-")}
        className="m-0 flex list-none flex-col gap-2.5 p-0"
        variants={staggerContainer(reducedMotion)}
        initial="initial"
        animate="animate"
      >
        {requests.map((request) => {
          const busy = actingId === request.id;
          const requesterName = getCommitteeJoinRequestDisplayName(request);
          const requesterBadge =
            request.requesterType === "staff"
              ? "Staff"
              : request.requesterType === "parent"
                ? "Parent"
                : null;
          const dutyRoles = resolveDutyRoles(request);
          const selectedAccessLevel = memberRoles[request.id] ?? "member";
          const selectedDutyRoleId = assignDutyRoleIds[request.id] ?? "";
          const selectedDutyRole = dutyRoles.find(
            (dutyRole) => dutyRole.id === selectedDutyRoleId,
          );
          const accessId = `join-access-${request.id}`;
          const dutyId = `join-duty-${request.id}`;
          return (
            <motion.li
              key={request.id}
              variants={staggerItem(reducedMotion)}
              aria-busy={busy || undefined}
              className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-3.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">{requesterName}</p>
                {requesterBadge ? <GChip tone="neutral">{requesterBadge}</GChip> : null}
              </div>
              <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">
                {request.committeeName ?? "Committee"}
                {request.grade ? ` · ${request.grade}` : ""}
                {` · Asked ${formatSubmittedAt(request.createdAt)}`}
              </p>
              {request.preferredDutyRoleTitle ? (
                <p className="m-0 mt-1 text-[12.5px] font-semibold text-[var(--sf-ink)]/70">
                  Would like to be: <span className="font-extrabold">{request.preferredDutyRoleTitle}</span>
                </p>
              ) : null}
              {request.note ? (
                <p className="sf-paper m-0 mt-2 rounded-xl px-3 py-2 text-[13px] font-semibold italic text-[var(--sf-ink)]/75">
                  &ldquo;{request.note}&rdquo;
                </p>
              ) : null}

              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label htmlFor={accessId} className="mb-1 block text-[12px] font-extrabold text-[var(--sf-ink)]/70">
                    Access level
                  </label>
                  <GardenSelect
                    id={accessId}
                    value={selectedAccessLevel}
                    onChange={(value) =>
                      setMemberRoles((prev) => ({ ...prev, [request.id]: value as CommitteeRole }))
                    }
                    options={COMMITTEE_ASSIGNABLE_ROLE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                    disabled={busy}
                  />
                </div>
                {dutyRoles.length > 0 ? (
                  <div>
                    <label htmlFor={dutyId} className="mb-1 block text-[12px] font-extrabold text-[var(--sf-ink)]/70">
                      Duty role
                    </label>
                    <GardenSelect
                      id={dutyId}
                      value={selectedDutyRoleId}
                      onChange={(value) => setAssignDutyRoleIds((prev) => ({ ...prev, [request.id]: value }))}
                      options={[
                        { value: "", label: "None" },
                        ...dutyRoles.map((dutyRole) => ({
                          value: dutyRole.id,
                          label: `${dutyRole.title}${dutyRole.assigneeId ? " (assigned)" : ""}`,
                        })),
                      ]}
                      disabled={busy}
                    />
                    {selectedDutyRole?.assigneeName ? (
                      <p className="m-0 mt-1 text-[12px] font-semibold leading-snug text-[#6b4f00]">
                        Currently {selectedDutyRole.assigneeName}. Approving reassigns this role.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className={`${gBtnOutlineSm} !border-[var(--sf-forest)]/45 !text-[var(--sf-forest)]`}
                  onClick={() => void handleApprove(request)}
                  disabled={busy}
                  aria-busy={busy || undefined}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
                  {busy ? "Saving…" : "Approve"}
                </button>
                <button
                  type="button"
                  className={gBtnDangerSm}
                  onClick={() => void handleDecline(request)}
                  disabled={busy}
                >
                  <X className="h-4 w-4" aria-hidden />
                  Decline
                </button>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
