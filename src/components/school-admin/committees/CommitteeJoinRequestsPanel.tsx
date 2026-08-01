"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { CommitteeJoinRequest, CommitteeRole } from "@/lib/committees/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type CommitteeJoinRequestsPanelProps = {
  organizationId: string;
  schoolSlug: string;
  C: AdminThemeTokens;
  committeeId?: string;
  compact?: boolean;
  onChanged?: () => void;
};

const ROLE_OPTIONS: { value: CommitteeRole; label: string }[] = [
  { value: "member", label: "Member" },
  { value: "lead", label: "Lead" },
];

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

export default function CommitteeJoinRequestsPanel({
  organizationId,
  schoolSlug,
  C,
  committeeId,
  compact = false,
  onChanged,
}: CommitteeJoinRequestsPanelProps) {
  const [requests, setRequests] = useState<CommitteeJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [memberRoles, setMemberRoles] = useState<Record<string, CommitteeRole>>({});

  const loadRequests = useCallback(async () => {
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
      setRequests(data.requests ?? []);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to load join requests."));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [committeeId, organizationId]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleApprove = async (request: CommitteeJoinRequest) => {
    setActingId(request.id);
    try {
      const res = await fetch(
        `/api/school-admin/committees/join-requests/${request.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            schoolSlug,
            memberRole: memberRoles[request.id] ?? "member",
            assignDutyRoleId: request.preferredDutyRoleId,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to approve request.");
      adminToast.success("Join request approved");
      await loadRequests();
      onChanged?.();
    } catch (err) {
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
      await loadRequests();
      onChanged?.();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to decline request."));
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center gap-2 text-sm py-4"
        style={{ color: C.textSecondary }}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading join requests…
      </div>
    );
  }

  if (requests.length === 0) {
    if (compact) return null;
    return (
      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: C.surface, borderColor: C.border }}
      >
        <h3 className="text-sm font-semibold mb-1" style={{ color: C.textPrimary }}>
          Join requests
        </h3>
        <p className="text-xs" style={{ color: C.textSecondary }}>
          No pending requests right now.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: C.surface, borderColor: C.border }}
    >
      {!compact && (
        <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
          <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Join requests
          </h3>
          <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
            {requests.length} pending request{requests.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <div className="divide-y" style={{ borderColor: C.border }}>
        {requests.map((request) => {
          const busy = actingId === request.id;
          return (
            <div key={request.id} className="px-5 py-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                    {request.guardianName ?? "Parent"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
                    {request.committeeName ?? "Committee"}
                    {request.grade ? ` · ${request.grade}` : ""}
                  </p>
                  {request.preferredDutyRoleTitle && (
                    <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
                      Preferred role: {request.preferredDutyRoleTitle}
                    </p>
                  )}
                  {request.note && (
                    <p className="text-xs mt-2 italic" style={{ color: C.textSecondary }}>
                      &ldquo;{request.note}&rdquo;
                    </p>
                  )}
                  <p className="text-[10px] mt-2" style={{ color: C.textTertiary }}>
                    Submitted {formatSubmittedAt(request.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={memberRoles[request.id] ?? "member"}
                    onChange={(e) =>
                      setMemberRoles((prev) => ({
                        ...prev,
                        [request.id]: e.target.value as CommitteeRole,
                      }))
                    }
                    className="text-xs rounded-lg border px-2 py-1.5"
                    style={{ borderColor: C.border, color: C.textPrimary }}
                    disabled={busy}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleApprove(request)}
                    disabled={busy}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-lg cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: C.success }}
                  >
                    {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(request)}
                    disabled={busy}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer disabled:opacity-50"
                    style={{ borderColor: C.border, color: C.error }}
                  >
                    <X className="w-3 h-3" />
                    Decline
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
