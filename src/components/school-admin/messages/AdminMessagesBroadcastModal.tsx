"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Loader2, Paperclip, RotateCw, Send, Users } from "lucide-react";
import { GConfirmDialog, GDialog } from "@/components/school-parent/garden/GDialog";
import { GChip, GKicker, GSkeleton, G_FOCUS, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import AdminMessagesBroadcastCompose from "./AdminMessagesBroadcastCompose";
import { ADMIN_BROADCAST_CONFIRM_THRESHOLD, ADMIN_BROADCAST_MAX_RECIPIENTS } from "@/lib/messages/admin-broadcast-constants";
import { describeAdminMessagesFeedback } from "@/lib/messages/admin-messages-feedback";
import { filterContactsByAudience } from "@/lib/messages/contact-filters";
import { formatBroadcastRecipientSummary } from "@/lib/messages/format-broadcast-recipients";
import type { MessageContact } from "@/lib/messages/types";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { STUDENT_GRADE_OPTIONS } from "@/lib/admissions/apply-system-fields";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import AdminMessagesAudiencePicker, {
  emptyAdminBroadcastAudience,
  hasAdminBroadcastAudienceSelection,
  type AdminBroadcastAudienceState,
  type AdminBroadcastOptionClassroom,
  type AdminBroadcastOptionProgram,
} from "./AdminMessagesAudiencePicker";

type BroadcastPreviewResponse = {
  count: number;
  recipientNames: string[];
  exceedsLimit: boolean;
};

type BroadcastFailure = {
  guardianId: string;
  name: string;
  error: string;
};

type BroadcastSendResponse = {
  sentCount: number;
  failedCount: number;
  failures: BroadcastFailure[];
};

class BroadcastSendError extends Error {
  failures: BroadcastFailure[];

  constructor(message: string, failures: BroadcastFailure[] = []) {
    super(message);
    this.name = "BroadcastSendError";
    this.failures = failures;
  }
}

type AdminMessagesBroadcastModalProps = {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  contacts: MessageContact[];
  loadingContacts?: boolean;
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
};

type Step = "recipients" | "compose" | "review";

const STEPS: { key: Step; label: string }[] = [
  { key: "recipients", label: "Choose recipients" },
  { key: "compose", label: "Write" },
  { key: "review", label: "Review & send" },
];

const SEND_ERROR_ID = "admin-broadcast-send-error";
const PARTIAL_ID = "admin-broadcast-partial";

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok) {
    const failures = Array.isArray(data.failures) ? data.failures : [];
    throw new BroadcastSendError(data.error ?? "Request failed.", failures);
  }
  return data as T;
}

