"use client";

import { useId, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  Hourglass,
  Loader2,
  Send,
  UserRound,
  Undo2,
} from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { useCelebrate } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GChip,
  NOTE_TINTS,
  gBtnOutlineSm,
  gBtnPopSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import GardenCommitteeSteps from "@/components/school-parent/committees/garden/GardenCommitteeSteps";
import {
  G_INPUT,
  JOIN_STEPS_DONE,
  RequestStatusChip,
  plural,
} from "@/components/school-parent/committees/garden/committee-garden-shared";
import type { CommitteesApiNamespace } from "@/components/portal-committees/PortalCommitteesPage";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import { formatParentActionError, parentToast } from "@/lib/school-parent/parent-toast";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { CommitteeJoinRequestStatus, ParentCommitteeBrowseItem } from "@/lib/committees/types";
import {
  reportPortalOperationalError,
  type PortalOperationalSurface,
} from "@/lib/portal-operational-errors";

type ParentCommitteeDetailProps = {
  committee: ParentCommitteeBrowseItem;
  theme: ParentThemeTokens;
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  requesterName: string;
  apiNamespace: CommitteesApiNamespace;
  operationalSurface: PortalOperationalSurface;
  showGradeField?: boolean;
  readOnly?: boolean;
  onBack: () => void;
  onRequestSubmitted: () => void;
  /** Switches to the My committees tab (shown once a request is approved). */
  onOpenMyCommittees?: () => void;
};

const REVIEW_COPY =
  "Your request will be reviewed by the school. After approval, you will get access to the committee workspace.";

function trackerStep(status: CommitteeJoinRequestStatus | null, isMember: boolean): number {
  if (isMember) return JOIN_STEPS_DONE;
  if (status === "approved") return 3;
  if (status === "pending") return 2;
  return 1;
}

function trackerTitle(status: CommitteeJoinRequestStatus | null, isMember: boolean): string {
  if (isMember) return "You're a member";
  switch (status) {
    case "pending":
      return "Waiting for review";
    case "approved":
      return "Request approved";
    case "declined":
      return "Request declined";
    case "withdrawn":
      return "Request withdrawn";
    default:
      return "Not requested yet";
  }
}

