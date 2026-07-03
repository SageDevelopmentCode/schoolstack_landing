"use client";

import { Reorder, useDragControls } from "framer-motion";
import { ChevronDown, GripVertical, Trash2 } from "lucide-react";
import {
  APPLICATION_FIELD_TYPES,
  newAdmissionsId,
  type ApplicationField,
  type ApplicationFieldType,
} from "@/lib/admissions/application-form-schema";
import {
  APPLICATION_FIELD_PRESETS,
  fieldFromPreset,
} from "@/lib/admissions/field-presets";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationFormFieldEditorProps = {
  C: AdminThemeTokens;
  stepId: string;
  field: ApplicationField;
  updateField: (
    stepId: string,
    fieldId: string,
    patch: Partial<ApplicationField>,
  ) => void;
  deleteField: (stepId: string, fieldId: string) => void;
};

export default function ApplicationFormFieldEditor({
  C,
  stepId,
  field,
  updateField,
  deleteField,
}: ApplicationFormFieldEditorProps) {
  const dragControls = useDragControls();

  const controlStyle: React.CSSProperties = {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.sm,
    fontSize: "13px",
    padding: "10px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const needsOptions = field.type === "select" || field.type === "radio";

  return (
    <Reorder.Item
      as="div"
      value={field}
      dragListener={false}
      dragControls={dragControls}
      className="flex gap-2.5 rounded-md border p-3.5"
      style={{
        borderColor: C.borderStrong,
        backgroundColor: C.surface,
        listStyle: "none",
      }}
      layout="position"
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="touch-none shrink-0 mt-1 cursor-grab rounded p-1 active:cursor-grabbing"
        style={{ color: C.textQuaternary }}
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex flex-1 flex-col gap-3">
        <div>
          <label
            className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: C.textTertiary }}
          >
            Question / label
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) =>
              updateField(stepId, field.id, { label: e.target.value })
            }
            placeholder="What families see on the form"
            style={controlStyle}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="min-w-[140px] flex-1">
            <label
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              Answer type
            </label>
            <div className="relative">
              <select
                value={field.type}
                onChange={(e) =>
                  updateField(stepId, field.id, {
                    type: e.target.value as ApplicationFieldType,
                  })
                }
                style={{ ...controlStyle, appearance: "none", paddingRight: 36 }}
              >
                {APPLICATION_FIELD_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2"
                style={{ color: C.textQuaternary }}
              />
            </div>
          </div>

          <div className="min-w-[180px] flex-1">
            <span
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              Require an answer?
            </span>
            <div
              className="flex gap-0.5 rounded-md border p-0.5"
              style={{ borderColor: C.borderStrong, backgroundColor: C.surface }}
            >
              <button
                type="button"
                className="flex-1 rounded px-2 py-2 text-[11px] font-semibold"
                style={{
                  backgroundColor: !field.required ? C.accentLight : "transparent",
                  color: !field.required ? C.accent : C.textTertiary,
                  border: !field.required
                    ? `1px solid ${C.accent}`
                    : "1px solid transparent",
                }}
                onClick={() =>
                  field.required &&
                  updateField(stepId, field.id, { required: false })
                }
              >
                Optional
              </button>
              <button
                type="button"
                className="flex-1 rounded px-2 py-2 text-[11px] font-semibold"
                style={{
                  backgroundColor: field.required ? C.errorBg : "transparent",
                  color: field.required ? C.error : C.textTertiary,
                  border: field.required
                    ? `1px solid ${C.errorBorder}`
                    : "1px solid transparent",
                }}
                onClick={() =>
                  !field.required &&
                  updateField(stepId, field.id, { required: true })
                }
              >
                Required
              </button>
            </div>
          </div>
        </div>

        {(field.type === "text" ||
          field.type === "email" ||
          field.type === "tel" ||
          field.type === "textarea") && (
          <div>
            <label
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              Placeholder (optional)
            </label>
            <input
              type="text"
              value={field.placeholder ?? ""}
              onChange={(e) =>
                updateField(stepId, field.id, { placeholder: e.target.value })
              }
              style={controlStyle}
            />
          </div>
        )}

        {field.type === "file" && (
          <div>
            <label
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              Help text (optional)
            </label>
            <input
              type="text"
              value={field.helpText ?? ""}
              onChange={(e) =>
                updateField(stepId, field.id, { helpText: e.target.value })
              }
              style={controlStyle}
            />
          </div>
        )}

        {needsOptions && (
          <div>
            <label
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              Options (one per line: value|Label)
            </label>
            <textarea
              rows={3}
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
                updateField(stepId, field.id, { options });
              }}
              style={{ ...controlStyle, resize: "vertical" }}
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => deleteField(stepId, field.id)}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold"
            style={{ color: C.error, backgroundColor: C.errorBg }}
          >
            <Trash2 className="h-3 w-3" />
            Remove question
          </button>
        </div>
      </div>
    </Reorder.Item>
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
        {APPLICATION_FIELD_PRESETS.slice(0, 6).map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onAddPreset(stepId, fieldFromPreset(preset))}
            className="rounded px-2 py-1 text-[10px] font-medium"
            style={{
              backgroundColor: C.accentLight,
              color: C.accent,
              border: `1px solid ${C.secondaryBtnBorder}`,
            }}
          >
            + {preset.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onAddBlank(stepId)}
        className="text-[11px] font-medium"
        style={{ color: C.accent }}
      >
        + Add custom question
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
