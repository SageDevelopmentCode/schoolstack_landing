"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { ArrowLeft, ArrowRight, BellRing, CalendarClock, Check, Save, Send, Sparkles, UsersRound } from "lucide-react";
import ClassroomSignupConfigureForm from "./ClassroomSignupConfigureForm";
import SignupTemplateSidebar from "./SignupTemplateSidebar";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import { GCard, GChip, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { BusyLabel, GardenNotice } from "@/components/school-admin/garden/kit";
import {
  applyTemplateToDraft,
  buildSignupFromTemplate,
} from "@/lib/classroom-signups/templates";
import { createTeacherSignup } from "@/lib/classroom-signups/teacher-signups-client";
import type {
  ClassroomSignup,
  ClassroomSignupDraft,
  ClassroomSignupTemplateId,
  TeacherClassroomOption,
} from "@/lib/classroom-signups/types";
import { SIGNUP_TYPE_LABELS } from "@/lib/classroom-signups/types";
import {
  classroomNamesForSelection,
  estimateFamilyCountForClassrooms,
  formatAudienceLabel,
  formatSignupDeadline,
} from "@/lib/classroom-signups/utils";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type WizardStep = 1 | 2;

function wizardStepVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };
  }
  return {
    enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 20 : -20 }),
    center: { opacity: 1, x: 0 },
    exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -20 : 20 }),
  };
}

function wizardStepTransition(reducedMotion: boolean): Transition {
  return reducedMotion ? { duration: 0.15 } : { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] };
}

type ClassroomSignupCreateWizardProps = {
  organizationId: string;
  teacherName: string;
  classroomOptions: TeacherClassroomOption[];
  assignedFamilyCount: number;
  onCancel: () => void;
  /** Published (open). `remindNow` = the teacher chose "Publish & send reminder". */
  onPublished: (signup: ClassroomSignup, options: { remindNow: boolean }) => void;
  /** Saved as a draft (not visible to families). */
  onDraftSaved: (signup: ClassroomSignup) => void;
};

const STEPS: { step: WizardStep; label: string }[] = [
  { step: 1, label: "Set it up" },
  { step: 2, label: "Review & publish" },
];

