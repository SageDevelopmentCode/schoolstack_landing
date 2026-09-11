"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import SignupTemplateSidebar from "./SignupTemplateSidebar";
import ClassroomSignupNotifyModal from "./ClassroomSignupNotifyModal";
import { SignupTypeChip } from "@/components/classroom-signups/shared/SignupTypeChip";
import SignupTimePicker from "@/components/classroom-signups/shared/SignupTimePicker";
import SignupDatePicker from "@/components/classroom-signups/shared/SignupDatePicker";
import { newAdmissionsId } from "@/lib/admissions/application-form-schema";
import {
  applyTemplateToDraft,
  buildSignupFromTemplate,
  emptySignupConfig,
} from "@/lib/classroom-signups/templates";
import type {
  ClassroomSignup,
  ClassroomSignupDraft,
  ClassroomSignupTemplateId,
  ClassroomSignupTimeSlot,
  ClassroomSignupType,
  TeacherClassroomOption,
} from "@/lib/classroom-signups/types";
import {
  CLASSROOM_STAFF_ROLE_LABELS,
  SIGNUP_TYPE_LABELS,
} from "@/lib/classroom-signups/types";
import {
  nextSignupEndTimeFromStart,
  parseTimeToMinutes,
} from "@/lib/school-events/calendar-time";
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

function newSlot() {
  return {
    id: `slot-${newAdmissionsId()}`,
    label: "",
    date: "",
    startTime: "09:00",
    endTime: "09:30",
    capacity: 1,
  };
}

function newRole() {
  return {
    id: `role-${newAdmissionsId()}`,
    name: "",
    description: "",
    quantityNeeded: 1,
  };
}

function shouldBumpEndTime(startTime: string, endTime: string): boolean {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null) return true;
  return end <= start;
}

