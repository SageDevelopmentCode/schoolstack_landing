"use client";

import { Plus, Trash2 } from "lucide-react";
import ApplicationFieldInput from "@/components/admissions/ApplicationFieldInput";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import {
  createEmptyEntry,
  type ChecklistFormEntry,
} from "@/lib/admissions/checklist-form-responses";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type RepeatableFormEntriesProps = {
  C: AdminThemeTokens;
  fields: ApplicationField[];
  entries: ChecklistFormEntry[];
  stepHeading: string;
  required: boolean;
  disabled?: boolean;
  onChange: (entries: ChecklistFormEntry[]) => void;
};

function entryHeaderLabel(stepHeading: string, index: number): string {
  if (stepHeading.trim()) {
    return stepHeading.trim();
  }
  return `Entry ${index + 1}`;
}

export default function RepeatableFormEntries({
  C,
  fields,
  entries,
  stepHeading,
  required,
  disabled = false,
  onChange,
}: RepeatableFormEntriesProps) {
  const addStepHeading = stepHeading.trim() || "Entry";

  const updateEntryValue = (
    entryId: string,
    fieldId: string,
    value: string,
  ) => {
    onChange(
      entries.map((entry) =>
        entry.id === entryId
          ? { ...entry, values: { ...entry.values, [fieldId]: value } }
          : entry,
      ),
    );
  };

  const removeEntry = (entryId: string) => {
    onChange(entries.filter((entry) => entry.id !== entryId));
  };

  const canRemoveEntry = (): boolean => {
    if (required && entries.length <= 1) return false;
    return true;
  };

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className="rounded-lg border border-gray-100 px-4 py-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              {entryHeaderLabel(stepHeading, index)}
            </span>
            {!disabled ? (
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                disabled={!canRemoveEntry()}
                className="rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ color: C.error, backgroundColor: C.errorBg }}
                aria-label={`Remove ${entryHeaderLabel(stepHeading, index)}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: C.textPrimary }}
                >
                  {field.label}
                  {field.required ? (
                    <span style={{ color: C.error }}> *</span>
                  ) : null}
                </label>
                <ApplicationFieldInput
                  field={field}
                  value={entry.values[field.id] ?? ""}
                  onChange={(value) =>
                    updateEntryValue(entry.id, field.id, value)
                  }
                  disabled={disabled}
                  C={C}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {!disabled ? (
        <button
          type="button"
          onClick={() => onChange([...entries, createEmptyEntry()])}
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: C.accent }}
        >
          <Plus className="h-4 w-4" />
          Add {addStepHeading}
        </button>
      ) : null}
    </div>
  );
}
