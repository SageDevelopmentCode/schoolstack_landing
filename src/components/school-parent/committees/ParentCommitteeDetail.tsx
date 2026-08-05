"use client";

import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentCommitteeBrowseItem } from "@/lib/committees/types";
import ParentCommitteeRequestStatus from "./ParentCommitteeRequestStatus";

type ParentCommitteeDetailProps = {
  committee: ParentCommitteeBrowseItem;
  C: AdminThemeTokens;
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  guardianName: string;
  readOnly?: boolean;
  onBack: () => void;
  onRequestSubmitted: () => void;
};

export default function ParentCommitteeDetail({
  committee,
  C,
  organizationId,
  schoolSlug,
  schoolName,
  guardianName,
  readOnly = false,
  onBack,
  onRequestSubmitted,
}: ParentCommitteeDetailProps) {
  const [preferredDutyRoleId, setPreferredDutyRoleId] = useState("");
  const [grade, setGrade] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const showRequestForm =
    !committee.isMember &&
    (!committee.requestStatus || committee.requestStatus === "declined");

  const showWithdrawSection =
    committee.requestStatus === "pending" && committee.requestId;

  const handleSubmit = async () => {
    if (readOnly) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/parent-portal/committees/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          committeeId: committee.id,
          schoolSlug,
          schoolName,
          committeeName: committee.name,
          preferredDutyRoleId: preferredDutyRoleId || null,
          grade: grade.trim() || null,
          note: note.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to submit request.");
      }
      setFeedback({ type: "success", message: "Join request submitted." });
      onRequestSubmitted();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to submit request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (readOnly || !committee.requestId) return;
    setWithdrawing(true);
    try {
      const params = new URLSearchParams({
        organizationId,
        committeeName: committee.name,
        guardianName,
      });
      const res = await fetch(
        `/api/parent-portal/committees/join-requests/${committee.requestId}?${params}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to withdraw request.");
      }
      setFeedback({ type: "success", message: "Request withdrawn." });
      onRequestSubmitted();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to withdraw request.",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs cursor-pointer"
        style={{ color: C.textTertiary }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to explore
      </button>

      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <h2 className="text-lg font-heading font-semibold" style={{ color: C.textPrimary }}>
            {committee.name}
          </h2>
          <span
            className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            {committee.termLabel}
          </span>
          {committee.isMember && (
            <span
              className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
              style={{ backgroundColor: C.successBg, color: C.success }}
            >
              Member
            </span>
          )}
          {committee.requestStatus && !committee.isMember && (
            <ParentCommitteeRequestStatus status={committee.requestStatus} C={C} />
          )}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
          {committee.description}
        </p>
      </div>

      {feedback && (
        <p
          className="text-sm rounded-lg px-3 py-2"
          style={{
            color: feedback.type === "success" ? C.success : C.error,
            backgroundColor: feedback.type === "success" ? C.successBg : C.errorBg,
          }}
        >
          {feedback.message}
        </p>
      )}

      {committee.dutyRoles.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
            Duty roles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {committee.dutyRoles.map((role) => (
              <div
                key={role.id}
                className="p-4 rounded-xl border"
                style={{ backgroundColor: C.surface, borderColor: C.border }}
              >
                <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {role.title}
                </p>
                <p className="text-xs mt-1" style={{ color: C.textSecondary }}>
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showRequestForm && (
        <div
          className="rounded-2xl border p-6 space-y-4"
          style={{ backgroundColor: C.surface, borderColor: C.border }}
        >
          <div>
            <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              Request to join
            </h3>
            <p className="text-xs mt-1" style={{ color: C.textSecondary }}>
              Your request will be reviewed by the school. You will get read-only access to the
              committee workspace after approval.
            </p>
          </div>

          {committee.dutyRoles.length > 0 && (
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: C.textSecondary }}>
                Preferred role (optional)
              </label>
              <select
                value={preferredDutyRoleId}
                onChange={(e) => setPreferredDutyRoleId(e.target.value)}
                disabled={readOnly}
                className="w-full text-sm rounded-lg border px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: C.border, color: C.textPrimary }}
              >
                <option value="">No preference</option>
                {committee.dutyRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: C.textSecondary }}>
              Child&apos;s grade (optional)
            </label>
            <input
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. 3rd grade"
              disabled={readOnly}
              className="w-full text-sm rounded-lg border px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: C.border, color: C.textPrimary }}
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: C.textSecondary }}>
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Share relevant experience or availability…"
              disabled={readOnly}
              className="w-full text-sm rounded-lg border px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: C.border, color: C.textPrimary }}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={readOnly || submitting}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: C.accent }}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit request
          </button>
        </div>
      )}

      {showWithdrawSection && (
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: C.surface, borderColor: C.border }}
        >
          <p className="text-sm mb-3" style={{ color: C.textSecondary }}>
            Your request is waiting for school review.
          </p>
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={readOnly || withdrawing}
            className="text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: C.error }}
          >
            {withdrawing ? "Withdrawing…" : "Withdraw request"}
          </button>
        </div>
      )}

      {committee.requestStatus === "approved" && !committee.isMember && (
        <p className="text-sm" style={{ color: C.textSecondary }}>
          Your request was approved. Open this committee from My committees to view the workspace.
        </p>
      )}
    </div>
  );
}
