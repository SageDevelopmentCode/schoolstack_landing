"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ClassroomSignupConfigureForm from "./ClassroomSignupConfigureForm";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import SignupTemplateSidebar from "./SignupTemplateSidebar";
import ClassroomSignupNotifyModal from "./ClassroomSignupNotifyModal";
import { SignupTypeChip } from "@/components/classroom-signups/shared/SignupTypeChip";
import {
  applyTemplateToDraft,
  buildSignupFromTemplate,
} from "@/lib/classroom-signups/templates";
import type {
  ClassroomSignup,
  ClassroomSignupDraft,
  ClassroomSignupTemplateId,
  TeacherClassroomOption,
} from "@/lib/classroom-signups/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  classroomNamesForSelection,
  estimateFamilyCountForClassrooms,
  formatAudienceLabel,
} from "@/lib/classroom-signups/utils";

type WizardStep = 1 | 2;

function wizardStepVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      enter: { opacity: 0 },
      center: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }

  return {
    enter: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 20 : -20,
    }),
    center: { opacity: 1, x: 0 },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -20 : 20,
    }),
  };
}

function wizardStepTransition(reducedMotion: boolean): Transition {
  return reducedMotion
    ? { duration: 0.15 }
    : { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] };
}

type ClassroomSignupCreateWizardProps = {
  organizationId: string;
  teacherName: string;
  classroomOptions: TeacherClassroomOption[];
  assignedFamilyCount: number;
  onCancel: () => void;
  onPublished: (signup: ClassroomSignup) => void;
};

function StepIndicator({ step }: { step: WizardStep }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2.5">
      {([1, 2] as WizardStep[]).map((n) => (
        <div
          key={n}
          className="h-2 rounded-full transition-all"
          style={{
            width: n === step ? 24 : 8,
            backgroundColor: n <= step ? "#3D6B4F" : "#DCE4DC",
          }}
        />
      ))}
    </div>
  );
}

function WizardHeader({
  theme,
  step,
  title,
  subtitle,
  backLabel,
  onBack,
  templatesAction,
}: {
  theme: ParentThemeTokens;
  step: WizardStep;
  title: string;
  subtitle?: string;
  backLabel: string;
  onBack: () => void;
  templatesAction?: { label: string; onClick: () => void };
}) {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: theme.primary }}
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>
        {templatesAction ? (
          <button
            type="button"
            onClick={templatesAction.onClick}
            className="text-sm font-medium"
            style={{ color: theme.primary }}
          >
            {templatesAction.label}
          </button>
        ) : null}
      </div>
      <ParentSectionKicker theme={theme}>Create signup</ParentSectionKicker>
      <ParentDisplayHeading theme={theme} className="mb-2">
        {title}
      </ParentDisplayHeading>
      {subtitle ? (
        <p className="mb-4 text-sm" style={{ color: "#76828A" }}>
          {subtitle}
        </p>
      ) : null}
      <StepIndicator step={step} />
    </>
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