function StepTrail({ step }: { step: WizardStep }) {
  return (
    <ol className="m-0 flex list-none items-center gap-2 p-0" aria-label={`Step ${step} of 2`}>
      {STEPS.map((entry, index) => {
        const done = entry.step < step;
        const current = entry.step === step;
        return (
          <li key={entry.step} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden className={`h-[2px] w-6 rounded-full sm:w-10 ${done || current ? "bg-[var(--sf-clay)]" : "bg-[var(--sf-ink)]/15"}`} /> : null}
            <span
              aria-current={current ? "step" : undefined}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-extrabold ${
                current
                  ? "bg-[var(--sf-accent-wash)] text-[var(--sf-ink)] ring-[1.5px] ring-[var(--sf-clay)]/35"
                  : done
                    ? "text-[var(--sf-forest)]"
                    : "text-[var(--sf-ink)]/50"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] text-[12px] tabular-nums ${
                  done
                    ? "border-[var(--sf-forest)] bg-[var(--sf-forest)] text-white"
                    : current
                      ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
                      : "border-[var(--sf-ink)]/25 bg-white"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : entry.step}
              </span>
              {entry.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function hasDraftContent(draft: ClassroomSignupDraft): boolean {
  if (draft.title.trim() || draft.description.trim() || draft.responseDeadline) {
    return true;
  }

  if (draft.signupType === "time_slots") {
    const slots = draft.config.slots ?? [];
    return slots.some(
      (slot) =>
        slot.label.trim() ||
        slot.date ||
        slot.startTime !== "09:00" ||
        slot.endTime !== "09:30" ||
        slot.capacity !== 1,
    );
  }

  if (draft.signupType === "roles") {
    const roles = draft.config.roles ?? [];
    return roles.some(
      (role) =>
        role.name.trim() ||
        role.description.trim() ||
        role.quantityNeeded !== 1,
    );
  }

  const defaultPrompt = "How would you like to help?";
  return (draft.config.parentPrompt ?? "").trim() !== defaultPrompt;
}

function createInitialDraft(
  classroomOptions: TeacherClassroomOption[],
): ClassroomSignupDraft {
  const defaultClassroomIds =
    classroomOptions.length === 1 ? [classroomOptions[0].id] : [];

  return buildSignupFromTemplate("blank", {
    audience: "classrooms",
    classroomIds: defaultClassroomIds,
    classroomId: null,
    classroomName:
      classroomNamesForSelection(classroomOptions, defaultClassroomIds) || null,
    familyCount: estimateFamilyCountForClassrooms(
      classroomOptions,
      defaultClassroomIds,
    ),
  });
}
/**
 * Create a classroom signup (Garden): two clear steps (set it up → review &
 * publish), templates, a real "Save as draft", and "Publish & send reminder"
 * that opens the reminder dialog once the signup is live. Leaving with
 * unsaved work or applying a template over it asks first.
 */
export default function ClassroomSignupCreateWizard({
  organizationId,
  classroomOptions,
  onCancel,
  onPublished,
  onDraftSaved,
}: ClassroomSignupCreateWizardProps) {
  const { theme } = useParentTheme();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState<WizardStep>(1);
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<ClassroomSignupDraft>(() => createInitialDraft(classroomOptions));
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<ClassroomSignupTemplateId | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [busy, setBusy] = useState<null | "draft" | "publish" | "publish-remind">(null);
  const [error, setError] = useState<string | null>(null);

  const canReview = Boolean(draft.title.trim()) && draft.classroomIds.length > 0;
  const missing = [!draft.title.trim() ? "a title" : null, draft.classroomIds.length === 0 ? "at least one classroom" : null].filter(Boolean);

  const updateDraft = (patch: Partial<ClassroomSignupDraft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const goToStep = (nextStep: WizardStep, nextDirection: number) => {
    setDirection(nextDirection);
    setStep(nextStep);
    setError(null);
    window.scrollTo?.({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const applyTemplate = (templateId: ClassroomSignupTemplateId) => {
    setDraft(applyTemplateToDraft(draft, templateId));
    setTemplatesOpen(false);
    setPendingTemplate(null);
    adminToast.success("Template applied.", {
      id: "signup-template-applied",
      description: "Check the details, then review and publish.",
    });
  };

  const handleTemplateSelect = (templateId: ClassroomSignupTemplateId) => {
    if (hasDraftContent(draft)) {
      setPendingTemplate(templateId);
      return;
    }
    applyTemplate(templateId);
  };

  const requestLeave = () => {
    if (busy) return;
    if (hasDraftContent(draft)) setLeaveOpen(true);
    else onCancel();
  };

  const submit = async function submit(mode: "draft" | "publish" | "publish-remind") {
    if (busy || !draft.title.trim()) return;
    setBusy(mode);
    setError(null);
    const errorId = "signup-create-error";
    try {
      const signup = await createTeacherSignup(organizationId, draft, mode === "draft" ? "draft" : "open");
      adminToast.dismiss(errorId);
      if (mode === "draft") onDraftSaved(signup);
      else onPublished(signup, { remindNow: mode === "publish-remind" });
    } catch (err) {
      void reportPortalOperationalError(
        "teacher_portal",
        { organizationId, operation: mode === "draft" ? "classroom_signups.save_draft" : "classroom_signups.publish", error: "" },
        err,
      );
      const message = formatActionError(err, mode === "draft" ? "Failed to save draft." : "Failed to publish signup.");
      setError(message);
      adminToast.error(mode === "draft" ? "Draft not saved." : "Signup not published.", {
        id: errorId,
        description: `${message} Your work is still here.`,
        action: { label: "Retry", onClick: () => void submit(mode) },
      });
    } finally {
      setBusy(null);
    }
  };

  const previewSignup = {
    ...draft,
    id: "preview",
    organizationId: "org-demo",
    createdByStaffMemberId: "staff-demo",
    teacherName: "",
    status: "open",
    publishedAt: null,
    closedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as ClassroomSignup;
  const deadline = formatSignupDeadline(draft.responseDeadline);
  const slotCount = draft.config.slots?.length ?? 0;
  const roleCount = draft.config.roles?.length ?? 0;

  const stepVariants = wizardStepVariants(reducedMotion ?? false);
  const stepTransition = wizardStepTransition(reducedMotion ?? false);

  const saveDraftButton = (
    <button type="button" className={gBtnOutlineSm} onClick={() => void submit("draft")} disabled={busy !== null || !draft.title.trim()} title={!draft.title.trim() ? "Add a title to save a draft" : undefined} data-testid="teacher-signup-save-draft">
      <BusyLabel busy={busy === "draft"} busyLabel="Saving…" icon={<Save className="h-4 w-4" aria-hidden />}>
        Save as draft
      </BusyLabel>
    </button>
  );

  return (
    <div className="flex flex-col gap-5" data-testid="teacher-signup-create-wizard">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" className={gLinkSm} onClick={step === 1 ? requestLeave : () => goToStep(1, -1)}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {step === 1 ? "Back to signups" : "Back to set up"}
          </button>
          {step === 1 ? (
            <button type="button" className={gBtnOutlineSm} onClick={() => setTemplatesOpen(true)}>
              <Sparkles className="h-4 w-4" aria-hidden />
              Start from a template
            </button>
          ) : null}
        </div>
        <div>
          <h1 className="sf-display m-0 text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.02] text-[var(--sf-ink)]">
            {step === 1 ? "What do you need help with?" : "Review & publish"}
          </h1>
          <p className="m-0 mt-2 text-[14px] font-semibold text-[var(--sf-soft)]">
            {step === 1
              ? "Give it a title, choose how families sign up and who can see it."
              : "This is what families will see. Publish now, or publish and send a reminder right away."}
          </p>
        </div>
        <StepTrail step={step} />
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {step === 1 ? (
          <motion.div key="configure" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={stepTransition} className="flex flex-col gap-5">
            <ClassroomSignupConfigureForm theme={theme} draft={draft} onDraftChange={updateDraft} classroomOptions={classroomOptions} />

            {error ? (
              <GardenNotice tone="alert" role="alert" title="Not saved yet">
                {error}
              </GardenNotice>
            ) : null}

            <div className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-2 rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white/95 px-4 py-3 shadow-[0_-6px_20px_-14px_rgba(43,36,29,0.45)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[13px] font-semibold text-[var(--sf-soft)]" aria-live="polite">
                {canReview ? "Looks good — review it before families see it." : `Add ${missing.join(" and ")} to continue.`}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {saveDraftButton}
                <button type="button" className={gBtnPopSm} onClick={() => goToStep(2, 1)} disabled={!canReview || busy !== null} data-testid="teacher-signup-review">
                  Review & publish
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="review" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={stepTransition} className="flex flex-col gap-5">
            <GCard kicker="Families will see" title={draft.title} index={0}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <GChip tone="info">{SIGNUP_TYPE_LABELS[draft.signupType]}</GChip>
                  {slotCount > 0 && draft.signupType === "time_slots" ? <GChip tone="neutral">{slotCount} time slot{slotCount === 1 ? "" : "s"}</GChip> : null}
                  {roleCount > 0 && draft.signupType === "roles" ? <GChip tone="neutral">{roleCount} role{roleCount === 1 ? "" : "s"}</GChip> : null}
                </div>
                {draft.description ? <p className="m-0 text-[14px] font-semibold leading-relaxed text-[var(--sf-ink)]/80">{draft.description}</p> : null}
                <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
                  <li className="flex items-start gap-2.5 rounded-[14px] bg-[var(--sf-paper)] px-3.5 py-2.5">
                    <UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
                    <span className="text-[13.5px] font-semibold text-[var(--sf-ink)]/85">
                      Visible to {formatAudienceLabel(previewSignup)}
                      {draft.familyCount > 0 ? <span className="block text-[12.5px] text-[var(--sf-soft)]">About {draft.familyCount} {draft.familyCount === 1 ? "family" : "families"}</span> : null}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 rounded-[14px] bg-[var(--sf-paper)] px-3.5 py-2.5">
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
                    <span className="text-[13.5px] font-semibold text-[var(--sf-ink)]/85">{deadline ? `Sign up by ${deadline}` : "No deadline"}</span>
                  </li>
                </ul>
              </div>
            </GCard>

            {error ? (
              <GardenNotice tone="alert" role="alert" title="Not published yet">
                {error}
              </GardenNotice>
            ) : null}

            <div className="flex flex-col gap-3 rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              {saveDraftButton}
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={gBtnOutlineSm} onClick={() => void submit("publish")} disabled={busy !== null} data-testid="teacher-signup-publish">
                  <BusyLabel busy={busy === "publish"} busyLabel="Publishing…" icon={<Send className="h-4 w-4" aria-hidden />}>
                    Publish
                  </BusyLabel>
                </button>
                <button type="button" className={gBtnPopSm} onClick={() => void submit("publish-remind")} disabled={busy !== null} data-testid="teacher-signup-publish-notify">
                  <BusyLabel busy={busy === "publish-remind"} busyLabel="Publishing…" icon={<BellRing className="h-4 w-4" aria-hidden />}>
                    Publish & send reminder
                  </BusyLabel>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SignupTemplateSidebar theme={theme} open={templatesOpen} onClose={() => setTemplatesOpen(false)} onSelect={handleTemplateSelect} />

      <GConfirmDialog
        theme={theme}
        open={pendingTemplate !== null}
        title="Replace what you've written?"
        description="The template replaces your title, description and signup settings. Your audience stays the same."
        confirmLabel="Use template"
        cancelLabel="Keep mine"
        onConfirm={() => (pendingTemplate ? applyTemplate(pendingTemplate) : undefined)}
        onClose={() => setPendingTemplate(null)}
      />

      <GConfirmDialog
        theme={theme}
        open={leaveOpen}
        title="Leave without saving?"
        description="This signup hasn't been saved. Save it as a draft to finish later."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => {
          setLeaveOpen(false);
          onCancel();
        }}
        onClose={() => setLeaveOpen(false)}
      />
    </div>
  );
}
