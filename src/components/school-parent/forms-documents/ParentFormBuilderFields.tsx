"use client";

import TypedSignatureField, {
  parseStoredSignerName,
} from "@/components/admissions/TypedSignatureField";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { TeacherFormField } from "@/lib/school-teacher/forms-documents/types";

type ParentFormBuilderFieldsProps = {
  fields: TeacherFormField[];
  values: Record<string, string | boolean | string[]>;
  onChange: (fieldId: string, value: string | boolean | string[]) => void;
  disabled?: boolean;
  storedResponses?: Record<string, unknown> | null;
};

function readStoredFieldValues(
  storedResponses?: Record<string, unknown> | null,
): Record<string, string | boolean | string[]> {
  const fields = storedResponses?.fields;
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return {};
  }
  return fields as Record<string, string | boolean | string[]>;
}

export default function ParentFormBuilderFields({
  fields,
  values,
  onChange,
  disabled = false,
  storedResponses,
}: ParentFormBuilderFieldsProps) {
  const { theme, adminCompat } = useParentTheme();
  const storedFieldValues = readStoredFieldValues(storedResponses);

  return (
    <div className="space-y-5">
      {fields.map((field) => {
        const value = values[field.id] ?? storedFieldValues[field.id];

        if (field.type === "signature") {
          const signatureValue =
            typeof value === "string"
              ? value
              : parseStoredSignerName(storedResponses ?? null);
          return (
            <TypedSignatureField
              key={field.id}
              C={adminCompat}
              id={`parent-form-field-${field.id}`}
              value={signatureValue}
              onChange={(next) => onChange(field.id, next)}
              disabled={disabled}
            />
          );
        }

        if (disabled) {
          const displayValue = Array.isArray(value)
            ? value.join(", ")
            : typeof value === "boolean"
              ? value
                ? "Yes"
                : "No"
              : String(value ?? "—");
          return (
            <div key={field.id}>
              <p className="mb-1 text-xs font-medium" style={{ color: theme.muted }}>
                {field.label}
              </p>
              <p className="text-sm" style={{ color: theme.ink }}>{displayValue}</p>
            </div>
          );
        }

        if (field.type === "long_text") {
          return (
            <div key={field.id}>
              <label
                htmlFor={`parent-form-field-${field.id}`}
                className="mb-1.5 block text-xs font-medium"
                style={{ color: theme.muted }}
              >
                {field.label}
                {field.required ? " *" : ""}
              </label>
              <textarea
                id={`parent-form-field-${field.id}`}
                value={typeof value === "string" ? value : ""}
                onChange={(event) => onChange(field.id, event.target.value)}
                rows={4}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: theme.line,
                  backgroundColor: theme.white,
                  color: theme.ink,
                }}
              />
            </div>
          );
        }

        if (field.type === "checkbox") {
          return (
            <label
              key={field.id}
              className="flex items-start gap-2 text-sm"
              style={{ color: theme.ink }}
            >
              <input
                type="checkbox"
                checked={value === true}
                onChange={(event) => onChange(field.id, event.target.checked)}
                className="mt-1"
              />
              <span>
                {field.label}
                {field.required ? " *" : ""}
              </span>
            </label>
          );
        }

        if (field.type === "multiple_choice") {
          const selected = Array.isArray(value) ? value : [];
          const options = field.options ?? [];
          return (
            <div key={field.id}>
              <p className="mb-2 text-xs font-medium" style={{ color: theme.muted }}>
                {field.label}
                {field.required ? " *" : ""}
              </p>
              <div className="space-y-2">
                {options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: theme.ink }}
                  >
                    <input
                      type="radio"
                      name={`parent-form-field-${field.id}`}
                      checked={selected.includes(option)}
                      onChange={() => onChange(field.id, [option])}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }

        if (field.type === "date") {
          return (
            <div key={field.id}>
              <label
                htmlFor={`parent-form-field-${field.id}`}
                className="mb-1.5 block text-xs font-medium"
                style={{ color: theme.muted }}
              >
                {field.label}
                {field.required ? " *" : ""}
              </label>
              <input
                id={`parent-form-field-${field.id}`}
                type="date"
                value={typeof value === "string" ? value : ""}
                onChange={(event) => onChange(field.id, event.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: theme.line,
                  backgroundColor: theme.white,
                  color: theme.ink,
                }}
              />
            </div>
          );
        }

        return (
          <div key={field.id}>
            <label
              htmlFor={`parent-form-field-${field.id}`}
              className="mb-1.5 block text-xs font-medium"
              style={{ color: theme.muted }}
            >
              {field.label}
              {field.required ? " *" : ""}
            </label>
            <input
              id={`parent-form-field-${field.id}`}
              type="text"
              value={typeof value === "string" ? value : ""}
              onChange={(event) => onChange(field.id, event.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: theme.line,
                backgroundColor: theme.white,
                color: theme.ink,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