export default function ParentCommitteeDetail({
  committee,
  theme,
  organizationId,
  schoolSlug,
  schoolName,
  requesterName,
  apiNamespace,
  operationalSurface,
  showGradeField = true,
  readOnly = false,
  onBack,
  onRequestSubmitted,
  onOpenMyCommittees,
}: ParentCommitteeDetailProps) {
  const formId = useId();
  const [preferredDutyRoleId, setPreferredDutyRoleId] = useState("");
  const [grade, setGrade] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [confirmWithdrawOpen, setConfirmWithdrawOpen] = useState(false);
  /** Status set by a successful submit/withdraw, shown before the list reload lands. */
  const [localStatus, setLocalStatus] = useState<CommitteeJoinRequestStatus | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useCelebrate(localStatus === "pending" && !readOnly, theme, `committee-request-sent-${committee.id}`);

  const status: CommitteeJoinRequestStatus | null = localStatus ?? committee.requestStatus;

  const showRequestForm = !committee.isMember && (!status || status === "declined");
  const showWithdrawSection = status === "pending" && committee.requestId;

  const handleSubmit = async () => {
    if (readOnly) return;
    setSubmitting(true);
    setAnnouncement("Sending your request…");
    let response: Response | undefined;
    try {
      response = await fetch(`/api/${apiNamespace}/committees/join-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          committeeId: committee.id,
          schoolSlug,
          schoolName,
          committeeName: committee.name,
          preferredDutyRoleId: preferredDutyRoleId || null,
          grade: showGradeField ? grade.trim() || null : null,
          note: note.trim() || null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit request.");
      }
      setLocalStatus("pending");
      setAnnouncement("Join request submitted.");
      parentToast.dismiss(`committee-request-error-${committee.id}`);
      parentToast.success("Join request submitted", {
        id: `committee-request-sent-${committee.id}`,
        description: REVIEW_COPY,
      });
      onRequestSubmitted();
    } catch (err) {
      const message = formatParentActionError(err, "Failed to submit request.");
      setAnnouncement(message);
      parentToast.error("Couldn't send your request", {
        id: `committee-request-error-${committee.id}`,
        description: `${message} Your answers are still here.`,
        action: { label: "Try again", onClick: () => void handleSubmit() },
      });
      void reportPortalOperationalError(
        operationalSurface,
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
    setAnnouncement("Withdrawing your request…");
    let response: Response | undefined;
    try {
      const params = new URLSearchParams({
        organizationId,
        committeeName: committee.name,
        requesterName,
      });
      response = await fetch(
        `/api/${apiNamespace}/committees/join-requests/${committee.requestId}?${params}`,
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to withdraw request.");
      }
      setLocalStatus("withdrawn");
      setConfirmWithdrawOpen(false);
      setAnnouncement("Request withdrawn.");
      parentToast.dismiss(`committee-withdraw-error-${committee.id}`);
      parentToast.success("Request withdrawn", {
        id: `committee-withdrawn-${committee.id}`,
        description: `The school will no longer review your request for ${committee.name}.`,
      });
      onRequestSubmitted();
    } catch (err) {
      const message = formatParentActionError(err, "Failed to withdraw request.");
      setConfirmWithdrawOpen(false);
      setAnnouncement(message);
      parentToast.error("Couldn't withdraw your request", {
        id: `committee-withdraw-error-${committee.id}`,
        description: `${message} Your request is still pending.`,
        action: { label: "Try again", onClick: () => void handleWithdraw() },
      });
      void reportPortalOperationalError(
        operationalSurface,
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

  const step = trackerStep(status, committee.isMember);
  const roleOptions = [
    { id: "", title: "No preference", description: "Happy to help wherever I'm needed." },
    ...committee.dutyRoles,
  ];

  return (
    <>
      <ParentGardenFrame theme={theme}>
        <div className={PORTAL_HOME_CONTAINER_CLASS}>
          <div className="-mb-3">
            <button type="button" onClick={onBack} className={gLinkSm}>
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to explore
            </button>
          </div>

          <ParentGardenPageHeader
            kicker="Volunteer & committees"
            title={committee.name}
            subtitle={
              <span className="mt-1 flex flex-wrap items-center gap-1.5">
                <GChip tone="info">{committee.termLabel}</GChip>
                {committee.isMember ? <GChip tone="success">Member</GChip> : null}
                {status && !committee.isMember ? <RequestStatusChip status={status} /> : null}
                {committee.dutyRoles.length > 0 ? (
                  <GChip tone="neutral">{plural(committee.dutyRoles.length, "role")}</GChip>
                ) : null}
              </span>
            }
          />

          <p className="sr-only" role="status" aria-live="polite">
            {announcement}
          </p>

          {readOnly ? (
            <div className="flex items-center gap-2.5 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-sky)] px-4 py-3">
              <Eye className="h-4 w-4 shrink-0 text-[#24507a]" aria-hidden="true" />
              <p className="m-0 text-[13.5px] font-semibold text-[var(--sf-ink)]/80">
                Preview: requests can&apos;t be sent or withdrawn from here.
              </p>
            </div>
          ) : null}

          <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
            <div className="flex min-w-0 flex-col gap-5">
              <GCard index={1} kicker="About" title="What this committee does" data-testid="parent-committee-about">
                {committee.description ? (
                  <p className="m-0 whitespace-pre-line text-[15px] leading-relaxed text-[var(--sf-ink)]/80">
                    {committee.description}
                  </p>
                ) : (
                  <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">
                    {committee.dutyRoles.length > 0
                      ? "See the roles below to find where you could help."
                      : "The school hasn't added a description yet."}
                  </p>
                )}
                {committee.dutyRoles.length > 0 && !showRequestForm ? (
                  <div className={committee.description ? "mt-5" : ""}>
                    <h3 className="m-0 mb-3 text-[15px] font-extrabold text-[var(--sf-ink)]">Duty roles</h3>
                    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
                      {committee.dutyRoles.map((role, index) => (
                        <li
                          key={role.id}
                          className={`rounded-[14px] p-4 ${NOTE_TINTS[index % NOTE_TINTS.length]}`}
                        >
                          <p className="m-0 flex items-center gap-2 text-[15px] font-extrabold text-[var(--sf-ink)]">
                            <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
                            {role.title}
                          </p>
                          {role.description ? (
                            <p className="m-0 mt-1 text-[13px] font-semibold leading-snug text-[var(--sf-ink)]/70">
                              {role.description}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </GCard>

              {showRequestForm ? (
                <GCard
                  index={2}
                  kicker={status === "declined" ? "Try again" : "Step 2 of 4"}
                  title="Request to join"
                  data-testid="parent-committee-request-form"
                >
                  <p className="m-0 mb-5 text-[14px] font-semibold text-[var(--sf-soft)]">{REVIEW_COPY}</p>
                  {/* Not a <form>: a click before hydration must never do a native GET submit. */}
                  <div id={formId} className="flex flex-col gap-5" aria-busy={submitting || undefined}>
                    <fieldset disabled={readOnly || submitting} className="m-0 flex flex-col gap-5 border-0 p-0">
                      {committee.dutyRoles.length > 0 ? (
                        <div role="radiogroup" aria-labelledby={`${formId}-role`}>
                          <p id={`${formId}-role`} className="m-0 mb-2 text-[13.5px] font-extrabold text-[var(--sf-ink)]">
                            Preferred role <span className="font-semibold text-[var(--sf-soft)]">(optional)</span>
                          </p>
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            {roleOptions.map((role) => {
                              const checked = preferredDutyRoleId === role.id;
                              return (
                                <label
                                  key={role.id || "none"}
                                  className={`group relative flex cursor-pointer items-start gap-3 rounded-[16px] border-[1.5px] p-3.5 transition-colors duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[var(--sf-clay)]/35 has-[:disabled]:cursor-not-allowed ${
                                    checked
                                      ? "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]"
                                      : "border-[var(--sf-ink)]/12 bg-white hover:border-[var(--sf-ink)]/30"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`${formId}-preferred-role`}
                                    value={role.id}
                                    checked={checked}
                                    onChange={() => setPreferredDutyRoleId(role.id)}
                                    className="sr-only"
                                  />
                                  <span
                                    aria-hidden="true"
                                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                      checked ? "border-[var(--sf-clay)] bg-[var(--sf-clay)]" : "border-[var(--sf-ink)]/35 bg-white"
                                    }`}
                                  >
                                    {checked ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-[14.5px] font-extrabold leading-snug text-[var(--sf-ink)]">
                                      {role.title}
                                    </span>
                                    {role.description ? (
                                      <span className="mt-0.5 block line-clamp-2 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
                                        {role.description}
                                      </span>
                                    ) : null}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}

                      {showGradeField ? (
                        <div>
                          <label htmlFor={`${formId}-grade`} className="mb-1.5 block text-[13.5px] font-extrabold text-[var(--sf-ink)]">
                            Child&apos;s grade <span className="font-semibold text-[var(--sf-soft)]">(optional)</span>
                          </label>
                          <input
                            id={`${formId}-grade`}
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            placeholder="e.g. 3rd grade"
                            className={G_INPUT}
                          />
                        </div>
                      ) : null}

                      <div>
                        <label htmlFor={`${formId}-note`} className="mb-1.5 block text-[13.5px] font-extrabold text-[var(--sf-ink)]">
                          Note <span className="font-semibold text-[var(--sf-soft)]">(optional)</span>
                        </label>
                        <textarea
                          id={`${formId}-note`}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                          placeholder="Share relevant experience or availability…"
                          aria-describedby={`${formId}-note-hint`}
                          className={`${G_INPUT} resize-y`}
                        />
                        <p id={`${formId}-note-hint`} className="m-0 mt-1.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                          A line about when you&apos;re free helps the school place you.
                        </p>
                      </div>
                    </fieldset>

                    <div className="flex flex-wrap items-center gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4">
                      <button
                        type="button"
                        onClick={() => void handleSubmit()}
                        disabled={readOnly || submitting}
                        aria-busy={submitting || undefined}
                        className={`${gBtnPopSm} w-full sm:w-auto`}
                        data-testid="parent-committee-submit-request"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Send className="h-4 w-4" aria-hidden="true" />
                        )}
                        {submitting ? "Sending request…" : "Submit request"}
                      </button>
                      <span className="text-[13px] font-semibold text-[var(--sf-soft)]">
                        Every field is optional.
                      </span>
                    </div>
                  </div>
                </GCard>
              ) : null}
            </div>

            <GCard
              index={showRequestForm ? 3 : 2}
              kicker="Your request"
              title={trackerTitle(status, committee.isMember)}
              data-testid="parent-committee-request-status"
            >
              {status === "pending" ? (
                <div className="mb-4 flex items-start gap-3 rounded-[16px] bg-[var(--sf-butter)] p-4">
                  <Hourglass className="mt-0.5 h-5 w-5 shrink-0 text-[#6b4f00]" aria-hidden="true" />
                  <p className="m-0 text-[14px] font-semibold text-[var(--sf-ink)]/80">
                    Your request is waiting for school review.
                  </p>
                </div>
              ) : status === "approved" && !committee.isMember ? (
                <div className="mb-4 flex items-start gap-3 rounded-[16px] bg-[var(--sf-mint)] p-4">
                  <Tick className="h-8 w-8" color="var(--sf-forest)" />
                  <div className="min-w-0">
                    <p className="m-0 text-[14px] font-semibold text-[var(--sf-ink)]/80">
                      Your request was approved. Open this committee from My committees to view the workspace.
                    </p>
                    {onOpenMyCommittees ? (
                      <button type="button" onClick={onOpenMyCommittees} className={`${gLinkSm} mt-2`}>
                        Go to My committees <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : status === "declined" ? (
                <div className="mb-4 flex items-start gap-3 rounded-[16px] bg-[var(--sf-peach)] p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden="true" />
                  <p className="m-0 text-[14px] font-semibold text-[var(--sf-ink)]/80">
                    The school declined your last request. You can send a new one.
                  </p>
                </div>
              ) : status === "withdrawn" ? (
                <div className="mb-4 flex items-start gap-3 rounded-[16px] bg-[var(--sf-ink)]/[0.05] p-4">
                  <Undo2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sf-ink)]/70" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="m-0 text-[14px] font-semibold text-[var(--sf-ink)]/80">
                      You withdrew your request to join this committee.
                    </p>
                    <button type="button" onClick={onBack} className={`${gLinkSm} mt-2`}>
                      Explore other committees <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : null}

              {status !== "withdrawn" ? (
                <GardenCommitteeSteps current={step} compact label="Your progress joining this committee" />
              ) : null}

              {showWithdrawSection ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4">
                  <span className="text-[13px] font-semibold text-[var(--sf-soft)]">Changed your mind?</span>
                  <button
                    type="button"
                    onClick={() => setConfirmWithdrawOpen(true)}
                    disabled={readOnly || withdrawing}
                    aria-busy={withdrawing || undefined}
                    className={`${gBtnOutlineSm} !text-[#b42318]`}
                    data-testid="parent-committee-withdraw-request"
                  >
                    {withdrawing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                    {withdrawing ? "Withdrawing…" : "Withdraw request"}
                  </button>
                </div>
              ) : null}
            </GCard>
          </div>
        </div>
      </ParentGardenFrame>

      <GConfirmDialog
        theme={theme}
        open={confirmWithdrawOpen}
        title={`Withdraw your request to join ${committee.name}?`}
        description="The school will stop reviewing it."
        confirmLabel="Withdraw request"
        loadingLabel="Withdrawing…"
        destructive
        loading={withdrawing}
        onConfirm={() => void handleWithdraw()}
        onClose={() => setConfirmWithdrawOpen(false)}
        data-testid="parent-committee-withdraw-confirm"
      />
    </>
  );
}
