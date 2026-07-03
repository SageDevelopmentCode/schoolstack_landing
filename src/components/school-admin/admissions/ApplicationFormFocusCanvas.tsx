"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { ProgramOption } from "@/lib/admissions/application-forms";
import type {
  ApplicationField,
  ApplicationFormFeeConfig,
  ApplicationFormSchema,
  ApplicationSection,
} from "@/lib/admissions/application-form-schema";
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
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
};

type ApplicationFormFocusCanvasProps = {
  C: AdminThemeTokens;
  focus: BuilderFocus;
  editable: EditableFormSlice;
  programs: ProgramOption[];
  readOnly: boolean;
  onFocusChange: (focus: BuilderFocus) => void;
  onEditableChange: (patch: Partial<EditableFormSlice>) => void;
  onUpdateSchema: (
    updater: (schema: ApplicationFormSchema) => ApplicationFormSchema,
  ) => void;
  onDeleteStep: (stepId: string) => void;
};

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
  readOnly,
  onEditableChange,
}: {
  C: AdminThemeTokens;
  editable: EditableFormSlice;
  programs: ProgramOption[];
  readOnly: boolean;
  onEditableChange: (patch: Partial<EditableFormSlice>) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
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

      <div className="space-y-2">
        <FieldLabel
          C={C}
          hint="Leave as default to use one form for the whole school. Pick a program to scope this form."
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
          <option value="">All programs (school default)</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function StepView({
  C,
  step,
  stepIdx,
  readOnly,
  selectedFieldId,
  onFocusChange,
  onUpdateStep,
  onDeleteStep,
  onAddField,
  onDeleteField,
  onReorderFields,
}: {
  C: AdminThemeTokens;
  step: ApplicationSection;
  stepIdx: number;
  readOnly: boolean;
  selectedFieldId: string | null;
  onFocusChange: (focus: BuilderFocus) => void;
  onUpdateStep: (patch: Partial<ApplicationSection>) => void;
  onDeleteStep: () => void;
  onAddField: (field: ApplicationField) => void;
  onDeleteField: (fieldId: string) => void;
  onReorderFields: (fields: ApplicationField[]) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium" style={{ color: C.textTertiary }}>
            Step {stepIdx + 1}
          </p>
          <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
            {step.title || `Step ${stepIdx + 1}`}
          </h2>
          <p className="mt-1 text-sm" style={{ color: C.textTertiary }}>
            One screen of questions in the apply flow.
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={onDeleteStep}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium shrink-0"
            style={{ color: C.error, backgroundColor: C.errorBg }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete step
          </button>
        )}
      </div>

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
      </div>

      <ApplicationFormQuestionList
        C={C}
        stepId={step.id}
        fields={step.fields}
        selectedFieldId={selectedFieldId}
        readOnly={readOnly}
        onSelectField={(fieldId) =>
          onFocusChange({ kind: "field", stepId: step.id, fieldId })
        }
        onAddField={(field) => {
          onAddField(field);
          onFocusChange({ kind: "field", stepId: step.id, fieldId: field.id });
        }}
        onDeleteField={onDeleteField}
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
  onBack,
  onUpdateField,
  onDeleteField,
}: {
  C: AdminThemeTokens;
  step: ApplicationSection;
  stepIdx: number;
  field: ApplicationField;
  readOnly: boolean;
  onBack: () => void;
  onUpdateField: (patch: Partial<ApplicationField>) => void;
  onDeleteField: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
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
          readOnly={readOnly}
          onChange={onUpdateField}
          onDelete={onDeleteField}
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
  readOnly,
  onFocusChange,
  onEditableChange,
  onUpdateSchema,
  onDeleteStep,
}: ApplicationFormFocusCanvasProps) {
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

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8" style={{ backgroundColor: C.surface }}>
      <AnimatePresence mode="wait">
        <motion.div key={key} {...canvasTransition}>
          {focus.kind === "setup" && (
            <SetupView
              C={C}
              editable={editable}
              programs={programs}
              readOnly={readOnly}
              onEditableChange={onEditableChange}
            />
          )}

          {focus.kind === "step" && step && stepIdx >= 0 && (
            <StepView
              C={C}
              step={step}
              stepIdx={stepIdx}
              readOnly={readOnly}
              selectedFieldId={null}
              onFocusChange={onFocusChange}
              onUpdateStep={(patch) => updateStep(step.id, patch)}
              onDeleteStep={() => onDeleteStep(step.id)}
              onAddField={(field) => addField(step.id, field)}
              onDeleteField={(fieldId) => deleteField(step.id, fieldId)}
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
              onBack={() => onFocusChange({ kind: "step", stepId: step.id })}
              onUpdateField={(patch) => updateField(step.id, field.id, patch)}
              onDeleteField={() => deleteField(step.id, field.id)}
            />
          )}

          {focus.kind === "fee" && (
            <div className="mx-auto w-full max-w-xl space-y-6">
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
              />
            </div>
          )}

          {focus.kind === "acknowledgments" && (
            <div className="mx-auto w-full max-w-xl space-y-6">
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
            <div className="mx-auto max-w-xl text-sm" style={{ color: C.textTertiary }}>
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
  );
}
