"use client";

import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ParentCommitteeBrowseItem } from "@/lib/committees/types";
import ParentCommitteeRequestStatus from "./ParentCommitteeRequestStatus";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type ParentCommitteeDetailProps = {
  committee: ParentCommitteeBrowseItem;
  theme: ParentThemeTokens;
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  guardianName: string;
  readOnly?: boolean;
  onBack: () => void;
  onRequestSubmitted: () => void;
};

const inputClassName =
  "w-full rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50";

export default function ParentCommitteeDetail({
  committee,
  theme,
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

  const inputStyle = {
    borderColor: theme.line,
    color: theme.ink,
    backgroundColor: theme.white,
  };

  const handleSubmit = async () => {
    if (readOnly) return;
    setSubmitting(true);
    let response: Response | undefined;
    try {
      response = await fetch("/api/parent-portal/committees/join-requests", {
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
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit request.");
      }
      setFeedback({ type: "success", message: "Join request submitted." });
      onRequestSubmitted();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to submit request.",
      });
      void reportPortalOperationalError(
        "parent_portal",
        {
          organizationId,
          operation: "committees.join_request_submit",
          error: "",
        },
        err,
        response?.status,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (readOnly || !committee.requestId) return;
    setWithdrawing(true);
    let response: Response | undefined;
    try {
      const params = new URLSearchParams({
        organizationId,
        committeeName: committee.name,
        guardianName,
      });
      response = await fetch(
        `/api/parent-portal/committees/join-requests/${committee.requestId}?${params}`,
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to withdraw request.");
      }
      setFeedback({ type: "success", message: "Request withdrawn." });
      onRequestSubmitted();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to withdraw request.",
      });
      void reportPortalOperationalError(
        "parent_portal",
        {
          organizationId,
          operation: "committees.join_request_withdraw",
          error: "",
        },
        err,
        response?.status,
      );
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="min-h-full w-full" style={{ backgroundColor: theme.paper }}>
      <div className="mx-auto flex w-full max-w-[1250px] flex-col gap-6 px-4 py-6 sm:gap-8 sm:py-8 md:px-9">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-80"
          style={{ color: theme.muted }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to explore
        </button>

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <ParentDisplayHeading theme={theme} as="h1" size="section">
              {committee.name}
            </ParentDisplayHeading>
            <ParentChip theme={theme} tone="info">
              {committee.termLabel}
            </ParentChip>
            {committee.isMember && (
              <ParentChip theme={theme} tone="success">
                Member
              </ParentChip>
            )}
            {committee.requestStatus && !committee.isMember && (
              <ParentCommitteeRequestStatus status={committee.requestStatus} theme={theme} />
            )}
          </div>
          <p className="text-[14px] leading-relaxed" style={{ color: theme.muted }}>
            {committee.description}
          </p>
        </div>

        {feedback && (
          <p
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              color: feedback.type === "success" ? theme.success : theme.alert,
              backgroundColor:
                feedback.type === "success" ? theme.successBg : theme.alertBg,
            }}
          >
            {feedback.message}
          </p>
        )}

        {committee.dutyRoles.length > 0 && (
          <div>
            <h3
              className="mb-3 text-[14px] font-bold"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              Duty roles
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {committee.dutyRoles.map((role) => (
                <ParentCard key={role.id} theme={theme} className="!p-4">
                  <p className="text-[14px] font-semibold" style={{ color: theme.ink }}>
                    {role.title}
                  </p>
                  <p className="mt-1 text-[12px]" style={{ color: theme.muted }}>
                    {role.description}
                  </p>
                </ParentCard>
              ))}
            </div>
          </div>
        )}

        {showRequestForm && (
          <ParentCard theme={theme} className="space-y-4">
            <div>
              <h3
                className="text-[14px] font-bold"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                Request to join
              </h3>
              <p className="mt-1 text-[12px]" style={{ color: theme.muted }}>
                Your request will be reviewed by the school. After approval, you will get
                access to the committee workspace.
              </p>
            </div>

            {committee.dutyRoles.length > 0 && (
              <div>
                <label
                  className="mb-1 block text-[12px] font-medium"
                  style={{ color: theme.muted }}
                >
                  Preferred role (optional)
                </label>
                <select
                  value={preferredDutyRoleId}
                  onChange={(e) => setPreferredDutyRoleId(e.target.value)}
                  disabled={readOnly}
                  className={inputClassName}
                  style={inputStyle}
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
              <label
                className="mb-1 block text-[12px] font-medium"
                style={{ color: theme.muted }}
              >
                Child&apos;s grade (optional)
              </label>
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. 3rd grade"
                disabled={readOnly}
                className={inputClassName}
                style={inputStyle}
              />
            </div>

            <div>
              <label
                className="mb-1 block text-[12px] font-medium"
                style={{ color: theme.muted }}
              >
                Note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Share relevant experience or availability…"
                disabled={readOnly}
                className={inputClassName}
                style={inputStyle}
              />
            </div>

            <ParentButton
              theme={theme}
              variant="primary"
              onClick={handleSubmit}
              disabled={readOnly || submitting}
              className="flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit request
            </ParentButton>
          </ParentCard>
        )}

        {showWithdrawSection && (
          <ParentCard theme={theme}>
            <p className="mb-3 text-[13px]" style={{ color: theme.muted }}>
              Your request is waiting for school review.
            </p>
            <ParentButton
              theme={theme}
              variant="outline"
              onClick={handleWithdraw}
              disabled={readOnly || withdrawing}
              className="!border-transparent !text-[13px] !font-semibold"
              style={{ color: theme.alert }}
            >
              {withdrawing ? "Withdrawing…" : "Withdraw request"}
            </ParentButton>
          </ParentCard>
        )}

        {committee.requestStatus === "approved" && !committee.isMember && (
          <p className="text-[13px]" style={{ color: theme.muted }}>
            Your request was approved. Open this committee from My committees to view the workspace.
          </p>
        )}
      </div>
    </div>
  );
}
