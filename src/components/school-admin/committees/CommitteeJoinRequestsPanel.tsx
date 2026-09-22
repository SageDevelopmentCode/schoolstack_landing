"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import type { CommitteeDutyRoleSummary } from "@/lib/committees/duty-roles";
import { getCommitteeJoinRequestDisplayName } from "@/lib/committees/join-request-display";
import { COMMITTEE_ASSIGNABLE_ROLE_OPTIONS } from "@/lib/committees/committee-role-labels";
import type { CommitteeJoinRequest, CommitteeRole } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { committeeStoryInputStyle } from "@/components/school-admin/committees/committee-story-input-style";
import { staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";

type CommitteeJoinRequestsPanelProps = {
  organizationId: string;
  schoolSlug: string;
  theme: ParentThemeTokens;
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
  theme,
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
  const reducedMotion = useReducedMotion() ?? false;
  const inputStyle = committeeStoryInputStyle(theme);

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
      adminToast.error(formatActionError(err, "Failed to load join requests."));
      setRequests([]);
      setAssignDutyRoleIds({});
    }
  }, [applyRequestsResponse, committeeDutyRoles, committeeId, organizationId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
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
          adminToast.error(formatActionError(err, "Failed to load join requests."));
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
  }, [applyRequestsResponse, committeeDutyRoles, committeeId, organizationId]);

  const resolveDutyRoles = useCallback(
    (request: CommitteeJoinRequest): CommitteeDutyRoleSummary[] => {
      if (committeeDutyRoles) return committeeDutyRoles;
      return dutyRolesByCommitteeId[request.committeeId] ?? [];
    },
    [committeeDutyRoles, dutyRolesByCommitteeId],
  );

  const handleApprove = async (request: CommitteeJoinRequest) => {
    setActingId(request.id);
    try {
      const selectedDutyRoleId = assignDutyRoleIds[request.id] ?? "";
      const res = await fetch(
        `/api/school-admin/committees/join-requests/${request.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            schoolSlug,
            memberRole: memberRoles[request.id] ?? "member",
            assignDutyRoleId: selectedDutyRoleId || null,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to approve request.");
      adminToast.success("Join request approved");
      await reloadRequests();
      onChanged?.();
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.join_requests.approve",
        error: "",
      }, err);
      adminToast.error(formatActionError(err, "Failed to approve request."));
    } finally {
      setActingId(null);
    }
  };

  const handleDecline = async (request: CommitteeJoinRequest) => {
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
      adminToast.success("Join request declined");
      await reloadRequests();
      onChanged?.();
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.join_requests.decline",
        error: "",
      }, err);
      adminToast.error(formatActionError(err, "Failed to decline request."));
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center gap-2 text-sm py-4"
        style={{ color: theme.muted }}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading join requests…
      </div>
    );
  }

  if (requests.length === 0) {
    if (compact) return null;
    return (
      <AdminCard theme={theme} padding="default">
        <AdminDisplayHeading theme={theme} as="h3" size="section">
          Join requests
        </AdminDisplayHeading>
        <p className="text-xs mt-1" style={{ color: theme.muted }}>
          No pending requests right now.
        </p>
      </AdminCard>
    );
  }

  return (
    <AdminCard theme={theme} padding="none">
      {!compact && (
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "#E0E7E0" }}
        >
          <AdminDisplayHeading theme={theme} as="h3" size="section">
            Join requests
          </AdminDisplayHeading>
          <p className="text-xs mt-0.5" style={{ color: theme.muted }}>
            {requests.length} pending request{requests.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <motion.div
        key={requests.map((request) => request.id).join("-")}
        className="divide-y"
        style={{ borderColor: "#E0E7E0" }}
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
          return (
            <motion.div
              key={request.id}
              variants={staggerItem(reducedMotion)}
              className="px-5 py-4 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                      {requesterName}
                    </p>
                    {requesterBadge && (
                      <span
                        className="text-[10px] font-medium uppercase tracking-wide rounded-full px-2 py-0.5"
                        style={{
                          color: theme.muted,
                          backgroundColor: "#F3F6F4",
                        }}
                      >
                        {requesterBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: theme.muted }}>
                    {request.committeeName ?? "Committee"}
                    {request.grade ? ` · ${request.grade}` : ""}
                  </p>
                  {request.preferredDutyRoleTitle && (
                    <p className="text-xs mt-1" style={{ color: theme.muted }}>
                      Preferred role: {request.preferredDutyRoleTitle}
                    </p>
                  )}
                  {request.note && (
                    <p className="text-xs mt-2 italic" style={{ color: theme.muted }}>
                      &ldquo;{request.note}&rdquo;
                    </p>
                  )}
                  <p className="text-[10px] mt-2" style={{ color: theme.muted }}>
                    Submitted {formatSubmittedAt(request.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-end sm:flex-wrap">
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-[10px] font-medium uppercase tracking-wide"
                      style={{ color: theme.muted }}
                    >
                      Access level
                    </label>
                    <select
                      value={selectedAccessLevel}
                      onChange={(e) =>
                        setMemberRoles((prev) => ({
                          ...prev,
                          [request.id]: e.target.value as CommitteeRole,
                        }))
                      }
                      className="text-xs rounded-lg border px-2 py-1.5 min-w-[9rem]"
                      style={inputStyle}
                      disabled={busy}
                    >
                      {COMMITTEE_ASSIGNABLE_ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {dutyRoles.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-[10px] font-medium uppercase tracking-wide"
                        style={{ color: theme.muted }}
                      >
                        Duty role
                      </label>
                      <select
                        value={selectedDutyRoleId}
                        onChange={(e) =>
                          setAssignDutyRoleIds((prev) => ({
                            ...prev,
                            [request.id]: e.target.value,
                          }))
                        }
                        className="text-xs rounded-lg border px-2 py-1.5 min-w-[9rem]"
                        style={inputStyle}
                        disabled={busy}
                      >
                        <option value="">None</option>
                        {dutyRoles.map((dutyRole) => (
                          <option key={dutyRole.id} value={dutyRole.id}>
                            {dutyRole.title}
                            {dutyRole.assigneeId ? " (assigned)" : ""}
                          </option>
                        ))}
                      </select>
                      {selectedDutyRole?.assigneeName ? (
                        <p
                          className="max-w-[12rem] text-[10px] leading-snug"
                          style={{ color: theme.muted }}
                        >
                          Currently assigned to {selectedDutyRole.assigneeName}. Approving
                          will reassign this role.
                        </p>
                      ) : null}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <AdminButton
                      theme={theme}
                      variant="primary"
                      size="compact"
                      onClick={() => void handleApprove(request)}
                      disabled={busy}
                    >
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Approve
                    </AdminButton>
                    <AdminButton
                      theme={theme}
                      variant="danger"
                      size="compact"
                      onClick={() => void handleDecline(request)}
                      disabled={busy}
                    >
                      <X className="w-3 h-3" />
                      Decline
                    </AdminButton>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </AdminCard>
  );
}
