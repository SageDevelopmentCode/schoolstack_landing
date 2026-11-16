"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  Mail,
  MapPin,
  Paperclip,
  RotateCw,
  Send,
  Upload,
  X,
} from "lucide-react";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import {
  GChip,
  G_FOCUS,
  G_TOGGLE,
  G_TOGGLE_OFF,
  G_TOGGLE_ON,
  gBtnOutlineSm,
  gBtnPopSm,
} from "@/components/school-parent/garden/ui";
import {
  BusyLabel,
  GardenNotice,
  ROW_INTERACTIVE,
  gBtnDangerSm,
  gBtnOutlineXs,
  gInputClass,
} from "@/components/school-admin/garden/kit";
import {
  SUPPORT_ACCEPTED_FILE_TYPES,
  SUPPORT_MAX_FILES,
  SUPPORT_TOPIC_OPTIONS,
  formatSupportFileSize,
  useSupportRequestForm,
  type SupportRequestForm,
  type SupportTopicValue,
} from "@/components/school-admin/support/useSupportRequestForm";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type AdminSupportRequestModalProps = {
  /** Story theme tokens (school accent + fonts) for the Garden dialog. */
  theme: ParentThemeTokens;
  open: boolean;
  onClose: () => void;
  organizationId: string;
  userEmail?: string | null;
  currentPath?: string;
  submitEndpoint?: string;
  documentationHref?: string;
  readOnly?: boolean;
};

/* ------------------------------------------------------------------ */
/* Topic guidance                                                      */
/* ------------------------------------------------------------------ */

const DEFAULT_PLACEHOLDER = "What were you trying to do? What happened instead?";

const TOPIC_GUIDANCE: Record<SupportTopicValue, { placeholder: string; tip: string }> = {
  general: {
    placeholder: DEFAULT_PLACEHOLDER,
    tip: "A sentence or two is plenty. The more detail, the faster we can help.",
  },
  bug: {
    placeholder: DEFAULT_PLACEHOLDER,
    tip: "Tell us the steps you took and what you expected to see. A screenshot of the error helps a lot.",
  },
  "application-forms": {
    placeholder: "Which form is it, and what do you need help with?",
    tip: "Include the program or form name so we can open the right one.",
  },
  enrollment: {
    placeholder: "Which student is it about, and what's happening?",
    tip: "Include the student's name so we can find the record quickly.",
  },
  billing: {
    placeholder: "Which charge or invoice is it, and what looks wrong?",
    tip: "Include the family name, amount and date if you have them. Never send card numbers.",
  },
  feature: {
    placeholder: "What would you like to be able to do?",
    tip: "Tell us what you're trying to get done. That helps us build the right thing.",
  },
  other: {
    placeholder: DEFAULT_PLACEHOLDER,
    tip: "A sentence or two is plenty. The more detail, the faster we can help.",
  },
};

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

type StepState = "done" | "current" | "todo" | "optional";

