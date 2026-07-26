"use client";

import { useLayoutEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import {
  APPLICATION_FIELD_TYPES,
  MAX_APPLICATION_FIELD_LABEL_LENGTH,
  type ApplicationField,
  type ApplicationFieldType,
} from "@/lib/admissions/application-form-schema";
import { newAdmissionsId } from "@/lib/admissions/application-form-schema";
import {
  APPLICATION_FIELD_PRESETS,
  fieldFromPreset,
} from "@/lib/admissions/field-presets";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ApplicationFieldOptionsEditor, {
  createDefaultFieldOptions,
} from "./ApplicationFieldOptionsEditor";
import { BuilderQuestionCard } from "./builder-question-card";

type ApplicationFormFieldEditorProps = {
  C: AdminThemeTokens;
  field: ApplicationField;
  readOnly?: boolean;
  onChange: (patch: Partial<ApplicationField>) => void;
  onDelete?: () => void;
};

function controlStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
}

function resizeTextarea(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export default function ApplicationFormFieldEditor({
  C,
  field,
  readOnly = false,
  onChange,
  onDelete,
}: ApplicationFormFieldEditorProps) {
  const labelTextareaRef = useRef<HTMLTextAreaElement>(null);
  const needsOptions = field.type === "select" || field.type === "radio";
  const style = controlStyle(C);

  useLayoutEffect(() => {
    const el = labelTextareaRef.current;
    if (!el) return;
    resizeTextarea(el);
    const observer = new ResizeObserver(() => resizeTextarea(el));
    observer.observe(el);
    return () => observer.disconnect();
  }, [field.label, field.id]);

  return (
    <div className="space-y-5">
      <BuilderQuestionCard
        C={C}
        tone="accent"
        question="What question do you want families to answer?"
        helper="This is the label families see above the answer field."
      >
        <div className="space-y-1.5">
          <textarea
            ref={labelTextareaRef}
            rows={1}
            value={field.label}
            disabled={readOnly}
            maxLength={MAX_APPLICATION_FIELD_LABEL_LENGTH}
            onChange={(e) => {
              const label = e.target.value.slice(0, MAX_APPLICATION_FIELD_LABEL_LENGTH);
              onChange({ label });
              resizeTextarea(e.target);
            }}
            placeholder="What families see on the form"
            style={{
              ...style,
              resize: "none",
              overflow: "hidden",
              lineHeight: 1.5,
            }}
          />
          <p className="text-right text-xs" style={{ color: C.textTertiary }}>
            {field.label.length} / {MAX_APPLICATION_FIELD_LABEL_LENGTH}
          </p>
        </div>
      </BuilderQuestionCard>

      <BuilderQuestionCard
        C={C}
        tone="clay"
        question="How should they answer?"
        helper="Choose the input type that best fits this question."
      >
        <SchoolAdminSelect
          C={C}
          value={field.type}
          disabled={readOnly}
          onChange={(value) => {
            const type = value as ApplicationFieldType;
            const patch: Partial<ApplicationField> = { type };
            if (
              (type === "select" || type === "radio") &&
              (!field.options || field.options.length === 0)
            ) {
              patch.options = createDefaultFieldOptions();
            }
            onChange(patch);
          }}
          options={APPLICATION_FIELD_TYPES.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          ariaLabel="Field input type"
        />
      </BuilderQuestionCard>

      <BuilderQuestionCard
        C={C}
        tone="info"
        question="Is an answer required?"
        action={
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="text-sm font-medium"
              style={{ color: field.required ? C.accent : C.textTertiary }}
            >
              {field.required ? "Required" : "Optional"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={field.required}
              aria-label="Required"
              disabled={readOnly}
              onClick={() => onChange({ required: !field.required })}
              className="relative h-5 w-10 shrink-0 rounded-full transition-colors disabled:opacity-50"
              style={{ backgroundColor: field.required ? C.accent : C.border }}
            >
              <span
                className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                style={{
                  transform: field.required ? "translateX(1.25rem)" : "translateX(0)",
                }}
              />
            </button>
          </div>
        }
      />

      {(field.type === "text" ||
        field.type === "email" ||
        field.type === "tel" ||
        field.type === "textarea") && (
        <BuilderQuestionCard
          C={C}
          tone="clay"
          question="Any placeholder or hint text?"
          helper="Optional text shown inside the empty field."
        >
          <input
            type="text"
            value={field.placeholder ?? ""}
            disabled={readOnly}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            placeholder="Optional hint text inside the field"
            style={style}
          />
        </BuilderQuestionCard>
      )}

      {needsOptions && (
        <BuilderQuestionCard
          C={C}
          tone="info"
          question="What choices can they pick from?"
          helper="Add the choices families will see. Drag to reorder."
        >
          <ApplicationFieldOptionsEditor
            C={C}
            options={field.options ?? []}
            readOnly={readOnly}
            onChange={(options) => onChange({ options })}
          />
        </BuilderQuestionCard>
      )}

      {field.type === "address" && (
        <BuilderQuestionCard
          C={C}
          tone="info"
          question="What will families see?"
          helper="Families will enter street address, city, state, and ZIP in separate fields."
        >
          <p className="text-sm" style={{ color: C.textSecondary }}>
            Address line 1, address line 2 (optional), city, state, and ZIP code.
          </p>
        </BuilderQuestionCard>
      )}

      {field.type === "file" && (
        <BuilderQuestionCard
          C={C}
          tone="warning"
          question="How should file uploads work?"
          helper="Set limits and accepted file types for this upload."
        >
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={field.helpText ?? ""}
                disabled={readOnly}
                onChange={(e) => onChange({ helpText: e.target.value })}
                placeholder="e.g. Upload up to 5 files"
                style={style}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-xs font-medium" style={{ color: C.textSecondary }}>
                  Max files
                </p>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={field.maxFiles ?? 5}
                  disabled={readOnly}
                  onChange={(e) =>
                    onChange({
                      maxFiles: Math.max(1, Number(e.target.value) || 1),
                    })
                  }
                  style={style}
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium" style={{ color: C.textSecondary }}>
                  Accepted types
                </p>
                <input
                  type="text"
                  value={field.accept ?? ".pdf,.jpg,.jpeg,.png"}
                  disabled={readOnly}
                  onChange={(e) => onChange({ accept: e.target.value })}
                  placeholder=".pdf,.jpg,.jpeg,.png"
                  style={style}
                />
              </div>
            </div>
          </div>
        </BuilderQuestionCard>
      )}

      {!readOnly && onDelete ? (
        <div className="flex justify-end pt-2 border-t" style={{ borderColor: C.border }}>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium"
            style={{ color: C.error, backgroundColor: C.errorBg }}
          >
            <Trash2 className="h-4 w-4" />
            Delete question
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ApplicationFormFieldPresetPicker({
  C,
  stepId,
  onAddPreset,
  onAddBlank,
}: {
  C: AdminThemeTokens;
  stepId: string;
  onAddPreset: (stepId: string, field: ApplicationField) => void;
  onAddBlank: (stepId: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {APPLICATION_FIELD_PRESETS.slice(0, 8).map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onAddPreset(stepId, fieldFromPreset(preset))}
            className="rounded-md px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: C.accentLight,
              color: C.accent,
              border: `1px solid ${C.secondaryBtnBorder}`,
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onAddBlank(stepId)}
        className="text-xs font-medium"
        style={{ color: C.accent }}
      >
        Custom question
      </button>
    </div>
  );
}

export function createBlankField(): ApplicationField {
  return {
    id: newAdmissionsId(),
    label: "New question",
    type: "text",
    required: false,
  };
}
