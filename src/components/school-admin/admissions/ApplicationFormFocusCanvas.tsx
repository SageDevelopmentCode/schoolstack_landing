"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import ApplicationStepNotice from "@/components/admissions/ApplicationStepNotice";
import {
  APPLY_FORM_PUBLIC_SLUG,
  type ProgramOption,
} from "@/lib/admissions/application-forms";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type {
  ApplicationField,
  ApplicationFormFeeConfig,
  ApplicationFormPostSubmitConfig,
  ApplicationFormSchema,
  ApplicationSection,
} from "@/lib/admissions/application-form-schema";
import {
  APPLY_SYSTEM_ADMIN_CALLOUT,
  isSystemFieldId,
  isSystemSection,
} from "@/lib/admissions/apply-system-fields";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ApplicationFormAcknowledgmentsEditor from "./ApplicationFormAcknowledgmentsEditor";
import ApplicationFormFieldEditor from "./ApplicationFormFieldEditor";
import ApplicationFormFeePanel from "./ApplicationFormFeePanel";
import ApplicationFormPostSubmitEditor from "./ApplicationFormPostSubmitEditor";
import ApplicationFormQuestionList from "./ApplicationFormQuestionList";
import {
  BuilderQuestionCard,
  BuilderSectionIntro,
} from "./builder-question-card";
import { focusKey, type BuilderFocus } from "./builder-focus";

export type EditableFormSlice = {
  title: string;
  intro: string;
  programId: string | null;
  publicSlug: string;
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
  postSubmitConfig: ApplicationFormPostSubmitConfig;
};

type ApplicationFormFocusCanvasProps = {
  C: AdminThemeTokens;
  focus: BuilderFocus;
  editable: EditableFormSlice;
  programs: ProgramOption[];
  orgSlug: string;
  organizationId: string;
  readOnly: boolean;
  lockSystemFields?: boolean;
  lockApplySlug?: boolean;
  setupHighlight?: "publicSlug" | null;
  slugError?: string | null;
  stripePaymentsReady?: boolean;
  onFocusChange: (focus: BuilderFocus) => void;
  onEditableChange: (patch: Partial<EditableFormSlice>) => void;
  onUpdateSchema: (
    updater: (schema: ApplicationFormSchema) => ApplicationFormSchema,
  ) => void;
  onDeleteStep: (stepId: string) => void;
};

type PendingDelete =
  | { kind: "step"; stepId: string; stepTitle: string; questionCount: number }
  | { kind: "field"; stepId: string; fieldId: string; fieldLabel: string };

const canvasTransition = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: 0.18, ease: "easeOut" as const },
};

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