function StepBadge({ n, state, size = "sm" }: { n: number; state: StepState; size?: "sm" | "md" }) {
  const box = size === "md" ? "h-7 w-7 text-[13px]" : "h-5 w-5 text-[11px]";
  const look =
    state === "done"
      ? "border-[var(--sf-forest)] bg-[var(--sf-mint)] text-[var(--sf-forest)]"
      : state === "current"
        ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
        : "border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)]/55";
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full border-[1.5px] font-extrabold tabular-nums transition-colors ${box} ${look}`}
    >
      {state === "done" ? <Check className={size === "md" ? "h-4 w-4" : "h-3 w-3"} strokeWidth={3} /> : n}
    </span>
  );
}

const STEP_SR: Record<StepState, string> = {
  done: "done",
  current: "to do next",
  todo: "to do",
  optional: "optional",
};

function StepStrip({ steps }: { steps: { label: string; state: StepState }[] }) {
  return (
    <ol
      aria-label="Steps to send a request"
      className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1.5 rounded-[14px] bg-[var(--sf-paper)] px-3 py-2 text-[12.5px] font-extrabold"
    >
      {steps.map((step, index) => (
        <li key={step.label} className="flex items-center gap-2">
          <StepBadge n={index + 1} state={step.state} />
          <span
            className={
              step.state === "done"
                ? "text-[var(--sf-forest)]"
                : step.state === "current"
                  ? "text-[var(--sf-ink)]"
                  : "text-[var(--sf-ink)]/55"
            }
          >
            {step.label}
            <span className="sr-only"> ({STEP_SR[step.state]})</span>
          </span>
          {index < steps.length - 1 ? (
            <span aria-hidden className="hidden h-[1.5px] w-5 rounded-full bg-[var(--sf-ink)]/15 sm:block" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function StepSection({
  n,
  state,
  title,
  titleId,
  aside,
  children,
}: {
  n: number;
  state: StepState;
  title: string;
  titleId: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <h3 id={titleId} className="m-0 flex items-center gap-2.5 text-[15px] font-extrabold text-[var(--sf-ink)]">
          <StepBadge n={n} state={state} size="md" />
          {title}
        </h3>
        {aside}
      </div>
      <div className="sm:pl-[38px]">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Topic radio group                                                   */
/* ------------------------------------------------------------------ */

function TopicPicker({ form, labelledBy }: { form: SupportRequestForm; labelledBy: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = Math.max(
    0,
    SUPPORT_TOPIC_OPTIONS.findIndex((option) => option.value === form.topic),
  );

  const move = (delta: number) => {
    const count = SUPPORT_TOPIC_OPTIONS.length;
    const next = (selectedIndex + delta + count) % count;
    form.setTopic(SUPPORT_TOPIC_OPTIONS[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="flex flex-wrap gap-1.5"
      data-testid="support-topic"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          move(1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      {SUPPORT_TOPIC_OPTIONS.map((option, index) => {
        const selected = option.value === form.topic;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={form.fieldsDisabled}
            onClick={() => form.setTopic(option.value)}
            className={`${G_TOGGLE} ${selected ? G_TOGGLE_ON : G_TOGGLE_OFF} gap-1`}
          >
            {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Attachments                                                         */
/* ------------------------------------------------------------------ */

function usePasteShortcutLabel(): string {
  const [label] = useState(() =>
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)
      ? "⌘V"
      : "Ctrl+V",
  );
  return label;
}

function Dropzone({
  form,
  onBrowse,
  compact,
}: {
  form: SupportRequestForm;
  onBrowse: () => void;
  compact: boolean;
}) {
  const pasteKey = usePasteShortcutLabel();
  const disabled = form.fieldsDisabled;
  const active = form.dragActive && !disabled;
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-label={compact ? "Add another file" : "Upload screenshots or files"}
      data-testid="support-dropzone"
      data-drag-active={active ? "true" : undefined}
      onClick={() => {
        if (!disabled) onBrowse();
      }}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onBrowse();
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) form.setDragActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled && !form.dragActive) form.setDragActive(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          form.setDragActive(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        form.setDragActive(false);
        if (!disabled && event.dataTransfer.files.length) form.addFiles(event.dataTransfer.files);
      }}
      className={`flex items-center rounded-[16px] border-2 border-dashed text-center transition-all duration-200 ${
        compact ? "flex-row justify-center gap-2 px-4 py-3" : "flex-col justify-center gap-1 px-4 py-6"
      } ${
        active
          ? "scale-[1.01] border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]"
          : "border-[var(--sf-ink)]/20 bg-[var(--sf-paper)]/60 hover:border-[var(--sf-clay)]/60 hover:bg-[var(--sf-accent-wash)]/50"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${G_FOCUS}`}
    >
      {compact ? (
        <>
          <Paperclip className="h-4 w-4 text-[var(--sf-clay-deep)]" aria-hidden />
          <span className="text-[13.5px] font-extrabold text-[var(--sf-ink)]">
            {active ? "Drop to attach" : "Add another file"}
          </span>
          <span className="hidden text-[12px] font-bold text-[var(--sf-ink)]/45 sm:inline">
            or paste ({pasteKey})
          </span>
        </>
      ) : (
        <>
          <span
            aria-hidden
            className={`mb-1.5 flex h-11 w-11 items-center justify-center rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/15 transition-colors ${
              active ? "bg-white" : "bg-[var(--sf-sky)]"
            }`}
          >
            <Upload className={`h-5 w-5 text-[var(--sf-ink)]/75 ${active ? "animate-bounce" : ""}`} />
          </span>
          <span className="text-[14px] font-extrabold text-[var(--sf-ink)]">
            {active ? "Drop to attach" : "Drop files here or click to upload"}
          </span>
          <span className="text-[12.5px] font-semibold text-[var(--sf-soft)]">
            Screenshots, PDFs, or other files that help explain the issue.
          </span>
          <span className="mt-1 text-[11.5px] font-bold text-[var(--sf-ink)]/50">
            Up to {SUPPORT_MAX_FILES} files, 10 MB each · or paste a screenshot ({pasteKey})
          </span>
        </>
      )}
    </div>
  );
}

function AttachmentTiles({ form }: { form: SupportRequestForm }) {
  const reduce = useReducedMotion() === true;
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3" data-testid="support-attachments">
      <AnimatePresence initial={false}>
        {form.attachments.map((item) => (
          <motion.li
            key={item.id}
            layout={!reduce}
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.18 }}
            className="relative overflow-hidden rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white"
          >
            <div className="flex aspect-[4/3] items-center justify-center bg-[var(--sf-paper)]">
              {item.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <FileText className="h-7 w-7 text-[var(--sf-ink)]/45" aria-hidden />
              )}
            </div>
            <div className="px-2.5 py-2">
              <p className="m-0 truncate text-[12.5px] font-extrabold text-[var(--sf-ink)]" title={item.file.name}>
                {item.file.name}
              </p>
              <p className="m-0 text-[11.5px] font-bold tabular-nums text-[var(--sf-ink)]/45">
                {formatSupportFileSize(item.file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => form.removeAttachment(item.id)}
              disabled={form.fieldsDisabled}
              aria-label={`Remove ${item.file.name}`}
              className={`absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/20 bg-white/95 text-[var(--sf-ink)]/70 shadow-sm transition-all hover:border-[var(--sf-ink)]/50 hover:text-[var(--sf-ink)] disabled:opacity-50 ${G_FOCUS}`}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Success                                                             */
/* ------------------------------------------------------------------ */

function SuccessView({
  form,
  userEmail,
}: {
  form: SupportRequestForm;
  userEmail?: string | null;
}) {
  const reduce = useReducedMotion() === true;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sent = form.sent;
  useEffect(() => {
    const timer = window.setTimeout(() => headingRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, []);
  if (!sent) return null;
  return (
    <div className="flex flex-col items-center px-1 pb-2 pt-4 text-center" data-testid="support-success">
      <motion.span
        aria-hidden
        initial={reduce ? false : { scale: 0.5, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", damping: 12, stiffness: 260 }}
        className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-mint)] shadow-[0_4px_0_0_var(--sf-ink)]"
      >
        <Check className="h-8 w-8 text-[var(--sf-forest)]" strokeWidth={3} />
      </motion.span>
      <h3
        ref={headingRef}
        tabIndex={-1}
        id="admin-support-success-title"
        className="sf-display m-0 mt-4 text-[1.5rem] leading-tight text-[var(--sf-ink)] outline-none"
      >
        Request received
      </h3>
      <p
        id="admin-support-success-description"
        className="m-0 mt-1.5 max-w-xs text-[14px] font-semibold leading-relaxed text-[var(--sf-soft)]"
      >
        {userEmail ? `Thanks — we'll follow up at ${userEmail}.` : "Thanks — we'll be in touch soon."}
      </p>

      <dl className="m-0 mt-5 grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-4 py-3.5 text-left text-[13px]">
        <dt className="font-extrabold text-[var(--sf-ink)]/55">Topic</dt>
        <dd className="m-0 font-bold text-[var(--sf-ink)]">{sent.topicLabel}</dd>
        <dt className="font-extrabold text-[var(--sf-ink)]/55">Attachments</dt>
        <dd className="m-0 font-bold tabular-nums text-[var(--sf-ink)]">
          {sent.fileCount > 0 ? plural(sent.fileCount, "file") : "None"}
        </dd>
        {sent.pagePath ? (
          <>
            <dt className="font-extrabold text-[var(--sf-ink)]/55">Page</dt>
            <dd className="m-0 truncate font-bold text-[var(--sf-ink)]" title={sent.pagePath}>
              {sent.pagePath}
            </dd>
          </>
        ) : null}
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dialog                                                              */
/* ------------------------------------------------------------------ */

export default function AdminSupportRequestModal({
  theme,
  open,
  onClose,
  organizationId,
  userEmail,
  currentPath,
  submitEndpoint = "/api/school-admin/support-requests",
  documentationHref,
  readOnly = false,
}: AdminSupportRequestModalProps) {
  const form = useSupportRequestForm({
    organizationId,
    submitEndpoint,
    currentPath,
    userEmail,
    readOnly,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const keepEditingRef = useRef<HTMLButtonElement>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [finePointer] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches === true,
  );

  const formId = useId();
  const topicTitleId = useId();
  const descriptionTitleId = useId();
  const filesTitleId = useId();
  const tipId = useId();
  const errorId = useId();

  const hasDescription = form.description.trim().length > 0;
  const fileCount = form.attachments.length;
  const guidance = TOPIC_GUIDANCE[form.topic] ?? TOPIC_GUIDANCE.general;
  const showDescriptionError = form.submitAttempted && !hasDescription;

  useEffect(() => {
    if (confirmDiscard) keepEditingRef.current?.focus();
  }, [confirmDiscard]);

  const closeNow = () => {
    setConfirmDiscard(false);
    form.reset();
    onClose();
  };

  const requestClose = () => {
    if (form.submitting) return;
    if (!form.sent && form.isDirty) {
      setConfirmDiscard(true);
      return;
    }
    closeNow();
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (form.submitting || readOnly) return;
    setConfirmDiscard(false);
    if (!hasDescription) {
      void form.submit(); // marks the attempt so the inline error shows
      textareaRef.current?.focus();
      return;
    }
    void form.submit();
  };

  const steps: { label: string; state: StepState }[] = [
    { label: "Topic", state: "done" },
    { label: "What happened", state: hasDescription ? "done" : "current" },
    { label: "Screenshots", state: fileCount > 0 ? "done" : "optional" },
  ];

  const statusText = readOnly
    ? "Preview mode — sending is off."
    : form.submitting
      ? fileCount > 0
        ? `Sending your request with ${plural(fileCount, "file")}…`
        : "Sending your request…"
      : !hasDescription
        ? "Add a description to send."
        : fileCount > 0
          ? `Ready to send · ${plural(fileCount, "file")} attached`
          : "Ready to send";

  const footer = form.sent ? (
    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button type="button" onClick={form.startAnother} className={gBtnOutlineSm}>
        Send another
      </button>
      <button type="button" onClick={closeNow} className={gBtnPopSm} data-testid="support-done">
        Done
      </button>
    </div>
  ) : confirmDiscard ? (
    <div
      role="group"
      aria-labelledby={`${formId}-discard`}
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      data-testid="support-discard-confirm"
    >
      <div className="min-w-0">
        <p id={`${formId}-discard`} className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">
          Discard this request?
        </p>
        <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]">
          {fileCount > 0
            ? `Your note and ${plural(fileCount, "file")} won't be sent.`
            : "Your note won't be sent."}
        </p>
      </div>
      <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row">
        <button type="button" onClick={closeNow} className={gBtnDangerSm}>
          Discard
        </button>
        <button
          ref={keepEditingRef}
          type="button"
          onClick={() => setConfirmDiscard(false)}
          className={gBtnOutlineSm}
        >
          Keep editing
        </button>
      </div>
    </div>
  ) : (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p
        aria-live="polite"
        className="m-0 flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--sf-ink)]/60"
        data-testid="support-status"
      >
        {hasDescription && !readOnly ? (
          <Check className="h-3.5 w-3.5 shrink-0 text-[var(--sf-forest)]" strokeWidth={3} aria-hidden />
        ) : (
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sf-ink)]/30" />
        )}
        {statusText}
      </p>
      <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row">
        <button type="button" onClick={requestClose} disabled={form.submitting} className={gBtnOutlineSm}>
          Cancel
        </button>
        <button
          type="submit"
          form={formId}
          disabled={form.submitting || readOnly}
          aria-busy={form.submitting || undefined}
          aria-disabled={!form.canSubmit || undefined}
          className={`${gBtnPopSm} ${!form.canSubmit && !form.submitting ? "opacity-70" : ""}`}
          data-testid="support-submit"
        >
          <BusyLabel
            busy={form.submitting}
            busyLabel={fileCount > 0 ? `Uploading ${plural(fileCount, "file")}…` : "Sending…"}
            icon={<Send className="h-4 w-4" aria-hidden />}
          >
            Submit request
          </BusyLabel>
        </button>
      </div>
    </div>
  );

  return (
    <GDialog
      theme={theme}
      open={open}
      onClose={requestClose}
      closeDisabled={form.submitting}
      titleId="admin-support-modal-title"
      title="Get help"
      description={form.sent ? undefined : "Tell us what's going on — screenshots help a lot."}
      icon={
        <Image
          src="/images/Logo.png"
          alt=""
          width={22}
          height={22}
          className="h-[22px] w-[22px] object-contain"
          aria-hidden
        />
      }
      headerExtra={form.sent ? undefined : <StepStrip steps={steps} />}
      footer={footer}
      footerBordered
      size="lg"
      data-testid="admin-support-dialog"
    >
      {form.sent ? (
        <SuccessView form={form} userEmail={userEmail} />
      ) : (
        <form
          id={formId}
          onSubmit={handleSubmit}
          onPaste={(event) => {
            form.addFromPaste(event);
          }}
          noValidate
          className="flex flex-col gap-5 pb-5"
        >
          {readOnly ? (
            <GardenNotice role="status" title="Preview mode — submissions are disabled.">
              You can look around, but nothing will be sent.
            </GardenNotice>
          ) : null}

          {documentationHref ? (
            <Link
              href={documentationHref}
              onClick={closeNow}
              className={`${ROW_INTERACTIVE} border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-accent-wash)]/60 no-underline`}
            >
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-lav)]"
              >
                <BookOpen className="h-4 w-4 text-[var(--sf-ink)]/75" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-extrabold text-[var(--sf-ink)]">
                  Looking for step-by-step help?
                </span>
                <span className="block text-[12.5px] font-semibold text-[var(--sf-soft)]">
                  Browse our how-to guides first.
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-extrabold text-[var(--sf-clay-deep)]">
                <span className="hidden sm:inline">View how-to guides</span>
                <span className="sr-only sm:hidden">View how-to guides</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          ) : null}

          <StepSection n={1} state="done" title="What's it about?" titleId={topicTitleId}>
            <TopicPicker form={form} labelledBy={topicTitleId} />
          </StepSection>

          <StepSection
            n={2}
            state={hasDescription ? "done" : "current"}
            title="What happened?"
            titleId={descriptionTitleId}
          >
            <textarea
              ref={textareaRef}
              id="support-description"
              aria-labelledby={descriptionTitleId}
              aria-describedby={showDescriptionError ? `${errorId} ${tipId}` : tipId}
              aria-invalid={showDescriptionError || undefined}
              aria-required
              data-autofocus={finePointer ? "" : undefined}
              value={form.description}
              disabled={form.fieldsDisabled}
              onChange={(event) => form.setDescription(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={guidance.placeholder}
              rows={5}
              className={gInputClass(showDescriptionError ? "error" : null, "min-h-[120px] resize-y leading-relaxed")}
            />
            {showDescriptionError ? (
              <p id={errorId} role="alert" className="m-0 mt-1.5 text-[12.5px] font-extrabold text-[#9a3422]">
                Add a few words so we know how to help.
              </p>
            ) : null}
            <p id={tipId} className="m-0 mt-1.5 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
              {guidance.tip}
            </p>
          </StepSection>

          <StepSection
            n={3}
            state={fileCount > 0 ? "done" : "optional"}
            title="Show us"
            titleId={filesTitleId}
            aside={
              fileCount > 0 ? (
                <GChip tone="neutral" className="tabular-nums">
                  {fileCount} of {SUPPORT_MAX_FILES} files
                </GChip>
              ) : (
                <GChip tone="neutral">Optional</GChip>
              )
            }
          >
            <div className="flex flex-col gap-2.5">
              {fileCount > 0 ? <AttachmentTiles form={form} /> : null}
              {fileCount < SUPPORT_MAX_FILES ? (
                <Dropzone
                  form={form}
                  compact={fileCount > 0}
                  onBrowse={() => fileInputRef.current?.click()}
                />
              ) : (
                <p className="m-0 text-[12.5px] font-bold text-[var(--sf-ink)]/55">
                  That&apos;s the {SUPPORT_MAX_FILES}-file limit. Remove one to add another.
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={SUPPORT_ACCEPTED_FILE_TYPES}
                disabled={form.fieldsDisabled}
                className="hidden"
                data-testid="support-file-input"
                onChange={(event) => {
                  if (event.target.files?.length) form.addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
              {form.attachmentErrors.length > 0 ? (
                <GardenNotice tone="warning" role="alert" title="Some files weren't added">
                  <ul className="m-0 list-disc pl-4">
                    {form.attachmentErrors.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </GardenNotice>
              ) : null}
              <span className="sr-only" aria-live="polite">
                {fileCount > 0 ? `${fileCount} of ${SUPPORT_MAX_FILES} files attached.` : ""}
              </span>
            </div>
          </StepSection>

          {currentPath?.trim() || userEmail ? (
            <div className="rounded-[14px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 px-3.5 py-3">
              <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
                We&apos;ll include
              </p>
              <ul className="m-0 mt-1.5 flex list-none flex-col gap-1 p-0 text-[12.5px] font-semibold text-[var(--sf-ink)]/75">
                {currentPath?.trim() ? (
                  <li className="flex min-w-0 items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--sf-ink)]/45" aria-hidden />
                    <span className="shrink-0">The page you&apos;re on:</span>
                    <code className="min-w-0 truncate rounded-md bg-[var(--sf-paper)] px-1.5 py-0.5 text-[12px] font-bold" title={currentPath}>
                      {currentPath}
                    </code>
                  </li>
                ) : null}
                {userEmail ? (
                  <li className="flex min-w-0 items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--sf-ink)]/45" aria-hidden />
                    <span className="min-w-0 truncate">
                      Replies go to <span className="font-extrabold text-[var(--sf-ink)]">{userEmail}</span>
                    </span>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {form.submitError ? (
            <GardenNotice
              tone="alert"
              role="alert"
              title="Couldn't send your request"
              data-testid="support-submit-error"
              action={
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={form.submitting}
                  className={gBtnOutlineXs}
                >
                  <RotateCw className={`h-3.5 w-3.5 ${form.submitting ? "animate-spin" : ""}`} aria-hidden />
                  {form.submitting ? "Trying again…" : "Try again"}
                </button>
              }
            >
              {form.submitError} Nothing was sent — your note and files are still here.
            </GardenNotice>
          ) : null}
        </form>
      )}
    </GDialog>
  );
}