function slotWithStartTime(
  slot: ClassroomSignupTimeSlot,
  startTime: string,
): ClassroomSignupTimeSlot {
  const next: ClassroomSignupTimeSlot = { ...slot, startTime };
  if (shouldBumpEndTime(startTime, slot.endTime)) {
    next.endTime = nextSignupEndTimeFromStart(startTime);
  }
  return next;
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

function SlotFieldLabel({ children }: { children: string }) {
  return (
    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#76828A]">
      {children}
    </span>
  );
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

  const handleTypeChange = (signupType: ClassroomSignupType) => {
    updateDraft({
      signupType,
      config: emptySignupConfig(signupType),
    });
  };

  const goToStep = (nextStep: WizardStep, nextDirection: number) => {
    setDirection(nextDirection);
    setStep(nextStep);
  };

  const toggleClassroomSelection = (classroomId: string) => {
    const isSelected = draft.classroomIds.includes(classroomId);
    const classroomIds = isSelected
      ? draft.classroomIds.filter((id) => id !== classroomId)
      : [...draft.classroomIds, classroomId];

    updateDraft({
      audience: "classrooms",
      classroomIds,
      classroomId: null,
      classroomName: classroomNamesForSelection(classroomOptions, classroomIds) || null,
      familyCount: estimateFamilyCountForClassrooms(classroomOptions, classroomIds),
    });
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
        <div className="space-y-5">
          <ParentCard theme={theme}>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#76828A]">
              Title
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              placeholder="e.g. Reading buddies — October"
              className="w-full rounded-[10px] border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "#DCE4DC" }}
            />

            <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-[#76828A]">
              Description
            </label>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
              placeholder="Tell parents what you need and when."
              className="w-full rounded-[10px] border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "#DCE4DC" }}
            />

            <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-[#76828A]">
              Response deadline (optional)
            </label>
            <SignupDatePicker
              theme={theme}
              value={
                draft.responseDeadline ? draft.responseDeadline.slice(0, 10) : ""
              }
              onChange={(date) =>
                updateDraft({
                  responseDeadline: date ? `${date}T23:59:59.000Z` : null,
                })
              }
              ariaLabel="Response deadline"
              placeholder="No deadline"
              className="max-w-xs"
            />
          </ParentCard>

          <ParentCard theme={theme}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#76828A]">
              Signup type
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SIGNUP_TYPE_LABELS) as ClassroomSignupType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className="rounded-[9px] border px-3 py-2 text-xs font-medium transition-colors"
                    style={
                      draft.signupType === type
                        ? {
                            backgroundColor: "#E9F2EA",
                            borderColor: "#BCD4C1",
                            color: theme.primary,
                            fontWeight: 700,
                          }
                        : {
                            backgroundColor: theme.white,
                            borderColor: "#DCE4DC",
                            color: "#5D6D73",
                          }
                    }
                  >
                    {SIGNUP_TYPE_LABELS[type]}
                  </button>
                ),
              )}
            </div>
          </ParentCard>

          <ParentCard theme={theme}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#76828A]">
              Who should receive this?
            </p>
            <p className="mb-3 text-sm" style={{ color: "#76828A" }}>
              Select the classrooms whose families should receive this signup.
            </p>
            {classroomOptions.length === 0 ? (
              <p className="text-sm" style={{ color: "#76828A" }}>
                You are not assigned to any classrooms yet. Contact your school
                admin.
              </p>
            ) : (
              <div className="space-y-2">
                {classroomOptions.map((classroom) => {
                  const isSelected = draft.classroomIds.includes(classroom.id);

                  return (
                    <label
                      key={classroom.id}
                      className="flex cursor-pointer items-start gap-3 rounded-[12px] border p-3"
                      style={{
                        borderColor: isSelected ? theme.primary : "#DCE4DC",
                        backgroundColor: isSelected ? "#E9F2EA" : theme.white,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleClassroomSelection(classroom.id)}
                        className="mt-1 h-4 w-4 shrink-0 accent-[#3D6B4F]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: theme.ink }}
                          >
                            {classroom.name}
                          </p>
                          {classroom.role ? (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                              style={{
                                backgroundColor: "#E9F2EA",
                                color: theme.primary,
                              }}
                            >
                              {CLASSROOM_STAFF_ROLE_LABELS[classroom.role]}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs" style={{ color: "#76828A" }}>
                          {classroom.familyCount}{" "}
                          {classroom.familyCount === 1 ? "family" : "families"}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {draft.classroomIds.length > 0 ? (
              <p className="mt-3 text-sm font-medium" style={{ color: theme.ink }}>
                {familyCount} {familyCount === 1 ? "family" : "families"} will see
                this signup
              </p>
            ) : null}
          </ParentCard>

          {draft.signupType === "time_slots" ? (
            <ParentCard theme={theme}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#76828A]">
                  Time slots
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateDraft({
                      config: {
                        ...draft.config,
                        slots: [...(draft.config.slots ?? []), newSlot()],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: theme.primary }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add slot
                </button>
              </div>
              <div className="space-y-3">
                {(draft.config.slots ?? []).map((slot, index) => (
                  <div
                    key={slot.id}
                    className="grid gap-3 overflow-visible rounded-[12px] border p-3 sm:grid-cols-2"
                    style={{ borderColor: "#E7EBE2" }}
                  >
                    <div>
                      <SlotFieldLabel>Label</SlotFieldLabel>
                      <input
                        type="text"
                        placeholder="e.g. Friday morning"
                        value={slot.label}
                        onChange={(e) => {
                          const slots = [...(draft.config.slots ?? [])];
                          slots[index] = { ...slot, label: e.target.value };
                          updateDraft({ config: { ...draft.config, slots } });
                        }}
                        className="w-full rounded-[8px] border px-2 py-1.5 text-sm"
                        style={{ borderColor: "#DCE4DC" }}
                      />
                    </div>
                    <div>
                      <SlotFieldLabel>Date</SlotFieldLabel>
                      <SignupDatePicker
                        theme={theme}
                        value={slot.date}
                        onChange={(date) => {
                          const slots = [...(draft.config.slots ?? [])];
                          slots[index] = { ...slot, date };
                          updateDraft({ config: { ...draft.config, slots } });
                        }}
                        ariaLabel={`Date for slot ${index + 1}`}
                      />
                    </div>
                    <div>
                      <SlotFieldLabel>Start</SlotFieldLabel>
                      <SignupTimePicker
                        theme={theme}
                        value={slot.startTime}
                        onChange={(startTime) => {
                          const slots = [...(draft.config.slots ?? [])];
                          slots[index] = slotWithStartTime(slot, startTime);
                          updateDraft({ config: { ...draft.config, slots } });
                        }}
                        ariaLabel={`Start time for slot ${index + 1}`}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <SlotFieldLabel>End</SlotFieldLabel>
                        <SignupTimePicker
                          theme={theme}
                          value={slot.endTime}
                          scrollToTime={nextSignupEndTimeFromStart(slot.startTime)}
                          onChange={(endTime) => {
                            const slots = [...(draft.config.slots ?? [])];
                            slots[index] = { ...slot, endTime };
                            updateDraft({ config: { ...draft.config, slots } });
                          }}
                          ariaLabel={`End time for slot ${index + 1}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const slots = (draft.config.slots ?? []).filter(
                            (_, i) => i !== index,
                          );
                          updateDraft({ config: { ...draft.config, slots } });
                        }}
                        className="mb-0.5 rounded p-1.5 hover:bg-red-50"
                        aria-label="Remove slot"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ParentCard>
          ) : null}

          {draft.signupType === "roles" ? (
            <ParentCard theme={theme}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#76828A]">
                  Roles & tasks
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateDraft({
                      config: {
                        ...draft.config,
                        roles: [...(draft.config.roles ?? []), newRole()],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: theme.primary }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add role
                </button>
              </div>
              <div className="space-y-3">
                {(draft.config.roles ?? []).map((role, index) => (
                  <div
                    key={role.id}
                    className="rounded-[12px] border p-3"
                    style={{ borderColor: "#E7EBE2" }}
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Role name"
                        value={role.name}
                        onChange={(e) => {
                          const roles = [...(draft.config.roles ?? [])];
                          roles[index] = { ...role, name: e.target.value };
                          updateDraft({ config: { ...draft.config, roles } });
                        }}
                        className="flex-1 rounded-[8px] border px-2 py-1.5 text-sm"
                        style={{ borderColor: "#DCE4DC" }}
                      />
                      <input
                        type="number"
                        min={1}
                        value={role.quantityNeeded}
                        onChange={(e) => {
                          const roles = [...(draft.config.roles ?? [])];
                          roles[index] = {
                            ...role,
                            quantityNeeded: Number(e.target.value) || 1,
                          };
                          updateDraft({ config: { ...draft.config, roles } });
                        }}
                        className="w-16 rounded-[8px] border px-2 py-1.5 text-sm"
                        style={{ borderColor: "#DCE4DC" }}
                        title="Quantity needed"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const roles = (draft.config.roles ?? []).filter(
                            (_, i) => i !== index,
                          );
                          updateDraft({ config: { ...draft.config, roles } });
                        }}
                        className="rounded p-1.5 hover:bg-red-50"
                        aria-label="Remove role"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={role.description}
                      onChange={(e) => {
                        const roles = [...(draft.config.roles ?? [])];
                        roles[index] = { ...role, description: e.target.value };
                        updateDraft({ config: { ...draft.config, roles } });
                      }}
                      className="mt-2 w-full rounded-[8px] border px-2 py-1.5 text-sm"
                      style={{ borderColor: "#DCE4DC" }}
                    />
                  </div>
                ))}
              </div>
            </ParentCard>
          ) : null}

          {draft.signupType === "open" ? (
            <ParentCard theme={theme}>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#76828A]">
                Prompt for parents
              </label>
              <input
                type="text"
                value={draft.config.parentPrompt ?? ""}
                onChange={(e) =>
                  updateDraft({
                    config: { ...draft.config, parentPrompt: e.target.value },
                  })
                }
                className="w-full rounded-[10px] border px-3 py-2 text-sm outline-none"
                style={{ borderColor: "#DCE4DC" }}
              />
            </ParentCard>
          ) : null}
        </div>

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
