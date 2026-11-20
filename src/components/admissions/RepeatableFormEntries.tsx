"use client";

import { Plus, Trash2 } from "lucide-react";
import { ApplicationFieldAppearanceProvider } from "@/components/admissions/application-field-appearance";
import {
  APPLICATION_FIELD_GRID_CLASS,
  ApplicationFieldLabel,
  applicationFieldGridClass,
  fieldUsesDivWrapper,
} from "@/components/admissions/application-field-layout";
import ApplicationFieldInput from "@/components/admissions/ApplicationFieldInput";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
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
  const addStepHeading = stepHeading.trim() || "entry";

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
    <ApplicationFieldAppearanceProvider value="garden">
      <div className="space-y-5">
        {entries.map((entry, index) => {
          const header = entryHeaderLabel(stepHeading, index);
          return (
            <section
              key={entry.id}
              className="rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 px-4 py-5 sm:px-5"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
                  {header}
                </p>
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    disabled={!canRemoveEntry()}
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-2.5 py-1 text-[12px] font-extrabold transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${G_FOCUS}`}
                    style={{ color: C.error, backgroundColor: "transparent" }}
                    aria-label={`Remove ${header}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Remove
                  </button>
                ) : null}
              </div>

              <div className={APPLICATION_FIELD_GRID_CLASS}>
                {fields.map((field) => {
                  const cellClassName = applicationFieldGridClass(field);
                  const label = <ApplicationFieldLabel field={field} C={C} />;
                  const input = (
                    <ApplicationFieldInput
                      field={field}
                      value={entry.values[field.id] ?? ""}
                      onChange={(value) =>
                        updateEntryValue(entry.id, field.id, value)
                      }
                      disabled={disabled}
                      C={C}
                    />
                  );

                  return fieldUsesDivWrapper(field) ? (
                    <div key={field.id} data-field-id={field.id} className={cellClassName}>
                      {label}
                      {input}
                    </div>
                  ) : (
                    <label key={field.id} data-field-id={field.id} className={cellClassName}>
                      {label}
                      {input}
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}

        {!disabled ? (
          <button
            type="button"
            onClick={() => onChange([...entries, createEmptyEntry()])}
            className={`flex w-full items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 py-2.5 text-[13px] font-extrabold text-[var(--sf-clay-deep)] transition-colors hover:border-solid hover:border-[var(--sf-clay)] hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add another {addStepHeading}
          </button>
        ) : null}
      </div>
    </ApplicationFieldAppearanceProvider>
  );
}