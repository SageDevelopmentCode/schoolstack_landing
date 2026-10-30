"use client";

import type {
  PublicTourChildEntry,
  PublicTourFieldDefinition,
} from "@/lib/admissions/public-tour-settings";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { formatPhoneNumberInput } from "@/lib/phone-format";

type AdminManualGuestRegistrantFormProps = {
  C: AdminThemeTokens;
  fields: PublicTourFieldDefinition[];
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  disabled?: boolean;
};

function FieldBlock({
  C,
  label,
  required,
  helpText,
  htmlFor,
  children,
}: {
  C: AdminThemeTokens;
  label: string;
  required?: boolean;
  helpText?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-medium"
        style={{ color: C.textPrimary }}
      >
        {label}
        {required ? (
          <span style={{ color: C.textTertiary }} aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {helpText ? (
        <p className="mt-1 text-xs leading-relaxed" style={{ color: C.textSecondary }}>
          {helpText}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export default function AdminManualGuestRegistrantForm({
  C,
  fields,
  values,
  onChange,
  disabled = false,
}: AdminManualGuestRegistrantFormProps) {
  const inputClassName =
    "mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2";
  const inputStyle: React.CSSProperties = {
    borderColor: C.border,
    backgroundColor: "#FFFFFF",
    color: C.textPrimary,
  };

  function setField(id: string, value: unknown) {
    onChange({ ...values, [id]: value });
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        if (field.type === "children_repeat") {
          const children = Array.isArray(values[field.id])
            ? (values[field.id] as PublicTourChildEntry[])
            : [];
          return (
            <FieldBlock
              key={field.id}
              C={C}
              label={field.label}
              required={field.required}
              helpText={field.helpText}
            >
              <div
                className="mt-2 space-y-3 rounded-md border p-3"
                style={{ borderColor: C.border, backgroundColor: C.bg }}
              >
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
                      onChange={(event) => {
                        const next = [...children];
                        next[index] = { ...next[index], name: event.target.value };
                        setField(field.id, next);
                      }}
                      className={`${inputClassName.replace("mt-2", "mt-0")} min-w-0`}
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      disabled={disabled}
                      value={child.gradeAttending ?? ""}
                      placeholder="Grade attending"
                      onChange={(event) => {
                        const next = [...children];
                        next[index] = {
                          ...next[index],
                          gradeAttending: event.target.value,
                        };
                        setField(field.id, next);
                      }}
                      className={`${inputClassName.replace("mt-2", "mt-0")} min-w-0`}
                      style={inputStyle}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    setField(field.id, [...children, { name: "", gradeAttending: "" }])
                  }
                  className="rounded-md px-2.5 py-1.5 text-xs font-medium"
                  style={getAdminButtonStyle(C, "secondary")}
                >
                  + Add child
                </button>
              </div>
            </FieldBlock>
          );
        }

        if (field.type === "textarea") {
          const fieldId = `admin-guest-${field.id}`;
          return (
            <FieldBlock
              key={field.id}
              C={C}
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
                className={`${inputClassName} resize-y`}
                style={inputStyle}
              />
            </FieldBlock>
          );
        }

        if (field.type === "select" && field.options?.length) {
          const fieldId = `admin-guest-${field.id}`;
          return (
            <FieldBlock
              key={field.id}
              C={C}
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
                className={inputClassName}
                style={inputStyle}
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
          const fieldId = `admin-guest-${field.id}`;
          return (
            <label
              key={field.id}
              htmlFor={fieldId}
              className="flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3"
              style={{ borderColor: C.border, backgroundColor: C.bg }}
            >
              <input
                id={fieldId}
                type="checkbox"
                disabled={disabled}
                checked={values[field.id] === true}
                onChange={(event) => setField(field.id, event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded"
              />
              <span className="text-[13px] font-medium" style={{ color: C.textPrimary }}>
                {field.label}
                {field.required ? (
                  <span style={{ color: C.textTertiary }} aria-hidden>
                    {" "}
                    *
                  </span>
                ) : null}
              </span>
            </label>
          );
        }

        if (field.type === "phone") {
          const fieldId = `admin-guest-${field.id}`;
          const phoneValue =
            typeof values[field.id] === "string" ? (values[field.id] as string) : "";
          return (
            <FieldBlock
              key={field.id}
              C={C}
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
                disabled={disabled}
                value={formatPhoneNumberInput(phoneValue)}
                onChange={(event) =>
                  setField(field.id, formatPhoneNumberInput(event.target.value))
                }
                className={inputClassName}
                style={inputStyle}
              />
            </FieldBlock>
          );
        }

        const inputType = field.type === "email" ? "email" : "text";
        const fieldId = `admin-guest-${field.id}`;

        return (
          <FieldBlock
            key={field.id}
            C={C}
            label={field.label}
            required={field.required}
            helpText={field.helpText}
            htmlFor={fieldId}
          >
            <input
              id={fieldId}
              type={inputType}
              disabled={disabled}
              value={
                typeof values[field.id] === "string" ? (values[field.id] as string) : ""
              }
              onChange={(event) => setField(field.id, event.target.value)}
              className={inputClassName}
              style={inputStyle}
            />
          </FieldBlock>
        );
      })}
    </div>
  );
}
