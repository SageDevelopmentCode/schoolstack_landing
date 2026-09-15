"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
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
  theme,
  committeeId,
  compact = false,
  onChanged,
}: CommitteeJoinRequestsPanelProps) {
  const [requests, setRequests] = useState<CommitteeJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [memberRoles, setMemberRoles] = useState<Record<string, CommitteeRole>>({});
  const reducedMotion = useReducedMotion() ?? false;
  const inputStyle = committeeStoryInputStyle(theme);

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
      setRequests(data.requests ?? []);
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.join_requests.load",
        error: "",
      }, err);
      adminToast.error(formatActionError(err, "Failed to load join requests."));
      setRequests([]);
    }
  }, [committeeId, organizationId]);

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
        if (!cancelled) setRequests(data.requests ?? []);
      } catch (err) {
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "committees.join_requests.load",
          error: "",
        }, err);
        if (!cancelled) {
          adminToast.error(formatActionError(err, "Failed to load join requests."));
          setRequests([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [committeeId, organizationId]);

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
          return (
            <motion.div
              key={request.id}
              variants={staggerItem(reducedMotion)}
              className="px-5 py-4 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                    {request.guardianName ?? "Parent"}
                  </p>
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
                    style={inputStyle}
                    disabled={busy}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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
            </motion.div>
          );
        })}
      </motion.div>
    </AdminCard>
  );
}
