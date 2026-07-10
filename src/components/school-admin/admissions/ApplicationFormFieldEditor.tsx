"use client";

import { ChevronDown, Trash2 } from "lucide-react";
import {
  APPLICATION_FIELD_TYPES,
  type ApplicationField,
  type ApplicationFieldType,
} from "@/lib/admissions/application-form-schema";
import { newAdmissionsId } from "@/lib/admissions/application-form-schema";
import {
  APPLICATION_FIELD_PRESETS,
  fieldFromPreset,
} from "@/lib/admissions/field-presets";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
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

export default function ApplicationFormFieldEditor({
  C,
  field,
  readOnly = false,
  onChange,
  onDelete,
}: ApplicationFormFieldEditorProps) {
  const needsOptions = field.type === "select" || field.type === "radio";
  const style = controlStyle(C);

  return (
    <div className="space-y-5">
      <BuilderQuestionCard
        C={C}
        tone="accent"
        question="What question do you want families to answer?"
        helper="This is the label families see above the answer field."
      >
        <input
          type="text"
          value={field.label}
          disabled={readOnly}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="What families see on the form"
          style={style}
        />
      </BuilderQuestionCard>

      <BuilderQuestionCard
        C={C}
        tone="clay"
        question="How should they answer?"
        helper="Choose the input type that best fits this question."
      >
        <div className="relative">
          <select
            value={field.type}
            disabled={readOnly}
            onChange={(e) =>
              onChange({ type: e.target.value as ApplicationFieldType })
            }
            style={{ ...style, appearance: "none", paddingRight: 36 }}
          >
            {APPLICATION_FIELD_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
            style={{ color: C.textQuaternary }}
          />
        </div>
      </BuilderQuestionCard>

      <BuilderQuestionCard
        C={C}
        tone="info"
        question="Is an answer required?"
        helper="Required questions must be answered before families can continue."
      >
        <div
          className="flex gap-1 rounded-lg border p-1"
          style={{ borderColor: C.border, backgroundColor: C.bg }}
        >
          <button
            type="button"
            disabled={readOnly}
            className="flex-1 rounded-md py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: !field.required ? C.accentLight : "transparent",
              color: !field.required ? C.accent : C.textTertiary,
            }}
            onClick={() => field.required && onChange({ required: false })}
          >
            Optional
          </button>
          <button
            type="button"
            disabled={readOnly}
            className="flex-1 rounded-md py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: field.required ? C.errorBg : "transparent",
              color: field.required ? C.error : C.textTertiary,
            }}
            onClick={() => !field.required && onChange({ required: true })}
          >
            Required
          </button>
        </div>
      </BuilderQuestionCard>

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
          helper="One per line: value|Label (e.g. k|Kindergarten)"
        >
          <textarea
            rows={4}
            disabled={readOnly}
            value={(field.options ?? [])
              .map((o) => `${o.value}|${o.label}`)
              .join("\n")}
            onChange={(e) => {
              const options = e.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                  const [value, ...rest] = line.split("|");
                  const label = rest.join("|").trim() || value.trim();
                  return { value: value.trim(), label };
                });
              onChange({ options });
            }}
            style={{ ...style, resize: "vertical" }}
          />
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
