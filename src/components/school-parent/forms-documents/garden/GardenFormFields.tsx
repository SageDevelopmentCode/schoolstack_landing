"use client";

import { Check } from "lucide-react";
import { G_INPUT, G_LABEL } from "@/components/school-parent/garden/ui";
import type { TeacherFormField } from "@/lib/school-teacher/forms-documents/types";
import { isBuilderFieldFilled, type ParentFormFieldValues } from "../useParentFormDetail";

type GardenFormFieldsProps = {
  fields: TeacherFormField[];
  values: ParentFormFieldValues;
  onChange: (fieldId: string, value: string | boolean | string[]) => void;
  disabled?: boolean;
  storedResponses?: Record<string, unknown> | null;
  /** Field ids to flag as missing (after the parent tried to sign). */
  invalidIds?: ReadonlySet<string>;
};

export function parentFormFieldDomId(fieldId: string): string {
  return `parent-form-field-${fieldId}`;
}

function readStoredFieldValues(storedResponses?: Record<string, unknown> | null): ParentFormFieldValues {
  const fields = storedResponses?.fields;
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return {};
  return fields as ParentFormFieldValues;
}

function displayValue(value: string | boolean | string[] | undefined): string {
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const text = String(value ?? "").trim();
  return text || "—";
}

function RequiredMark() {
  return (
    <span className="ml-1.5 rounded-full bg-[var(--sf-butter)] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#6b4f00]">
      Required
    </span>
  );
}

function MissingNote({ id }: { id: string }) {
  return (
    <p id={id} className="m-0 mt-1.5 text-[13px] font-extrabold text-[#b42318]">
      This one&apos;s required.
    </p>
  );
}

/**
 * Garden builder-form questions (text, long text, date, single choice,
 * checkbox). Read-only renders the stored answers as a paper list.
 */
export default function GardenFormFields({
  fields,
  values,
  onChange,
  disabled = false,
  storedResponses,
  invalidIds,
}: GardenFormFieldsProps) {
  const stored = readStoredFieldValues(storedResponses);

  if (disabled) {
    return (
      <dl className="sf-paper m-0 flex flex-col divide-y-[1.5px] divide-dashed divide-[var(--sf-ink)]/10 rounded-[18px] px-4">
        {fields.map((field) => (
          <div key={field.id} className="py-3">
            <dt className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[var(--sf-soft)]">{field.label}</dt>
            <dd className="m-0 mt-1 whitespace-pre-wrap text-[15px] font-bold text-[var(--sf-ink)]">
              {displayValue(values[field.id] ?? stored[field.id])}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {fields.map((field, index) => {
        const value = values[field.id] ?? stored[field.id];
        const domId = parentFormFieldDomId(field.id);
        const errorId = `${domId}-error`;
        const missing = Boolean(invalidIds?.has(field.id)) && !isBuilderFieldFilled(field, values);
        const filled = field.required && isBuilderFieldFilled(field, values);
        const number = (
          <span
            aria-hidden="true"
            className={`mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold transition-colors duration-300 ${
              filled
                ? "bg-[var(--sf-forest)] text-white"
                : "bg-[var(--sf-ink)]/[0.07] text-[var(--sf-ink)]/70"
            }`}
          >
            {filled ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
          </span>
        );
        const invalidInput = missing ? "!border-[#b42318]/60" : "";
        const aria = {
          "aria-invalid": missing || undefined,
          "aria-describedby": missing ? errorId : undefined,
          "aria-required": field.required || undefined,
        };

        if (field.type === "checkbox") {
          const checked = value === true;
          return (
            <div key={field.id} data-field-id={field.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-[16px] border-[1.5px] p-3.5 transition-colors duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[var(--sf-clay)]/35 ${
                  checked
                    ? "border-[var(--sf-clay)]/50 bg-[var(--sf-accent-wash)]"
                    : missing
                      ? "border-[#b42318]/50 bg-white"
                      : "border-[var(--sf-ink)]/15 bg-white hover:border-[var(--sf-ink)]/35"
                }`}
              >
                <input
                  id={domId}
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => onChange(field.id, event.target.checked)}
                  className="peer sr-only"
                  {...aria}
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] border-2 transition-colors duration-200 ${
                    checked ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white" : "border-[var(--sf-ink)]/40 bg-white"
                  }`}
                >
                  {checked ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0 flex-1 text-[15px] font-bold leading-snug text-[var(--sf-ink)]">
                  {field.label}
                  {field.required ? <RequiredMark /> : null}
                </span>
              </label>
              {missing ? <MissingNote id={errorId} /> : null}
            </div>
          );
        }

        if (field.type === "multiple_choice") {
          const selected = Array.isArray(value) ? value : [];
          const options = field.options ?? [];
          return (
            <fieldset key={field.id} data-field-id={field.id} className="m-0 min-w-0 border-0 p-0" {...aria}>
              <legend className={`${G_LABEL} flex items-center`}>
                {number}
                {field.label}
                {field.required ? <RequiredMark /> : null}
              </legend>
              <div className="flex flex-wrap gap-2">
                {options.map((option, optionIndex) => {
                  const on = selected.includes(option);
                  return (
                    <label
                      key={option}
                      className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-4 py-2 text-[14px] font-extrabold transition-all duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[var(--sf-clay)]/35 ${
                        on
                          ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
                          : missing
                            ? "border-[#b42318]/50 bg-white text-[var(--sf-ink)]"
                            : "border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/80 hover:border-[var(--sf-ink)]/35"
                      }`}
                    >
                      <input
                        id={optionIndex === 0 ? domId : undefined}
                        type="radio"
                        name={domId}
                        checked={on}
                        onChange={() => onChange(field.id, [option])}
                        className="sr-only"
                      />
                      {on ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : null}
                      {option}
                    </label>
                  );
                })}
              </div>
              {missing ? <MissingNote id={errorId} /> : null}
            </fieldset>
          );
        }

        const label = (
          <label htmlFor={domId} className={`${G_LABEL} flex items-center`}>
            {number}
            {field.label}
            {field.required ? <RequiredMark /> : null}
          </label>
        );

        if (field.type === "long_text") {
          return (
            <div key={field.id} data-field-id={field.id}>
              {label}
              <textarea
                id={domId}
                value={typeof value === "string" ? value : ""}
                onChange={(event) => onChange(field.id, event.target.value)}
                rows={4}
                className={`${G_INPUT} ${invalidInput} resize-y`}
                {...aria}
              />
              {missing ? <MissingNote id={errorId} /> : null}
            </div>
          );
        }

        return (
          <div key={field.id} data-field-id={field.id}>
            {label}
            <input
              id={domId}
              type={field.type === "date" ? "date" : "text"}
              value={typeof value === "string" ? value : ""}
              onChange={(event) => onChange(field.id, event.target.value)}
              className={`${G_INPUT} ${invalidInput} ${field.type === "date" ? "sm:max-w-[16rem]" : ""}`}
              {...aria}
            />
            {missing ? <MissingNote id={errorId} /> : null}
          </div>
        );
      })}
    </div>
  );
}
