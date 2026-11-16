"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Eye, Loader2, Lock, RotateCcw } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import {
  GChip,
  GKicker,
  GSkeleton,
  G_INPUT,
  G_LABEL,
  gBtnOutlineSm,
  gBtnPopSm,
} from "@/components/school-parent/garden/ui";
import type {
  ClassroomSignup,
  ClassroomSignupResponse,
  ParentClassroomSignupStudentOption,
} from "@/lib/classroom-signups/types";
import { SIGNUP_TYPE_LABELS } from "@/lib/classroom-signups/types";
import { getRoleFillCount, getSlotFillCount } from "@/lib/classroom-signups/utils";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { GardenRoleOption, GardenSlotOption } from "./GardenSignupOptions";
import {
  chooseStepLabel,
  missingChoiceHint,
  selectionSummary,
  signupDeadlineLabel,
  signupFromLine,
} from "./signups-garden-ui";
import { useSignupResponseForm } from "./useSignupResponseForm";

type DetailPayload = {
  responses?: ClassroomSignupResponse[];
  familyResponse?: ClassroomSignupResponse | null;
  studentOptions?: ParentClassroomSignupStudentOption[];
  error?: string;
};

type GardenSignupDrawerProps = {
  theme: ParentThemeTokens;
  open: boolean;
  organizationId: string;
  signupId: string | null;
  signup: ClassroomSignup | null;
  initialFamilyResponse: ClassroomSignupResponse | null;
  studentOptions: ParentClassroomSignupStudentOption[];
  readOnly?: boolean;
  onClose: () => void;
  onSubmitted: (signupId: string, response: ClassroomSignupResponse) => void;
  onWithdrawn: (signupId: string) => void;
};

function detailUrl(organizationId: string, signupId: string, studentId?: string | null) {
  const queryParams = new URLSearchParams({ organizationId });
  if (studentId) queryParams.set("studentId", studentId);
  return `/api/parent-portal/classroom-signups/${encodeURIComponent(signupId)}?${queryParams.toString()}`;
}

/**
 * Parent signup drawer (Garden): loads the signup's live responses, then walks
 * the family through picking a time / role / note and confirming. Mount it
 * OUTSIDE the page's ParentGardenFrame (GSidePanel carries its own frame).
 */
