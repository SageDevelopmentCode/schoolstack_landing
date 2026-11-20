"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import type {
  PublicTourChildEntry,
  PublicTourFieldDefinition,
} from "@/lib/admissions/public-tour-settings";
import { G_FOCUS, G_INPUT, G_LABEL, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import { formatPhoneNumberInput } from "@/lib/phone-format";

type PublicTourFormFieldsProps = {
  fields: PublicTourFieldDefinition[];
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  disabled?: boolean;
};

function RequiredMark({ required }: { required?: boolean }) {
  if (!required) return null;
  return (
    <span className="text-[var(--sf-soft)]" aria-hidden>
      {" "}
      *
    </span>
  );
}

function FieldBlock({
  label,
  required,
  helpText,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  helpText?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      {htmlFor ? (
        <label htmlFor={htmlFor} className={G_LABEL}>
          {label}
          <RequiredMark required={required} />
        </label>
      ) : (
        <p className={`m-0 ${G_LABEL}`}>
          {label}
          <RequiredMark required={required} />
        </p>
      )}
      {helpText ? (
        <p className="m-0 -mt-0.5 mb-2 text-[13px] font-semibold leading-relaxed text-[var(--sf-soft)]">
          {helpText}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export default function PublicTourFormFields({
  fields,
  values,
  onChange,
  disabled = false,
}: PublicTourFormFieldsProps) {
  function setField(id: string, value: unknown) {
    onChange({ ...values, [id]: value });
  }

  return (
    <div className="space-y-5">
      {fields.map((field) => {
        if (field.type === "children_repeat") {
          const children = Array.isArray(values[field.id])
            ? (values[field.id] as PublicTourChildEntry[])
            : [];
          return (
            <FieldBlock
              key={field.id}
              label={field.label}
              required={field.required}
              helpText={field.helpText}
            >
              <div className="space-y-3 rounded-[18px] border-[1.5px] border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-accent-wash)] p-3 sm:p-4">
                {children.map((child, index) => (
                  <div
                    key={`${field.id}-${index}`}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  >
                    <input
                      type="text"
                      disabled={disabled}
                      value={child.name ?? ""}
                      placeholder="Child name"
                      aria-label={`Child ${index + 1} name`}
                      onChange={(event) => {
                        const next = [...children];
                        next[index] = { ...next[index], name: event.target.value };
                        setField(field.id, next);
                      }}
                      className={`${G_INPUT} min-w-0`}
                    />
                    <input
                      type="text"
                      disabled={disabled}
                      value={child.gradeAttending ?? ""}
                      placeholder="Grade attending"
                      aria-label={`Child ${index + 1} grade attending`}
                      onChange={(event) => {
                        const next = [...children];
                        next[index] = {
                          ...next[index],
                          gradeAttending: event.target.value,
                        };
                        setField(field.id, next);
                      }}
                      className={`${G_INPUT} min-w-0`}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    setField(field.id, [...children, { name: "", gradeAttending: "" }])
                  }
                  className={gBtnOutlineSm}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                  Add child
                </button>
              </div>
            </FieldBlock>
          );
        }

        if (field.type === "textarea") {
          const fieldId = `public-tour-${field.id}`;
          return (
            <FieldBlock
              key={field.id}
              label={field.label}
              required={field.required}
              helpText={field.helpText}
              htmlFor={fieldId}
            >
              <textarea
                id={fieldId}
                disabled={disabled}
                value={
                  typeof values[field.id] === "string" ? (values[field.id] as string) : ""
                }
                onChange={(event) => setField(field.id, event.target.value)}
                rows={3}
                className={`${G_INPUT} resize-y`}
              />
            </FieldBlock>
          );
        }

        if (field.type === "select" && field.options?.length) {
          const fieldId = `public-tour-${field.id}`;
          return (
            <FieldBlock
              key={field.id}
              label={field.label}
              required={field.required}
              helpText={field.helpText}
              htmlFor={fieldId}
            >
              <select
                id={fieldId}
                disabled={disabled}
                value={
                  typeof values[field.id] === "string" ? (values[field.id] as string) : ""
                }
                onChange={(event) => setField(field.id, event.target.value)}
                className={`${G_INPUT} cursor-pointer`}
              >
                <option value="">Select…</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FieldBlock>
          );
        }

        if (field.type === "checkbox") {
          const fieldId = `public-tour-${field.id}`;
          const checked = values[field.id] === true;
          return (
            <label
              key={field.id}
              htmlFor={fieldId}
              className={`flex cursor-pointer items-start gap-3 rounded-[14px] border-2 bg-white px-3.5 py-3 transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[var(--sf-clay)]/20 ${
                checked
                  ? "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]"
                  : "border-[var(--sf-ink)]/15 hover:border-[var(--sf-ink)]/30"
              }`}
            >
              <input
                id={fieldId}
                type="checkbox"
                disabled={disabled}
                checked={checked}
                onChange={(event) => setField(field.id, event.target.checked)}
                className={`mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded accent-[var(--sf-clay)] ${G_FOCUS}`}
              />
              <span className="text-[14px] font-bold text-[var(--sf-ink)]">
                {field.label}
                <RequiredMark required={field.required} />
              </span>
            </label>
          );
        }

        if (field.type === "phone") {
          const fieldId = `public-tour-${field.id}`;
          const phoneValue =
            typeof values[field.id] === "string" ? (values[field.id] as string) : "";
          return (
            <FieldBlock
              key={field.id}
              label={field.label}
              required={field.required}
              helpText={field.helpText}
              htmlFor={fieldId}
            >
              <input
                id={fieldId}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(562) - 332 - 4687"
                disabled={disabled}
                value={formatPhoneNumberInput(phoneValue)}
                onChange={(event) =>
                  setField(field.id, formatPhoneNumberInput(event.target.value))
                }
                className={G_INPUT}
              />
            </FieldBlock>
          );
        }

        const inputType = field.type === "email" ? "email" : "text";
        const fieldId = `public-tour-${field.id}`;

        return (
          <FieldBlock
            key={field.id}
            label={field.label}
            required={field.required}
            helpText={field.helpText}
            htmlFor={fieldId}
          >
            <input
              id={fieldId}
              type={inputType}
              autoComplete={field.type === "email" ? "email" : undefined}
              disabled={disabled}
              value={
                typeof values[field.id] === "string" ? (values[field.id] as string) : ""
              }
              onChange={(event) => setField(field.id, event.target.value)}
              className={G_INPUT}
            />
          </FieldBlock>
        );
      })}
    </div>
  );
}