/** Numbered step pills in the dialog header; done steps can be revisited. */
function BroadcastStepper({
  step,
  onStep,
  canReach,
  disabled,
}: {
  step: Step;
  onStep: (step: Step) => void;
  canReach: (step: Step) => boolean;
  disabled: boolean;
}) {
  const currentIndex = STEPS.findIndex((item) => item.key === step);
  return (
    <ol aria-label="Steps" className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
      {STEPS.map((item, index) => {
        const current = index === currentIndex;
        const done = index < currentIndex;
        const reachable = !current && canReach(item.key) && !disabled;
        return (
          <li key={item.key} className="flex items-center gap-1.5">
            {index > 0 ? <ArrowRight className="h-3.5 w-3.5 text-[var(--sf-ink)]/30" aria-hidden /> : null}
            <button
              type="button"
              onClick={() => onStep(item.key)}
              disabled={!reachable}
              aria-current={current ? "step" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[12.5px] font-extrabold transition-colors disabled:cursor-default ${
                current
                  ? "bg-[var(--sf-clay)] text-white"
                  : done
                    ? "border-[1.5px] border-[var(--sf-forest)]/30 bg-[var(--sf-mint)] py-[3px] text-[var(--sf-ink)] enabled:hover:border-[var(--sf-forest)]/60"
                    : "border-[1.5px] border-[var(--sf-ink)]/15 bg-white py-[3px] text-[var(--sf-ink)]/55"
              } ${G_FOCUS} focus-visible:ring-offset-0`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  current
                    ? "bg-white text-[var(--sf-clay-deep)]"
                    : done
                      ? "bg-[var(--sf-forest)] text-white"
                      : "border-[1.5px] border-[var(--sf-ink)]/25"
                }`}
                aria-hidden
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
              </span>
              <span className="sr-only">Step {index + 1}: </span>
              {item.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Bulk message in the admin Garden look: 1 choose recipients → 2 write →
 * 3 review & send. Same endpoints, limits, debounce and batch id as before
 * (the batch id is reused on retry, so nobody gets a duplicate).
 */
export default function AdminMessagesBroadcastModal({
  open,
  onClose,
  onSent,
  organizationId,
  organizationSlug,
  schoolName,
  contacts,
  loadingContacts = false,
  C,
  theme,
}: AdminMessagesBroadcastModalProps) {
  const [step, setStep] = useState<Step>("recipients");
  const [audience, setAudience] = useState<AdminBroadcastAudienceState>(emptyAdminBroadcastAudience());
  const [programs, setPrograms] = useState<AdminBroadcastOptionProgram[]>([]);
  const [classrooms, setClassrooms] = useState<AdminBroadcastOptionClassroom[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [optionsNonce, setOptionsNonce] = useState(0);
  const [previewCount, setPreviewCount] = useState(0);
  const [previewRecipientNames, setPreviewRecipientNames] = useState<string[]>([]);
  const [previewExceedsLimit, setPreviewExceedsLimit] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [messageBody, setMessageBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sendFailures, setSendFailures] = useState<BroadcastFailure[]>([]);
  const [lastSentCount, setLastSentCount] = useState(0);
  const [broadcastBatchId, setBroadcastBatchId] = useState<string | null>(null);

  const parentContacts = useMemo(() => filterContactsByAudience(contacts, "parents"), [contacts]);
  const formattedRecipientNames = useMemo(
    () => formatBroadcastRecipientSummary(previewRecipientNames),
    [previewRecipientNames],
  );
  const hasSelection = hasAdminBroadcastAudienceSelection(audience);

  const resetState = useCallback(() => {
    setStep("recipients");
    setAudience(emptyAdminBroadcastAudience());
    setPreviewCount(0);
    setPreviewRecipientNames([]);
    setPreviewExceedsLimit(false);
    setPreviewLoading(false);
    setPreviewError(null);
    setMessageBody("");
    setFiles([]);
    setSending(false);
    setConfirmOpen(false);
    setSendFailures([]);
    setLastSentCount(0);
    setBroadcastBatchId(null);
  }, []);

  const handleClose = useCallback(() => {
    if (sending) return;
    resetState();
    onClose();
  }, [onClose, resetState, sending]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    queueMicrotask(() => {
      setLoadingOptions(true);
      setOptionsError(null);
    });

    void fetchJson<{
      programs: AdminBroadcastOptionProgram[];
      classrooms: AdminBroadcastOptionClassroom[];
    }>(`/api/school-admin/messages/broadcast/options?organizationId=${encodeURIComponent(organizationId)}`)
      .then((data) => {
        if (cancelled) return;
        setPrograms(data.programs);
        setClassrooms(data.classrooms);
      })
      .catch((err) => {
        if (cancelled) return;
        setOptionsError(formatActionError(err, "Failed to load bulk message options."));
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, optionsNonce, organizationId]);

  useEffect(() => {
    if (!open) return undefined;

    if (!hasAdminBroadcastAudienceSelection(audience)) {
      queueMicrotask(() => {
        setPreviewCount(0);
        setPreviewRecipientNames([]);
        setPreviewExceedsLimit(false);
        setPreviewLoading(false);
        setPreviewError(null);
      });
      return undefined;
    }

    let cancelled = false;
    queueMicrotask(() => {
      setPreviewLoading(true);
      setPreviewError(null);
    });
    const timeout = window.setTimeout(() => {
      void fetchJson<BroadcastPreviewResponse>("/api/school-admin/messages/broadcast/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, audience }),
      })
        .then((data) => {
          if (cancelled) return;
          setPreviewCount(data.count);
          setPreviewRecipientNames(data.recipientNames);
          setPreviewExceedsLimit(data.exceedsLimit);
        })
        .catch((err) => {
          if (cancelled) return;
          setPreviewError(formatActionError(err, "Failed to preview recipients."));
        })
        .finally(() => {
          if (!cancelled) setPreviewLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [audience, open, organizationId, previewNonce]);

  const canContinueRecipients =
    hasSelection && previewCount > 0 && !previewExceedsLimit && !previewLoading && !previewError;
  const hasMessage = Boolean(messageBody.trim() || files.length > 0);
  const canSend = hasMessage && previewCount > 0 && !previewExceedsLimit;

  const canReach = (target: Step) =>
    target === "recipients" || (target === "compose" ? canContinueRecipients : canContinueRecipients && hasMessage);

  const handleSend = async () => {
    if (!canSend || sending) return;

    const batchId = broadcastBatchId ?? crypto.randomUUID();
    if (!broadcastBatchId) {
      setBroadcastBatchId(batchId);
    }

    setSending(true);
    setSendFailures([]);
    try {
      const formData = new FormData();
      formData.set("organizationId", organizationId);
      formData.set("organizationSlug", organizationSlug);
      formData.set("schoolName", schoolName);
      formData.set("body", messageBody.trim());
      formData.set("audience", JSON.stringify(audience));
      formData.set("broadcastBatchId", batchId);
      for (const file of files) {
        formData.append("files", file);
      }

      const result = await fetchJson<BroadcastSendResponse>("/api/school-admin/messages/broadcast", {
        method: "POST",
        body: formData,
      });

      if (result.failedCount > 0) {
        setSendFailures(result.failures);
        setLastSentCount(result.sentCount);
        if (result.sentCount > 0) {
          adminToast.dismiss(SEND_ERROR_ID);
          adminToast.info(`Sent to ${result.sentCount} of ${result.sentCount + result.failedCount} parents.`, {
            id: PARTIAL_ID,
            description: `${plural(result.failedCount, "parent")} couldn't be reached — they're listed in Bulk message. Retry won't send duplicates.`,
            action: { label: "Retry", onClick: () => void handleSend() },
            duration: 9000,
          });
          onSent();
        } else {
          adminToast.error("Bulk message not sent.", {
            id: SEND_ERROR_ID,
            description: "None of the selected parents could be reached. Nothing was delivered.",
            action: { label: "Retry", onClick: () => void handleSend() },
          });
        }
        return;
      }

      adminToast.dismiss(SEND_ERROR_ID);
      adminToast.dismiss(PARTIAL_ID);
      adminToast.success("Bulk message sent.", {
        id: "admin-broadcast-sent",
        description: `Delivered to ${plural(result.sentCount, "parent")}, each privately in their school office conversation. Replies come back to your inbox.`,
      });
      onSent();
      resetState();
      onClose();
    } catch (err) {
      if (err instanceof BroadcastSendError && err.failures.length > 0) {
        setSendFailures(err.failures);
      }
      adminToast.error("Bulk message not sent.", {
        id: SEND_ERROR_ID,
        description: `${formatActionError(err, "Failed to send bulk messages.")} Retry won't send duplicates to anyone who already got it.`,
        action: { label: "Retry", onClick: () => void handleSend() },
      });
    } finally {
      setSending(false);
      setConfirmOpen(false);
    }
  };

  const sendButtonLabel =
    previewCount > 0 && previewCount <= 3 && formattedRecipientNames
      ? `Send to ${formattedRecipientNames}`
      : previewCount > 0
        ? `Send to ${plural(previewCount, "parent")}`
        : "Send bulk message";

  const handleSendClick = () => {
    // A retry of the same batch was already confirmed; the server skips anyone who got it.
    if (previewCount > ADMIN_BROADCAST_CONFIRM_THRESHOLD && sendFailures.length === 0) {
      setConfirmOpen(true);
      return;
    }
    void handleSend();
  };

  const audienceSummary = useMemo(() => {
    const parts: string[] = [];
    const programNames = programs.filter((p) => audience.programIds.includes(p.id)).map((p) => p.name);
    const classNames = classrooms.filter((c) => audience.classroomIds.includes(c.id)).map((c) => c.name);
    const gradeNames = STUDENT_GRADE_OPTIONS.filter((g) => audience.gradeValues.includes(g.value)).map((g) => g.label);
    if (programNames.length) parts.push(`Programs: ${programNames.join(", ")}`);
    if (classNames.length) parts.push(`Classes: ${classNames.join(", ")}`);
    if (gradeNames.length) parts.push(`Grades: ${gradeNames.join(", ")}`);
    if (audience.guardianIds.length) parts.push(plural(audience.guardianIds.length, "parent") + " picked by name");
    return parts;
  }, [audience, classrooms, programs]);

  const recipientChip = !hasSelection ? null : previewLoading ? (
    <GChip tone="info" className="inline-flex items-center gap-1">
      <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
      Checking recipients…
    </GChip>
  ) : previewError ? null : previewExceedsLimit ? (
    <GChip tone="alert">
      <span className="tabular-nums">{previewCount}</span> parents · limit {ADMIN_BROADCAST_MAX_RECIPIENTS}
    </GChip>
  ) : (
    <GChip tone={previewCount > 0 ? "success" : "warning"}>
      <span className="tabular-nums">{plural(previewCount, "parent")}</span>
      {previewCount > 0 ? " will get it" : " match"}
    </GChip>
  );

  const footer =
    step === "recipients" ? (
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <span aria-live="polite" className="min-w-0">
          {recipientChip ?? (
            <span className="text-[13px] font-semibold text-[var(--sf-soft)]">Pick at least one group or parent.</span>
          )}
        </span>
        <button
          type="button"
          className={gBtnPopSm}
          disabled={!canContinueRecipients}
          onClick={() => setStep("compose")}
          data-testid="admin-broadcast-continue"
        >
          Next: write
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    ) : step === "compose" ? (
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <button type="button" className={gBtnOutlineSm} onClick={() => setStep("recipients")} disabled={sending}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Recipients
        </button>
        <button
          type="button"
          className={gBtnPopSm}
          disabled={!canSend}
          onClick={() => setStep("review")}
          data-testid="admin-broadcast-review"
        >
          Next: review
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    ) : (
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <button type="button" className={gBtnOutlineSm} onClick={() => setStep("compose")} disabled={sending}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Edit message
        </button>
        <button
          type="button"
          className={gBtnPopSm}
          disabled={!canSend || sending}
          aria-busy={sending || undefined}
          onClick={handleSendClick}
          data-testid="admin-broadcast-send"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden />
              {sendFailures.length > 0 ? `Retry ${plural(sendFailures.length, "parent")}` : sendButtonLabel}
            </>
          )}
        </button>
      </div>
    );

  return (
    <>
      <GDialog
        theme={theme}
        open={open}
        onClose={handleClose}
        closeDisabled={sending}
        title="Bulk message"
        icon={<Users />}
        size="xl"
        footer={footer}
        footerBordered
        data-testid="admin-broadcast-dialog"
        description="Send one message to many parents. Each parent receives it privately in their school office conversation."
        headerExtra={
          <BroadcastStepper step={step} onStep={setStep} canReach={canReach} disabled={sending} />
        }
      >
        {step === "recipients" ? (
          loadingOptions || loadingContacts ? (
            <div role="status" aria-label="Loading recipients" className="space-y-4">
              {[0, 1, 2].map((row) => (
                <div key={row} className="space-y-2">
                  <GSkeleton className="h-3 w-24 !rounded-full" />
                  <div className="flex gap-2">
                    <GSkeleton className="h-8 w-28 !rounded-full" />
                    <GSkeleton className="h-8 w-24 !rounded-full" />
                    <GSkeleton className="h-8 w-32 !rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : optionsError ? (
            <div role="alert" className="rounded-[18px] border-[1.5px] border-[#b4412f]/25 bg-[#fdf0ec] p-4">
              <p className="m-0 flex items-center gap-2 text-[14px] font-extrabold text-[#7c2d12]">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                Couldn&apos;t load programs and classes.
              </p>
              <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-ink)]/75">{optionsError}</p>
              <button
                type="button"
                className={`${gBtnOutlineSm} mt-3 !px-3.5 !py-2`}
                onClick={() => setOptionsNonce((n) => n + 1)}
              >
                <RotateCw className="h-4 w-4" aria-hidden />
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <AdminMessagesAudiencePicker
                C={C}
                audience={audience}
                onAudienceChange={setAudience}
                programs={programs}
                classrooms={classrooms}
                parentContacts={parentContacts}
              />
              {previewError ? (
                <div role="alert" className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#fdf0ec] px-3.5 py-2.5 text-[13px] font-semibold text-[#7c2d12]">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">Couldn&apos;t count recipients. {previewError}</span>
                  <button type="button" className={gLinkSm} onClick={() => setPreviewNonce((n) => n + 1)}>
                    Try again
                  </button>
                </div>
              ) : previewExceedsLimit ? (
                <div role="alert" className="flex items-start gap-2 rounded-2xl bg-[var(--sf-butter)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--sf-ink)]/85">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#9a3412]" aria-hidden />
                  <span>
                    That&apos;s <span className="tabular-nums">{previewCount}</span> parents — a bulk message can reach up
                    to {ADMIN_BROADCAST_MAX_RECIPIENTS}. Remove a program, class or grade, or send it in two parts.
                  </span>
                </div>
              ) : hasSelection && !previewLoading && previewCount > 0 && formattedRecipientNames ? (
                <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                  Including <span className="font-extrabold text-[var(--sf-ink)]/80">{formattedRecipientNames}</span>.
                </p>
              ) : null}
            </div>
          )
        ) : step === "compose" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[var(--sf-mint)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--sf-ink)]/85">
              <Users className="h-4 w-4 shrink-0 text-[var(--sf-forest)]" aria-hidden />
              <span className="min-w-0 flex-1">
                Sending individually to{" "}
                <span className="font-extrabold">{formattedRecipientNames || plural(previewCount, "parent")}</span>.
              </span>
              <button type="button" className={gLinkSm} onClick={() => setStep("recipients")}>
                Change
              </button>
            </div>
            <AdminMessagesBroadcastCompose
              value={messageBody}
              onChange={setMessageBody}
              files={files}
              onFilesChange={setFiles}
              disabled={sending}
              placeholder="Write a message to send to each parent individually…"
              onFilesRejected={(rejection) => {
                const toast = describeAdminMessagesFeedback({ type: "files_rejected", ...rejection });
                if (toast) adminToast.error(toast.title, { id: "admin-broadcast-files-error", description: toast.description });
              }}
            />
          </div>
        ) : (
          <div className="space-y-4" data-testid="admin-broadcast-review-step">
            <section aria-label="Recipients" className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <GKicker>Recipients</GKicker>
                <button type="button" className={`${gLinkSm} !text-[12.5px]`} onClick={() => setStep("recipients")} disabled={sending}>
                  Change
                </button>
              </div>
              <p className="m-0 mt-1 text-[15px] font-extrabold tabular-nums text-[var(--sf-ink)]">
                {plural(previewCount, "parent")}
              </p>
              {audienceSummary.length ? (
                <ul className="m-0 mt-1 list-none space-y-0.5 p-0 text-[13px] font-semibold text-[var(--sf-soft)]">
                  {audienceSummary.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </section>

            <section aria-label="Message" className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4">
              <div className="flex items-center justify-between gap-2">
                <GKicker>Message</GKicker>
                <button type="button" className={`${gLinkSm} !text-[12.5px]`} onClick={() => setStep("compose")} disabled={sending}>
                  Edit
                </button>
              </div>
              {messageBody.trim() ? (
                <p className="m-0 mt-1.5 max-h-48 overflow-y-auto whitespace-pre-wrap text-[14px] font-semibold leading-relaxed text-[var(--sf-ink)]">
                  {messageBody.trim()}
                </p>
              ) : (
                <p className="m-0 mt-1.5 text-[13px] font-semibold text-[var(--sf-soft)]">No text — files only.</p>
              )}
              {files.length ? (
                <p className="m-0 mt-2 flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--sf-ink)]/70">
                  <Paperclip className="h-3.5 w-3.5" aria-hidden />
                  {files.map((file) => file.name).join(", ")}
                </p>
              ) : null}
            </section>

            {sendFailures.length > 0 ? (
              <section role="alert" className="rounded-[18px] border-[1.5px] border-[#b4412f]/25 bg-[#fdf0ec] p-4" data-testid="admin-broadcast-failures">
                <p className="m-0 text-[14px] font-extrabold text-[#7c2d12]">
                  {lastSentCount > 0 ? `Sent to ${plural(lastSentCount, "parent")}. ` : ""}
                  {sendFailures.length === 1
                    ? "1 parent could not be reached:"
                    : `${sendFailures.length} parents could not be reached:`}
                </p>
                <ul className="m-0 mt-2 list-none space-y-1 p-0 text-[13px] font-semibold text-[var(--sf-ink)]/80">
                  {sendFailures.map((failure) => (
                    <li key={failure.guardianId}>
                      <span className="font-extrabold">{failure.name}</span>
                      {failure.error ? ` — ${failure.error}` : null}
                    </li>
                  ))}
                </ul>
                <p className="m-0 mt-2 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                  Fix any issues, then retry. Parents who already received this message will not get a duplicate.
                </p>
              </section>
            ) : (
              <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                Each parent sees this in their school office conversation and can reply to you there.
              </p>
            )}
          </div>
        )}
      </GDialog>

      <GConfirmDialog
        theme={theme}
        open={confirmOpen}
        title={
          formattedRecipientNames
            ? `Send bulk message to ${formattedRecipientNames}?`
            : `Send bulk message to ${previewCount} parents?`
        }
        description="MudKitchen will send this message individually to each parent's school office thread."
        confirmLabel="Send messages"
        loadingLabel="Sending…"
        loading={sending}
        icon={<Send />}
        onConfirm={() => void handleSend()}
        onClose={() => {
          if (!sending) setConfirmOpen(false);
        }}
      />
    </>
  );
}