export default function GardenSignupDrawer({
  theme,
  open,
  organizationId,
  signupId,
  signup,
  initialFamilyResponse,
  studentOptions,
  readOnly = false,
  onClose,
  onSubmitted,
  onWithdrawn,
}: GardenSignupDrawerProps) {
  const [responses, setResponses] = useState<ClassroomSignupResponse[]>([]);
  const [response, setResponse] = useState<ClassroomSignupResponse | null>(initialFamilyResponse);
  const [detailStudentOptions, setDetailStudentOptions] = useState(studentOptions);
  const [isLoadingDetail, setIsLoadingDetail] = useState(open && signupId != null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadVersion, setLoadVersion] = useState(0);
  const [footerEl, setFooterEl] = useState<HTMLDivElement | null>(null);
  // While the withdraw confirm is up, Escape/backdrop close only that dialog.
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const handlePanelClose = useCallback(() => {
    if (!confirmWithdraw) onClose();
  }, [confirmWithdraw, onClose]);

  // The full load reads the family response the list knew when it started;
  // later list updates refresh counts silently instead of reloading the form.
  const initialResponseRef = useRef(initialFamilyResponse);
  const responseRef = useRef(response);
  useEffect(() => {
    responseRef.current = response;
  }, [response]);

  useEffect(() => {
    if (!open || !signupId) return;

    const activeSignupId = signupId;
    let cancelled = false;

    async function loadDetail() {
      const startResponse = initialResponseRef.current;
      setIsLoadingDetail(true);
      setDetailError(null);
      setResponses([]);
      setResponse(startResponse);

      let fetchResponse: Response | undefined;
      try {
        fetchResponse = await fetch(detailUrl(organizationId, activeSignupId, startResponse?.studentId));
        const payload = (await fetchResponse.json()) as DetailPayload;

        if (!fetchResponse.ok) {
          throw new Error(payload.error ?? "Failed to load signup.");
        }

        if (cancelled) return;

        setResponses(payload.responses ?? []);
        setResponse(payload.familyResponse ?? startResponse);
        setDetailStudentOptions(payload.studentOptions?.length ? payload.studentOptions : studentOptions);
        setLoadVersion((v) => v + 1);
      } catch (error) {
        if (cancelled) return;
        setDetailError(error instanceof Error ? error.message : "Failed to load signup.");
        void reportPortalOperationalError(
          "parent_portal",
          { organizationId, operation: "classroom_signups.detail", error: "" },
          error,
          fetchResponse?.status,
        );
      } finally {
        if (!cancelled) setIsLoadingDetail(false);
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [open, organizationId, signupId, studentOptions, reloadKey]);

  /** Re-read fill counts without resetting what the parent has picked. */
  const refreshCounts = useCallback(async () => {
    if (!signupId) return;
    try {
      const res = await fetch(detailUrl(organizationId, signupId, responseRef.current?.studentId));
      if (!res.ok) return;
      const payload = (await res.json()) as DetailPayload;
      if (payload.responses) setResponses(payload.responses);
    } catch {
      // Counts stay as they were; the server still enforces capacity.
    }
  }, [organizationId, signupId]);

  const hasConfirmedResponse = response?.status === "confirmed";
  const canViewClosedSignup = signup?.status === "closed" && hasConfirmedResponse;
  const canRespond = signup?.status === "open";
  const canShowContent = Boolean(signup && (canRespond || canViewClosedSignup));
  const formReadOnly = readOnly || signup?.status === "closed";
  const showFooter = !isLoadingDetail && !detailError && canShowContent && !formReadOnly;
  const deadline = signup ? signupDeadlineLabel(signup) : null;

  const statusChip = !signup ? null : signup.status === "closed" ? (
    <GChip tone="neutral">
      <Lock className="h-3 w-3" aria-hidden="true" /> Closed
    </GChip>
  ) : hasConfirmedResponse ? (
    <GChip tone="success">
      <Tick className="h-3.5 w-3.5" /> You&apos;re signed up
    </GChip>
  ) : (
    <GChip tone="warning">Needs your response</GChip>
  );

  return (
    <GSidePanel
      theme={theme}
      open={open && signup != null}
      title={signup?.title ?? ""}
      kicker="Help in the classroom"
      subtitle={signup ? signupFromLine(signup) : undefined}
      onClose={handlePanelClose}
      testId="parent-classroom-signup-sidebar"
      panelId="parent-classroom-signup-sidebar"
      headerAside={
        signup ? (
          <div className="flex flex-wrap gap-1.5">
            {statusChip}
            <GChip tone="info">{SIGNUP_TYPE_LABELS[signup.signupType]}</GChip>
            {deadline && signup.status === "open" ? <GChip tone="neutral">{deadline}</GChip> : null}
          </div>
        ) : null
      }
      footer={
        showFooter ? <div ref={setFooterEl} className="flex w-full flex-wrap items-center justify-end gap-2.5" /> : undefined
      }
    >
      {!signup ? null : isLoadingDetail ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading signup">
          <span className="sr-only">Loading signup…</span>
          <GSkeleton className="h-20 !rounded-[18px]" />
          <GSkeleton className="h-6 w-1/2 !rounded-full" />
          <GSkeleton className="h-[76px] !rounded-[18px]" />
          <GSkeleton className="h-[76px] !rounded-[18px]" />
          <GSkeleton className="h-[76px] !rounded-[18px]" />
        </div>
      ) : detailError ? (
        <div className="flex flex-col items-start gap-3 rounded-[18px] bg-[var(--sf-peach)] p-4" role="alert">
          <p className="m-0 flex items-center gap-2 text-[15px] font-extrabold text-[var(--sf-clay-deep)]">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" /> We couldn&apos;t load this signup
          </p>
          <p className="m-0 text-[13px] font-semibold text-[var(--sf-ink)]/75">{detailError}</p>
          <button type="button" className={gBtnOutlineSm} onClick={() => setReloadKey((k) => k + 1)}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
        </div>
      ) : !canShowContent ? (
        <p className="m-0 rounded-[18px] bg-[var(--sf-paper)] p-4 text-[15px] font-semibold text-[var(--sf-ink)]">
          This signup is no longer accepting responses.
        </p>
      ) : (
        <SignupDrawerContent
          key={loadVersion}
          theme={theme}
          organizationId={organizationId}
          signup={signup}
          response={response}
          responses={responses}
          studentOptions={detailStudentOptions}
          readOnly={readOnly}
          formReadOnly={formReadOnly}
          footerEl={showFooter ? footerEl : null}
          confirmWithdraw={confirmWithdraw}
          setConfirmWithdraw={setConfirmWithdraw}
          onRejected={() => void refreshCounts()}
          onSubmitted={(nextResponse) => {
            setResponse(nextResponse);
            setResponses((current) => [
              ...current.filter((entry) => entry.familyId !== nextResponse.familyId),
              nextResponse,
            ]);
            onSubmitted(signup.id, nextResponse);
            void refreshCounts();
          }}
          onWithdrawn={() => {
            const familyId = response?.familyId;
            if (!familyId) return;
            setResponse(null);
            setResponses((current) => current.filter((entry) => entry.familyId !== familyId));
            onWithdrawn(signup.id);
            void refreshCounts();
          }}
        />
      )}
    </GSidePanel>
  );
}

/* ------------------------------------------------------------------ */

function StepHeading({
  n,
  title,
  hint,
  done,
  current,
}: {
  n: number;
  title: string;
  hint?: ReactNode;
  done: boolean;
  current: boolean;
}) {
  return (
    <div className="mb-3 flex items-start gap-3">
      {done ? (
        <Tick className="h-8 w-8" color="var(--sf-forest)" fill="var(--sf-mint)" />
      ) : (
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-extrabold ${
            current
              ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
              : "border-[var(--sf-ink)]/25 bg-white text-[var(--sf-ink)]/60"
          }`}
        >
          {n}
        </span>
      )}
      <div className="min-w-0 pt-0.5">
        <h3 className="m-0 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
          <span className="sr-only">Step {n}{done ? " (done)" : ""}: </span>
          {title}
        </h3>
        {hint ? <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">{hint}</p> : null}
      </div>
    </div>
  );
}

function SignupDrawerContent({
  theme,
  organizationId,
  signup,
  response,
  responses,
  studentOptions,
  readOnly,
  formReadOnly,
  footerEl,
  confirmWithdraw,
  setConfirmWithdraw,
  onSubmitted,
  onWithdrawn,
  onRejected,
}: {
  theme: ParentThemeTokens;
  organizationId: string;
  signup: ClassroomSignup;
  response: ClassroomSignupResponse | null;
  responses: ClassroomSignupResponse[];
  studentOptions: ParentClassroomSignupStudentOption[];
  readOnly: boolean;
  formReadOnly: boolean;
  footerEl: HTMLDivElement | null;
  confirmWithdraw: boolean;
  setConfirmWithdraw: (open: boolean) => void;
  onSubmitted: (response: ClassroomSignupResponse) => void;
  onWithdrawn: () => void;
  onRejected: () => void;
}) {
  const form = useSignupResponseForm({
    organizationId,
    signup,
    existingResponse: response,
    allResponses: responses,
    studentOptions,
    readOnly: formReadOnly,
    onSubmitted,
    onWithdrawn,
    onRejected,
  });

  const multipleStudents = studentOptions.length > 1;
  const studentName = studentOptions.find((s) => s.id === form.studentId)?.name ?? null;
  const savedSummary = response
    ? selectionSummary(signup, response.selectedSlotIds, response.selectedRoleIds, response.note ?? "")
    : "";
  const closed = signup.status === "closed";
  const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((id) => b.includes(id));
  // Nothing changed since the last save: step 3 shows as done.
  const unchanged =
    form.hasResponse &&
    response != null &&
    sameSet(form.selectedSlotIds, response.selectedSlotIds) &&
    sameSet(form.selectedRoleIds, response.selectedRoleIds) &&
    form.note.trim() === (response.note ?? "").trim();
  const multipleSlots = Boolean(signup.config.allowMultipleSelections);

  // Step numbering (the student step only shows for families with 2+ children).
  const chooseN = multipleStudents ? 2 : 1;
  const confirmN = chooseN + 1;
  const studentDone = Boolean(form.studentId);
  const currentStep = multipleStudents && !studentDone ? 1 : !form.hasChoice ? chooseN : confirmN;

  const chooseHint =
    signup.signupType === "time_slots"
      ? multipleSlots
        ? "Pick as many times as you like."
        : "Pick one time that works for you."
      : signup.signupType === "roles"
        ? "Choose one or more ways to help."
        : null;

  const footer = (
    <>
      {form.hasResponse ? (
        <button
          type="button"
          className={`${gBtnOutlineSm} mr-auto`}
          disabled={form.withdrawing || form.submitting}
          onClick={() => setConfirmWithdraw(true)}
          data-testid="parent-signup-withdraw"
        >
          Withdraw
        </button>
      ) : !form.canSubmit ? (
        <p className="m-0 mr-auto text-[13px] font-semibold text-[var(--sf-soft)]" aria-live="polite">
          {missingChoiceHint(signup)}
        </p>
      ) : null}
      <button
        type="button"
        className={gBtnPopSm}
        disabled={!form.canSubmit || form.submitting}
        aria-busy={form.submitting || undefined}
        onClick={() => void form.handleSubmit()}
        data-testid="parent-signup-submit"
      >
        {form.submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Saving…
          </>
        ) : form.hasResponse ? (
          "Update response"
        ) : (
          "Confirm signup"
        )}
      </button>
    </>
  );

  return (
    <>
      {readOnly ? (
        <p className="m-0 flex items-center gap-2 rounded-[14px] bg-[var(--sf-sky)] px-3.5 py-2.5 text-[13px] font-extrabold text-[#24507a]">
          <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
          Preview mode — responses can&apos;t be saved here.
        </p>
      ) : null}

      {closed ? (
        <p className="m-0 flex items-center gap-2 rounded-[14px] bg-[var(--sf-sky)] px-3.5 py-2.5 text-[13px] font-extrabold text-[#24507a]">
          <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
          This signup has closed. Here&apos;s what you signed up for.
        </p>
      ) : null}

      {form.hasResponse && !closed ? (
        <div className="flex items-start gap-3 rounded-[18px] bg-[var(--sf-mint)] p-4" data-testid="parent-signup-confirmed">
          <Tick className="h-9 w-9" color="var(--sf-forest)" />
          <div className="min-w-0">
            <p className="m-0 text-[15px] font-extrabold text-[var(--sf-forest)]">You&apos;re signed up</p>
            {savedSummary ? (
              <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-ink)]/80">{savedSummary}</p>
            ) : null}
            {!formReadOnly ? (
              <p className="m-0 mt-1.5 text-[12.5px] font-semibold text-[var(--sf-ink)]/65">
                Need a change? Adjust below and press Update response, or withdraw.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {signup.description ? (
        <div className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4">
          <GKicker>From the teacher</GKicker>
          <p className="m-0 mt-1.5 whitespace-pre-line text-[15px] leading-relaxed text-[var(--sf-ink)]/85">
            {signup.description}
          </p>
        </div>
      ) : null}

      {multipleStudents ? (
        <section>
          <StepHeading
            n={1}
            title="Who's helping for"
            hint={
              formReadOnly ? undefined : form.hasResponse ? "Withdraw first to switch children." : "Pick the child this help is for."
            }
            done={studentDone && currentStep > 1}
            current={currentStep === 1}
          />
          <label htmlFor="parent-signup-student" className="sr-only">
            Student
          </label>
          <select
            id="parent-signup-student"
            value={form.studentId}
            disabled={formReadOnly || form.hasResponse}
            onChange={(e) => form.setStudentId(e.target.value)}
            className={G_INPUT}
          >
            {studentOptions.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </section>
      ) : null}

      <section>
        <StepHeading
          n={chooseN}
          title={closed ? "Your signup" : chooseStepLabel(signup)}
          hint={closed ? undefined : chooseHint}
          done={form.hasChoice && currentStep > chooseN}
          current={currentStep === chooseN}
        />

        {signup.signupType === "time_slots" ? (
          <div
            role={multipleSlots ? "group" : "radiogroup"}
            aria-label={chooseStepLabel(signup)}
            className="flex flex-col gap-2.5"
          >
            {(signup.config.slots ?? []).map((slot) => (
              <GardenSlotOption
                key={slot.id}
                slot={slot}
                fillCount={getSlotFillCount(slot.id, responses)}
                selected={form.selectedSlotIds.includes(slot.id)}
                disabled={formReadOnly}
                multiple={multipleSlots}
                onSelect={() => form.toggleSlot(slot.id)}
              />
            ))}
          </div>
        ) : null}

        {signup.signupType === "roles" ? (
          <div role="group" aria-label="Choose roles" className="flex flex-col gap-2.5">
            {(signup.config.roles ?? []).map((role) => (
              <GardenRoleOption
                key={role.id}
                role={role}
                fillCount={getRoleFillCount(role.id, responses)}
                selected={form.selectedRoleIds.includes(role.id)}
                disabled={formReadOnly}
                onToggle={() => form.toggleRole(role.id)}
              />
            ))}
          </div>
        ) : null}

        {signup.signupType === "open" ? (
          <div>
            <label htmlFor="parent-signup-note" className={G_LABEL}>
              {signup.config.parentPrompt ?? "How can you help?"}
            </label>
            <textarea
              id="parent-signup-note"
              rows={4}
              value={form.note}
              disabled={formReadOnly}
              onChange={(e) => form.setNote(e.target.value)}
              className={`${G_INPUT} resize-y`}
            />
          </div>
        ) : null}
      </section>

      {!formReadOnly ? (
        <section>
          <StepHeading
            n={confirmN}
            title={unchanged ? "Saved" : form.hasResponse ? "Save your changes" : "Review & confirm"}
            hint={unchanged ? "Change your choice above any time while the signup is open." : undefined}
            done={unchanged}
            current={!unchanged && currentStep === confirmN}
          />
          <div
            aria-live="polite"
            className={`rounded-[18px] p-4 ${
              unchanged
                ? "bg-[var(--sf-mint)]"
                : form.hasChoice
                ? "border-[1.5px] border-[var(--sf-clay)]/30 bg-[var(--sf-accent-wash)]"
                : "border-[1.5px] border-dashed border-[var(--sf-ink)]/20 bg-white"
            }`}
          >
            {form.hasChoice ? (
              <>
                <GKicker>
                  {unchanged ? "You're signed up for" : form.hasResponse ? "Your response will be" : "You're signing up for"}
                </GKicker>
                <p className="m-0 mt-1 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">{form.summary}</p>
                {studentName ? (
                  <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-soft)]">For {studentName}</p>
                ) : null}
              </>
            ) : (
              <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">
                Nothing picked yet — your choice will show up here.
              </p>
            )}
          </div>

          {form.lastError ? (
            <div role="alert" className="mt-3 flex items-start gap-2 rounded-[14px] bg-[var(--sf-peach)] px-3.5 py-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden="true" />
              <p className="m-0 text-[13px] font-semibold text-[var(--sf-ink)]">
                <span className="font-extrabold text-[var(--sf-clay-deep)]">That didn&apos;t save.</span> {form.lastError}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {footerEl ? createPortal(footer, footerEl) : null}

      <GConfirmDialog
        theme={theme}
        open={confirmWithdraw}
        title={`Withdraw from ${signup.title}?`}
        description={
          savedSummary
            ? `This frees up your spot (${savedSummary}). You can sign up again while it's open.`
            : "You can sign up again while it's open."
        }
        confirmLabel="Withdraw"
        loadingLabel="Withdrawing…"
        destructive
        loading={form.withdrawing}
        onClose={() => setConfirmWithdraw(false)}
        onConfirm={() => {
          void form.handleWithdraw().then(() => setConfirmWithdraw(false));
        }}
        data-testid="parent-signup-withdraw-dialog"
        confirmTestId="parent-signup-withdraw-confirm"
      />
    </>
  );
}