export default function ClassroomSignupCreateWizard({
  organizationId,
  teacherName,
  classroomOptions,
  assignedFamilyCount,
  onCancel,
  onPublished,
}: ClassroomSignupCreateWizardProps) {
  const { theme } = useParentTheme();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState<WizardStep>(1);
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<ClassroomSignupDraft>(() =>
    createInitialDraft(classroomOptions),
  );
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [publishedSignup, setPublishedSignup] = useState<ClassroomSignup | null>(
    null,
  );
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const finishedPublishRef = useRef(false);

  const familyCount = draft.familyCount;

  const finishPublished = (signup: ClassroomSignup) => {
    if (finishedPublishRef.current) return;
    finishedPublishRef.current = true;
    setNotifyOpen(false);
    onPublished(signup);
  };

  const handleTemplateSelect = (templateId: ClassroomSignupTemplateId) => {
    if (
      hasDraftContent(draft) &&
      !window.confirm(
        "Applying a template will replace your current title, description, and signup settings. Continue?",
      )
    ) {
      return;
    }

    setDraft(applyTemplateToDraft(draft, templateId));
    setTemplatesOpen(false);
  };

  const updateDraft = (patch: Partial<ClassroomSignupDraft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const goToStep = (nextStep: WizardStep, nextDirection: number) => {
    setDirection(nextDirection);
    setStep(nextStep);
  };

  const publishSignup = async (openNotify: boolean) => {
    if (!draft || !draft.title.trim() || publishing) return null;

    setPublishing(true);
    setPublishError(null);

    try {
      const response = await fetch("/api/teacher-portal/classroom-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          title: draft.title,
          description: draft.description,
          signupType: draft.signupType,
          audience: draft.audience,
          classroomId: draft.classroomId,
          classroomIds: draft.classroomIds,
          classroomName: draft.classroomName,
          responseDeadline: draft.responseDeadline,
          config: draft.config,
          status: "open",
        }),
      });

      const payload = (await response.json()) as {
        signup?: ClassroomSignup;
        error?: string;
      };

      if (!response.ok || !payload.signup) {
        throw new Error(payload.error ?? "Failed to publish signup.");
      }

      setPublishedSignup(payload.signup);
      if (openNotify) {
        setNotifyOpen(true);
      } else {
        finishPublished(payload.signup);
      }
      return payload.signup;
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : "Failed to publish signup.",
      );
      return null;
    } finally {
      setPublishing(false);
    }
  };

  const previewSignup: ClassroomSignup = {
    ...draft,
    id: "preview",
    organizationId: "org-demo",
    createdByStaffMemberId: "staff-demo",
    teacherName,
    familyCount,
    status: "open",
    publishedAt: null,
    closedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const stepVariants = wizardStepVariants(reducedMotion ?? false);
  const stepTransition = wizardStepTransition(reducedMotion ?? false);

  return (
    <div>
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {step === 1 ? (
          <motion.div
            key="configure"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
          >
            <WizardHeader
              theme={theme}
              step={1}
              title="Configure your signup"
              backLabel="Back to signups"
              onBack={onCancel}
              templatesAction={{
                label: "Templates",
                onClick: () => setTemplatesOpen(true),
              }}
            />

            <div className="mx-auto max-w-3xl">
        <ClassroomSignupConfigureForm
          theme={theme}
          draft={draft}
          onDraftChange={updateDraft}
          classroomOptions={classroomOptions}
        />

        <div className="mt-8 flex flex-wrap justify-between gap-2 pt-2">
          <AdminButton
            theme={theme}
            variant="outline"
            onClick={() => {
              updateDraft({ status: "draft" });
              onCancel();
            }}
          >
            Save as draft
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="primary"
            onClick={() => goToStep(2, 1)}
            disabled={!draft.title.trim() || draft.classroomIds.length === 0}
          >
            Review & publish
          </AdminButton>
        </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="review"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
          >
            <WizardHeader
              theme={theme}
              step={2}
              title="Review & publish"
              backLabel="Back to configure"
              onBack={() => goToStep(1, -1)}
            />

            <div className="mx-auto max-w-3xl">
      <ParentCard theme={theme}>
        <div className="flex flex-wrap items-center gap-2">
          <SignupTypeChip theme={theme} type={draft.signupType} />
        </div>
        <h3
          className="mt-3 font-serif text-xl font-semibold"
          style={{ color: theme.ink }}
        >
          {draft.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "#76828A" }}>
          {draft.description}
        </p>
        <p className="mt-4 text-sm font-medium" style={{ color: theme.ink }}>
          Visible to {formatAudienceLabel(previewSignup)}
        </p>
      </ParentCard>

      {publishError ? (
        <p className="mt-4 text-sm text-red-600">{publishError}</p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-end gap-2 pt-2">
        <AdminButton
          theme={theme}
          variant="outline"
          disabled={publishing}
          onClick={() => void publishSignup(false)}
        >
          {publishing ? "Publishing…" : "Publish"}
        </AdminButton>
        <AdminButton
          theme={theme}
          variant="primary"
          disabled={publishing}
          onClick={() => void publishSignup(true)}
        >
          {publishing ? "Publishing…" : "Publish & notify"}
        </AdminButton>
      </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SignupTemplateSidebar
        theme={theme}
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelect={handleTemplateSelect}
      />

      {publishedSignup ? (
        <ClassroomSignupNotifyModal
          signup={publishedSignup}
          responses={[]}
          teacherName={teacherName}
          open={notifyOpen}
          onClose={() => finishPublished(publishedSignup)}
          onSent={() => finishPublished(publishedSignup)}
        />
      ) : null}
    </div>
  );
}
