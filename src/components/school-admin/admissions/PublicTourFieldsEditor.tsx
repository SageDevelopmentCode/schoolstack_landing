"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { PublicTourFieldDefinition, PublicTourFieldType } from "@/lib/admissions/public-tour-settings";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import {
  committeeStoryInputClassName,
  committeeStoryInputStyle,
} from "@/components/school-admin/committees/committee-story-input-style";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const CUSTOM_FIELD_TYPES: PublicTourFieldType[] = [
  "text",
  "textarea",
  "email",
  "phone",
  "select",
  "checkbox",
];

const FIELD_TYPE_LABELS: Record<PublicTourFieldType, string> = {
  text: "Short text",
  textarea: "Long text",
  email: "Email",
  phone: "Phone",
  select: "Dropdown",
  checkbox: "Checkbox",
  children_repeat: "Children list",
};

type PublicTourFieldsEditorProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  fields: PublicTourFieldDefinition[];
  disabled?: boolean;
  onChange: (fields: PublicTourFieldDefinition[]) => void;
};

function canRemoveField(field: PublicTourFieldDefinition): boolean {
  return (
    field.type !== "children_repeat" &&
    field.id !== "email" &&
    field.id !== "contact_name"
  );
}

function PublicTourRequiredSwitch({
  theme,
  checked,
  disabled,
  questionIndex,
  onChange,
}: {
  theme: ParentThemeTokens;
  checked: boolean;
  disabled: boolean;
  questionIndex: number;
  onChange: (required: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${checked ? "Required" : "Optional"} for question ${questionIndex + 1}`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex min-h-[44px] shrink-0 items-center gap-3 rounded-[10px] px-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className="text-[12px] font-bold tabular-nums"
        style={{ color: checked ? theme.primaryDark : theme.muted }}
      >
        {checked ? "Required" : "Optional"}
      </span>
      <span
        aria-hidden
        className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
        style={{ backgroundColor: checked ? theme.primary : "#DCE4DC" }}
      >
        <span
          className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
          style={{
            transform: checked ? "translateX(22px)" : "translateX(2px)",
          }}
        />
      </span>
    </button>
  );
}

export default function PublicTourFieldsEditor({
  C,
  theme,
  fields,
  disabled = false,
  onChange,
}: PublicTourFieldsEditorProps) {
  const inputStyle = committeeStoryInputStyle(theme);

  function updateField(index: number, patch: Partial<PublicTourFieldDefinition>) {
    const next = fields.map((field, i) => (i === index ? { ...field, ...patch } : field));
    onChange(next);
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    onChange(next);
  }

  function addField() {
    const id = `custom_${Date.now()}`;
    onChange([
      ...fields,
      {
        id,
        label: "New question",
        required: false,
        type: "text",
      },
    ]);
  }

  return (
    <div className="space-y-3">
      <div
        className="overflow-hidden rounded-[16px] border"
        style={{ borderColor: theme.line, backgroundColor: "#F4F7F4" }}
      >
        {fields.map((field, index) => {
          const reorderActions = (
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                disabled={disabled || index === 0}
                onClick={() => moveField(index, -1)}
                className="rounded-md p-1.5 transition-colors hover:bg-black/5 disabled:opacity-30"
                style={{ color: C.textTertiary }}
                aria-label={`Move question ${index + 1} up`}
              >
                <ChevronUp className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                disabled={disabled || index === fields.length - 1}
                onClick={() => moveField(index, 1)}
                className="rounded-md p-1.5 transition-colors hover:bg-black/5 disabled:opacity-30"
                style={{ color: C.textTertiary }}
                aria-label={`Move question ${index + 1} down`}
              >
                <ChevronDown className="h-4 w-4" aria-hidden />
              </button>
              {canRemoveField(field) ? (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeField(index)}
                  className="rounded-md p-1.5 transition-colors hover:bg-black/5 disabled:opacity-30"
                  style={{ color: C.error }}
                  aria-label={`Remove question ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </div>
          );

          const labelPreview =
            field.label.trim().length > 0 ? field.label.trim() : "Untitled question";

          return (
            <div
              key={field.id}
              className="border-b bg-white/90 px-4 py-5 last:border-b-0 sm:px-5"
              style={{ borderColor: theme.line }}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.1em]"
                    style={{ color: theme.muted }}
                  >
                    Question {index + 1}
                  </p>
                  <p
                    className="mt-0.5 truncate text-[13px] font-semibold"
                    style={{ color: theme.ink }}
                  >
                    {labelPreview}
                  </p>
                </div>
                {reorderActions}
              </div>

              <div className="space-y-3">
                {field.type === "children_repeat" ? (
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: theme.ink }}>
                      {field.label}
                    </p>
                    {field.helpText ? (
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: theme.muted }}>
                        {field.helpText}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: theme.muted }}>
                        Families can add multiple children.
                      </p>
                    )}
                  </div>
                ) : (
                  <label className="block">
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.06em]"
                      style={{ color: theme.muted }}
                    >
                      Question label
                    </span>
                    <input
                      type="text"
                      disabled={disabled}
                      value={field.label}
                      onChange={(event) => updateField(index, { label: event.target.value })}
                      className={`mt-1.5 ${committeeStoryInputClassName}`}
                      style={inputStyle}
                      placeholder="What families will read on the form"
                    />
                  </label>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  {field.type !== "children_repeat" ? (
                    <label className="block min-w-0 flex-1">
                      <span
                        className="text-[11px] font-bold uppercase tracking-[0.06em]"
                        style={{ color: theme.muted }}
                      >
                        Answer type
                      </span>
                      <select
                        disabled={disabled}
                        value={field.type}
                        onChange={(event) =>
                          updateField(index, { type: event.target.value as PublicTourFieldType })
                        }
                        className={`mt-1.5 ${committeeStoryInputClassName} text-[13px]`}
                        style={inputStyle}
                      >
                        {CUSTOM_FIELD_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {FIELD_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <span
                      className="inline-flex self-start rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                      style={{ backgroundColor: "#E8F2E9", color: "#346A4E" }}
                    >
                      {FIELD_TYPE_LABELS.children_repeat}
                    </span>
                  )}

                  <PublicTourRequiredSwitch
                    theme={theme}
                    checked={field.required}
                    disabled={disabled}
                    questionIndex={index}
                    onChange={(required) => updateField(index, { required })}
                  />
                </div>

                {field.type === "select" ? (
                  <label className="block">
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.06em]"
                      style={{ color: theme.muted }}
                    >
                      Choices (comma-separated)
                    </span>
                    <input
                      type="text"
                      disabled={disabled}
                      placeholder="Option A, Option B, Option C"
                      value={(field.options ?? []).join(", ")}
                      onChange={(event) =>
                        updateField(index, {
                          options: event.target.value
                            .split(",")
                            .map((part) => part.trim())
                            .filter(Boolean),
                        })
                      }
                      className={`mt-1.5 ${committeeStoryInputClassName}`}
                      style={inputStyle}
                    />
                  </label>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <AdminButton
        theme={theme}
        type="button"
        variant="soft"
        disabled={disabled}
        onClick={addField}
      >
        + Add question
      </AdminButton>
    </div>
  );
}