function BuilderAddButton({
  C,
  onClick,
  label = "Add",
}: {
  C: AdminThemeTokens;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-medium"
      style={{
        backgroundColor: C.accentLight,
        color: C.accent,
        border: `1px solid ${C.secondaryBtnBorder}`,
      }}
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function SetupView({
  C,
  editable,
  programs,
  orgSlug,
  readOnly,
  lockApplySlug = false,
  setupHighlight,
  slugError,
  onEditableChange,
}: {
  C: AdminThemeTokens;
  editable: EditableFormSlice;
  programs: ProgramOption[];
  orgSlug: string;
  readOnly: boolean;
  lockApplySlug?: boolean;
  setupHighlight?: "publicSlug" | null;
  slugError?: string | null;
  onEditableChange: (patch: Partial<EditableFormSlice>) => void;
}) {
  const slugInputRef = useRef<HTMLInputElement>(null);
  const slugHighlighted = !lockApplySlug && setupHighlight === "publicSlug";

  useEffect(() => {
    if (!slugHighlighted) return;
    const input = slugInputRef.current;
    if (!input) return;
    input.focus();
    input.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [slugHighlighted]);

  return (
    <div className="w-full max-w-3xl space-y-5">
      <BuilderSectionIntro
        C={C}
        title="Form setup"
        subtitle="Answer a few questions to set up what families see when they start applying."
      />

      <BuilderQuestionCard
        C={C}
        tone="accent"
        question="What should families call this application?"
        helper="This appears as the main heading on your public apply page."
      >
        <input
          type="text"
          value={editable.title}
          disabled={readOnly}
          onChange={(e) => onEditableChange({ title: e.target.value })}
          placeholder="e.g. Application for Fall 2026"
          style={inputStyle(C)}
        />
      </BuilderQuestionCard>

      <BuilderQuestionCard
        C={C}
        tone="clay"
        question="What should families read when they first open the form?"
        helper="A short welcome message — explain what to expect or how long it takes."
      >
        <textarea
          rows={4}
          value={editable.intro}
          disabled={readOnly}
          onChange={(e) => onEditableChange({ intro: e.target.value })}
          placeholder="Welcome families and explain what to expect…"
          style={{ ...inputStyle(C), resize: "vertical" }}
        />
      </BuilderQuestionCard>

      <BuilderQuestionCard
        C={C}
        tone="info"
        question={
          lockApplySlug
            ? "Where will families apply?"
            : "What link will families use to apply?"
        }
        helper={
          lockApplySlug
            ? "Your main application form always uses `/apply`. This link is fixed so families always know where to start."
            : "Use lowercase letters, numbers, and hyphens only."
        }
        highlightError={slugHighlighted}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="shrink-0 text-xs"
              style={{ color: C.textTertiary }}
            >
              /school/{orgSlug}/forms/
            </span>
            {lockApplySlug ? (
              <span
                className="flex-1 rounded-md px-3 py-2.5 text-sm"
                style={{
                  backgroundColor: C.elevated,
                  border: `1px solid ${C.inputBorder}`,
                  color: C.textSecondary,
                }}
              >
                {APPLY_FORM_PUBLIC_SLUG}
              </span>
            ) : (
              <input
                ref={slugInputRef}
                type="text"
                value={editable.publicSlug}
                disabled={readOnly}
                onChange={(e) => onEditableChange({ publicSlug: e.target.value })}
                placeholder="e.g. apply"
                style={{
                  ...inputStyle(C),
                  flex: 1,
                  border: `1px solid ${slugHighlighted ? C.errorBorder : C.inputBorder}`,
                }}
              />
            )}
          </div>
          {slugHighlighted && slugError ? (
            <p className="text-xs font-medium" style={{ color: C.error }}>
              {slugError}
            </p>
          ) : null}
        </div>
      </BuilderQuestionCard>

      <BuilderQuestionCard
        C={C}
        tone="success"
        question="Which admissions program is this application for?"
        helper="Each submission is tied to one program. Required before you can publish."
      >
        <div className="space-y-2">
          <select
            value={editable.programId ?? ""}
            disabled={readOnly}
            onChange={(e) =>
              onEditableChange({ programId: e.target.value || null })
            }
            style={inputStyle(C)}
          >
            <option value="">Select a program (required)</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
          {!editable.programId ? (
            <p className="text-xs font-medium" style={{ color: C.error }}>
              {programs.length === 0 ? (
                <>
                  <Link
                    href={schoolAdminPath(orgSlug, "admissions", "programs")}
                    className="underline underline-offset-2"
                    style={{ color: C.accent }}
                  >
                    Create a program first
                  </Link>{" "}
                  before publishing the form.
                </>
              ) : (
                "Select a program so families can start an application."
              )}
            </p>
          ) : null}
        </div>
      </BuilderQuestionCard>
    </div>
  );
}

function StepView({
  C,
  step,
  stepIdx,
  readOnly,
  lockSystemFields,
  selectedFieldId,
  onFocusChange,
  onUpdateStep,
  onRequestDeleteStep,
  onAddField,
  onReorderFields,
}: {
  C: AdminThemeTokens;
  step: ApplicationSection;
  stepIdx: number;
  readOnly: boolean;
  lockSystemFields: boolean;
  selectedFieldId: string | null;
  onFocusChange: (focus: BuilderFocus) => void;
  onUpdateStep: (patch: Partial<ApplicationSection>) => void;
  onRequestDeleteStep: () => void;
  onAddField: (field: ApplicationField) => void;
  onReorderFields: (fields: ApplicationField[]) => void;
}) {
  const isLockedStep = lockSystemFields && isSystemSection(step);
  const hasDescription = Boolean(step.description?.trim());
  const hasStepNotice = Boolean(step.stepNotice?.body?.trim());
  const [descriptionEditorOpen, setDescriptionEditorOpen] = useState(false);
  const [stepNoticeEditorOpen, setStepNoticeEditorOpen] = useState(false);

  const showDescriptionEditor = hasDescription || descriptionEditorOpen;
  const showStepNoticeEditor = hasStepNotice || stepNoticeEditorOpen;

  useEffect(() => {
    queueMicrotask(() => {
      setDescriptionEditorOpen(false);
      setStepNoticeEditorOpen(false);
    });
  }, [step.id]);

  return (
    <div className="w-full max-w-3xl space-y-5">
      <div className="flex items-start justify-between gap-4">
        <BuilderSectionIntro
          C={C}
          eyebrow={`Step ${stepIdx + 1}`}
          title={step.title || `Step ${stepIdx + 1}`}
          subtitle={
            isLockedStep
              ? "Required student fields for your school directory."
              : undefined
          }
        />
        {!readOnly && !isLockedStep ? (
          <button
            type="button"
            onClick={onRequestDeleteStep}
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium"
            style={{ color: C.error, backgroundColor: C.errorBg }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete step
          </button>
        ) : null}
      </div>

      {isLockedStep ? (
        <div
          className="rounded-md border px-4 py-3 text-sm leading-relaxed"
          style={{
            borderColor: C.infoBorder,
            backgroundColor: C.infoBg,
            color: C.textSecondary,
          }}
        >
          {APPLY_SYSTEM_ADMIN_CALLOUT}
        </div>
      ) : null}

      {!isLockedStep ? (
        <>
          <BuilderQuestionCard
            C={C}
            tone="accent"
            question="What should families call this step?"
            helper="This is the heading families see at the top of this screen."
          >
            <input
              type="text"
              value={step.title}
              disabled={readOnly}
              onChange={(e) => onUpdateStep({ title: e.target.value })}
              placeholder="e.g. Parent information"
              style={inputStyle(C)}
            />
          </BuilderQuestionCard>

          {readOnly && !hasDescription ? null : (
            <BuilderQuestionCard
              C={C}
              tone="clay"
              question="What instructions should appear at the top of this step?"
              helper={
                showDescriptionEditor
                  ? "Optional — add context before families start answering questions."
                  : undefined
              }
              action={
                !readOnly && !showDescriptionEditor ? (
                  <BuilderAddButton
                    C={C}
                    onClick={() => setDescriptionEditorOpen(true)}
                  />
                ) : undefined
              }
            >
              {showDescriptionEditor ? (
                <textarea
                  rows={2}
                  value={step.description ?? ""}
                  disabled={readOnly}
                  onChange={(e) => {
                    const description = e.target.value;
                    if (!description.trim()) {
                      onUpdateStep({ description: undefined });
                      setDescriptionEditorOpen(false);
                      return;
                    }
                    onUpdateStep({ description });
                  }}
                  placeholder="Optional instructions for this step…"
                  style={{ ...inputStyle(C), resize: "vertical" }}
                />
              ) : null}
            </BuilderQuestionCard>
          )}

          {readOnly && !hasStepNotice ? null : (
            <BuilderQuestionCard
              C={C}
              tone="info"
              question="Is there a message you want to highlight on this step?"
              helper={
                showStepNoticeEditor
                  ? "Optional callout shown to families on this step."
                  : undefined
              }
              action={
                !readOnly && !showStepNoticeEditor ? (
                  <BuilderAddButton
                    C={C}
                    onClick={() => setStepNoticeEditorOpen(true)}
                  />
                ) : undefined
              }
            >
              {showStepNoticeEditor ? (
                <div className="space-y-3">
                  <textarea
                    rows={2}
                    value={step.stepNotice?.body ?? ""}
                    disabled={readOnly}
                    onChange={(e) => {
                      const body = e.target.value;
                      if (!body.trim()) {
                        onUpdateStep({ stepNotice: undefined });
                        setStepNoticeEditorOpen(false);
                        return;
                      }
                      onUpdateStep({
                        stepNotice: {
                          body,
                          placement: step.stepNotice?.placement ?? "bottom",
                        },
                      });
                    }}
                    placeholder="Optional callout message for families…"
                    style={{ ...inputStyle(C), resize: "vertical" }}
                  />
                  {step.stepNotice?.body.trim() ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium" style={{ color: C.textSecondary }}>
                        Show this message at the…
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {(
                          [
                            { value: "top", label: "Top of step" },
                            { value: "bottom", label: "Bottom of step" },
                          ] as const
                        ).map((option) => (
                          <label
                            key={option.value}
                            className="inline-flex items-center gap-2 text-sm"
                            style={{ color: C.textPrimary }}
                          >
                            <input
                              type="radio"
                              name={`step-notice-placement-${step.id}`}
                              value={option.value}
                              checked={step.stepNotice?.placement === option.value}
                              disabled={readOnly}
                              onChange={() =>
                                onUpdateStep({
                                  stepNotice: {
                                    body: step.stepNotice!.body,
                                    placement: option.value,
                                  },
                                })
                              }
                              className="h-4 w-4"
                              style={{ accentColor: C.accent }}
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                      <ApplicationStepNotice
                        body={step.stepNotice.body.trim()}
                        C={C}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </BuilderQuestionCard>
          )}
        </>
      ) : null}

      <BuilderQuestionCard
        C={C}
        tone="success"
        question="What questions should families answer on this step?"
        helper="Click a question to edit it. Families answer these on this screen."
      >
        <ApplicationFormQuestionList
          C={C}
          stepId={step.id}
          fields={step.fields}
          selectedFieldId={selectedFieldId}
          readOnly={readOnly}
          lockSystemFields={lockSystemFields}
          onSelectField={(fieldId) =>
            onFocusChange({ kind: "field", stepId: step.id, fieldId })
          }
          onAddField={(field) => {
            onAddField(field);
            onFocusChange({ kind: "field", stepId: step.id, fieldId: field.id });
          }}
          onReorderFields={onReorderFields}
          hideHeader
        />
      </BuilderQuestionCard>
    </div>
  );
}

function FieldView({
  C,
  step,
  stepIdx,
  field,
  readOnly,
  lockSystemFields,
  onBack,
  onUpdateField,
  onRequestDeleteField,
}: {
  C: AdminThemeTokens;
  step: ApplicationSection;
  stepIdx: number;
  field: ApplicationField;
  readOnly: boolean;
  lockSystemFields: boolean;
  onBack: () => void;
  onUpdateField: (patch: Partial<ApplicationField>) => void;
  onRequestDeleteField: () => void;
}) {
  const isLockedField =
    lockSystemFields && (field.system === true || isSystemFieldId(field.id));

  return (
    <div className="w-full max-w-3xl space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium"
        style={{ color: C.accent }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {step.title || `Step ${stepIdx + 1}`}
      </button>

      <BuilderSectionIntro
        C={C}
        eyebrow={`Step ${stepIdx + 1} · Question`}
        title="Edit question"
        subtitle="Set up what families see and how they answer this question."
      />

      <ApplicationFormFieldEditor
        C={C}
        field={field}
        readOnly={readOnly || isLockedField}
        onChange={onUpdateField}
        onDelete={isLockedField ? undefined : onRequestDeleteField}
      />
    </div>
  );
}

export default function ApplicationFormFocusCanvas({
  C,
  focus,
  editable,
  programs,
  orgSlug,
  organizationId,
  readOnly,
  lockSystemFields = false,
  lockApplySlug = false,
  setupHighlight,
  slugError,
  stripePaymentsReady = true,
  onFocusChange,
  onEditableChange,
  onUpdateSchema,
  onDeleteStep,
}: ApplicationFormFocusCanvasProps) {
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const key = focusKey(focus);

  const step =
    focus.kind === "step" || focus.kind === "field"
      ? editable.schema.sections.find((s) => s.id === focus.stepId)
      : undefined;

  const stepIdx =
    step !== undefined
      ? editable.schema.sections.findIndex((s) => s.id === step.id)
      : -1;

  const field =
    focus.kind === "field" && step
      ? step.fields.find((f) => f.id === focus.fieldId)
      : undefined;

  const updateStep = (stepId: string, patch: Partial<ApplicationSection>) => {
    onUpdateSchema((schema) => ({
      ...schema,
      sections: schema.sections.map((s) =>
        s.id === stepId ? { ...s, ...patch } : s,
      ),
    }));
  };

  const updateField = (
    stepId: string,
    fieldId: string,
    patch: Partial<ApplicationField>,
  ) => {
    onUpdateSchema((schema) => ({
      ...schema,
      sections: schema.sections.map((s) =>
        s.id === stepId
          ? {
              ...s,
              fields: s.fields.map((f) =>
                f.id === fieldId ? { ...f, ...patch } : f,
              ),
            }
          : s,
      ),
    }));
  };

  const deleteField = (stepId: string, fieldId: string) => {
    if (lockSystemFields && isSystemFieldId(fieldId)) return;
    onUpdateSchema((schema) => ({
      ...schema,
      sections: schema.sections.map((s) =>
        s.id === stepId
          ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
          : s,
      ),
    }));
    onFocusChange({ kind: "step", stepId });
  };

  const addField = (stepId: string, field: ApplicationField) => {
    onUpdateSchema((schema) => ({
      ...schema,
      sections: schema.sections.map((s) =>
        s.id === stepId ? { ...s, fields: [...s.fields, field] } : s,
      ),
    }));
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;

    if (pendingDelete.kind === "step") {
      onDeleteStep(pendingDelete.stepId);
    } else {
      deleteField(pendingDelete.stepId, pendingDelete.fieldId);
    }
    setPendingDelete(null);
  };

  const confirmCopy =
    pendingDelete?.kind === "step"
      ? {
          title: "Delete step?",
          description: `This removes "${pendingDelete.stepTitle}" and all ${pendingDelete.questionCount} question${pendingDelete.questionCount === 1 ? "" : "s"}. This can't be undone until you save.`,
          confirmLabel: "Delete step",
        }
      : pendingDelete?.kind === "field"
        ? {
            title: "Delete question?",
            description: `Remove "${pendingDelete.fieldLabel}" from this step?`,
            confirmLabel: "Delete question",
          }
        : null;

  return (
    <>
    <div className="flex-1 overflow-y-auto px-5 py-4" style={{ backgroundColor: C.surface }}>
      <AnimatePresence mode="wait">
        <motion.div key={key} {...canvasTransition}>
          {focus.kind === "setup" && (
            <SetupView
              C={C}
              editable={editable}
              programs={programs}
              orgSlug={orgSlug}
              readOnly={readOnly}
              lockApplySlug={lockApplySlug}
              setupHighlight={setupHighlight}
              slugError={slugError}
              onEditableChange={onEditableChange}
            />
          )}

          {focus.kind === "step" && step && stepIdx >= 0 && (
            <StepView
              C={C}
              step={step}
              stepIdx={stepIdx}
              readOnly={readOnly}
              lockSystemFields={lockSystemFields}
              selectedFieldId={null}
              onFocusChange={onFocusChange}
              onUpdateStep={(patch) => updateStep(step.id, patch)}
              onRequestDeleteStep={() => {
                if (lockSystemFields && isSystemSection(step)) return;
                setPendingDelete({
                  kind: "step",
                  stepId: step.id,
                  stepTitle: step.title || `Step ${stepIdx + 1}`,
                  questionCount: step.fields.length,
                });
              }}
              onAddField={(field) => addField(step.id, field)}
              onReorderFields={(fields) =>
                updateStep(step.id, { fields })
              }
            />
          )}

          {focus.kind === "field" && step && field && stepIdx >= 0 && (
            <FieldView
              C={C}
              step={step}
              stepIdx={stepIdx}
              field={field}
              readOnly={readOnly}
              lockSystemFields={lockSystemFields}
              onBack={() => onFocusChange({ kind: "step", stepId: step.id })}
              onUpdateField={(patch) => updateField(step.id, field.id, patch)}
              onRequestDeleteField={() => {
                if (lockSystemFields && isSystemFieldId(field.id)) return;
                setPendingDelete({
                  kind: "field",
                  stepId: step.id,
                  fieldId: field.id,
                  fieldLabel: field.label || "Untitled question",
                });
              }}
            />
          )}

          {focus.kind === "fee" && (
            <div className="w-full max-w-3xl space-y-5">
              <BuilderSectionIntro
                C={C}
                title="Application fee"
                subtitle="Decide whether families pay before they can submit."
              />
              <ApplicationFormFeePanel
                C={C}
                feeConfig={editable.feeConfig}
                readOnly={readOnly}
                onChange={(feeConfig) => onEditableChange({ feeConfig })}
                hideHeader
                orgSlug={orgSlug}
                stripePaymentsReady={stripePaymentsReady}
              />
            </div>
          )}

          {focus.kind === "acknowledgments" && (
            <div className="w-full max-w-3xl space-y-5">
              <BuilderSectionIntro
                C={C}
                title="Acknowledgments"
                subtitle="Add agreements families must confirm before submitting."
              />
              <ApplicationFormAcknowledgmentsEditor
                C={C}
                acknowledgments={editable.schema.acknowledgments}
                readOnly={readOnly}
                onChange={(acknowledgments) =>
                  onUpdateSchema((schema) => ({ ...schema, acknowledgments }))
                }
                hideHeader
              />
            </div>
          )}

          {focus.kind === "postSubmit" && (
            <div className="w-full max-w-3xl space-y-5">
              <BuilderSectionIntro
                C={C}
                title="Post-submit steps"
                subtitle="Guide families on what to do after they submit."
              />
              <ApplicationFormPostSubmitEditor
                C={C}
                organizationId={organizationId}
                postSubmitConfig={editable.postSubmitConfig}
                readOnly={readOnly}
                onChange={(postSubmitConfig) => onEditableChange({ postSubmitConfig })}
              />
            </div>
          )}

          {focus.kind === "field" && step && !field && (
            <div className="w-full max-w-3xl text-sm" style={{ color: C.textTertiary }}>
              Question not found.{" "}
              <button
                type="button"
                onClick={() => onFocusChange({ kind: "step", stepId: step.id })}
                style={{ color: C.accent }}
              >
                Back to step
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>

    <ConfirmDialog
      C={C}
      open={pendingDelete !== null}
      title={confirmCopy?.title ?? ""}
      description={confirmCopy?.description ?? ""}
      confirmLabel={confirmCopy?.confirmLabel ?? "Delete"}
      cancelLabel="Cancel"
      variant="destructive"
      onConfirm={handleConfirmDelete}
      onClose={() => setPendingDelete(null)}
    />
    </>
  );
}
