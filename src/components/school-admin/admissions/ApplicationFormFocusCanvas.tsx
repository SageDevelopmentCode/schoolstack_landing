"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import ApplicationStepNotice from "@/components/admissions/ApplicationStepNotice";
import type { ProgramOption } from "@/lib/admissions/application-forms";
import { publicApplicationFormPath } from "@/lib/admissions/application-forms";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type {
  ApplicationField,
  ApplicationFormFeeConfig,
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
import ApplicationFormQuestionList from "./ApplicationFormQuestionList";
import { focusKey, type BuilderFocus } from "./builder-focus";

export type EditableFormSlice = {
  title: string;
  intro: string;
  programId: string | null;
  publicSlug: string;
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
};

type ApplicationFormFocusCanvasProps = {
  C: AdminThemeTokens;
  focus: BuilderFocus;
  editable: EditableFormSlice;
  programs: ProgramOption[];
  orgSlug: string;
  readOnly: boolean;
  lockSystemFields?: boolean;
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

function FieldLabel({
  children,
  hint,
  C,
}: {
  children: React.ReactNode;
  hint?: string;
  C: AdminThemeTokens;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium" style={{ color: C.textPrimary }}>
        {children}
      </label>
      {hint ? (
        <p className="text-xs" style={{ color: C.textTertiary }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

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

function SetupView({
  C,
  editable,
  programs,
  orgSlug,
  readOnly,
  setupHighlight,
  slugError,
  onEditableChange,
}: {
  C: AdminThemeTokens;
  editable: EditableFormSlice;
  programs: ProgramOption[];
  orgSlug: string;
  readOnly: boolean;
  setupHighlight?: "publicSlug" | null;
  slugError?: string | null;
  onEditableChange: (patch: Partial<EditableFormSlice>) => void;
}) {
  const slugInputRef = useRef<HTMLInputElement>(null);
  const slugHighlighted = setupHighlight === "publicSlug";

  useEffect(() => {
    if (!slugHighlighted) return;
    const input = slugInputRef.current;
    if (!input) return;
    input.focus();
    input.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [slugHighlighted]);

  const previewPath = editable.publicSlug.trim()
    ? publicApplicationFormPath(orgSlug, editable.publicSlug)
    : publicApplicationFormPath(orgSlug, "your-slug");

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
          Form setup
        </h2>
        <p className="mt-1 text-sm" style={{ color: C.textTertiary }}>
          Basic info families see when they start applying.
        </p>
      </div>

      <div className="space-y-2">
        <FieldLabel C={C} hint="Shown as the main heading on the apply page.">
          Form title
        </FieldLabel>
        <input
          type="text"
          value={editable.title}
          disabled={readOnly}
          onChange={(e) => onEditableChange({ title: e.target.value })}
          placeholder="e.g. Application for Fall 2026"
          style={inputStyle(C)}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel C={C} hint="Shown on the first screen families see.">
          Intro
        </FieldLabel>
        <textarea
          rows={4}
          value={editable.intro}
          disabled={readOnly}
          onChange={(e) => onEditableChange({ intro: e.target.value })}
          placeholder="Welcome families and explain what to expect…"
          style={{ ...inputStyle(C), resize: "vertical" }}
        />
      </div>

      <div
        className="space-y-2 rounded-md p-3 -mx-3"
        style={
          slugHighlighted
            ? {
                backgroundColor: C.errorBg,
                border: `1px solid ${C.errorBorder}`,
              }
            : undefined
        }
      >
        <FieldLabel
          C={C}
          hint="Used in the public URL. Lowercase letters, numbers, and hyphens only."
        >
          Public URL slug
        </FieldLabel>
        <div className="flex items-center gap-2">
          <span
            className="shrink-0 text-xs"
            style={{ color: C.textTertiary }}
          >
            /school/{orgSlug}/forms/
          </span>
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
        </div>
        {slugHighlighted && slugError ? (
          <p className="text-xs font-medium" style={{ color: C.error }}>
            {slugError}
          </p>
        ) : (
          <p className="text-xs" style={{ color: C.textTertiary }}>
            Families will visit {previewPath}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <FieldLabel
          C={C}
          hint="Required for the public apply flow. Each application is tied to one program."
        >
          Program
        </FieldLabel>
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

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium" style={{ color: C.textTertiary }}>
            Step {stepIdx + 1}
          </p>
          <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
            {step.title || `Step ${stepIdx + 1}`}
          </h2>
          <p className="mt-1 text-sm" style={{ color: C.textTertiary }}>
            {isLockedStep
              ? "Required student fields for your school directory."
              : "One screen of questions in the apply flow."}
          </p>
        </div>
        {!readOnly && !isLockedStep && (
          <button
            type="button"
            onClick={onRequestDeleteStep}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium shrink-0"
            style={{ color: C.error, backgroundColor: C.errorBg }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete step
          </button>
        )}
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

      <div className="space-y-4">
        <div className="space-y-2">
          <FieldLabel C={C}>Step title</FieldLabel>
          <input
            type="text"
            value={step.title}
            disabled={readOnly}
            onChange={(e) => onUpdateStep({ title: e.target.value })}
            placeholder="e.g. Parent information"
            style={inputStyle(C)}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel C={C} hint="Optional instructions at the top of this step.">
            Step intro
          </FieldLabel>
          <textarea
            rows={2}
            value={step.description ?? ""}
            disabled={readOnly}
            onChange={(e) => onUpdateStep({ description: e.target.value })}
            placeholder="Optional instructions for this step…"
            style={{ ...inputStyle(C), resize: "vertical" }}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel
            C={C}
            hint="Shown to families as a highlighted callout on this step."
          >
            Step message
          </FieldLabel>
          <textarea
            rows={2}
            value={step.stepNotice?.body ?? ""}
            disabled={readOnly}
            onChange={(e) => {
              const body = e.target.value;
              if (!body.trim()) {
                onUpdateStep({ stepNotice: undefined });
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
        </div>
        {step.stepNotice?.body.trim() ? (
          <div className="space-y-2">
            <FieldLabel C={C}>Message placement</FieldLabel>
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
      />
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
    <div className="w-full max-w-3xl space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium"
        style={{ color: C.accent }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {step.title || `Step ${stepIdx + 1}`}
      </button>

      <div>
        <p className="text-xs font-medium" style={{ color: C.textTertiary }}>
          Step {stepIdx + 1} · Question
        </p>
        <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
          Edit question
        </h2>
      </div>

      <div
        className="rounded-lg border p-5"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <ApplicationFormFieldEditor
          C={C}
          field={field}
          readOnly={readOnly || isLockedField}
          onChange={onUpdateField}
          onDelete={isLockedField ? undefined : onRequestDeleteField}
        />
      </div>
    </div>
  );
}

export default function ApplicationFormFocusCanvas({
  C,
  focus,
  editable,
  programs,
  orgSlug,
  readOnly,
  lockSystemFields = false,
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
            <div className="w-full max-w-3xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
                  Application fee
                </h2>
                <p className="mt-1 text-sm" style={{ color: C.textTertiary }}>
                  Optional fee collected before families submit.
                </p>
              </div>
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
            <div className="w-full max-w-3xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
                  Acknowledgments
                </h2>
                <p className="mt-1 text-sm" style={{ color: C.textTertiary }}>
                  Checkbox statements families must confirm before submitting.
                </p>
              </div>
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
