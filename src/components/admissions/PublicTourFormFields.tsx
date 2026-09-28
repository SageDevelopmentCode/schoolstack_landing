"use client";

import type {
  PublicTourChildEntry,
  PublicTourFieldDefinition,
} from "@/lib/admissions/public-tour-settings";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatPhoneNumberInput } from "@/lib/phone-format";

type PublicTourFormFieldsProps = {
  fields: PublicTourFieldDefinition[];
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  disabled?: boolean;
};

function inputClassName(): string {
  return "mt-2 w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[color:var(--parent-primary)]/25";
}

function inputStyle(theme: ParentThemeTokens): React.CSSProperties {
  return {
    borderColor: theme.line,
    backgroundColor: theme.white,
    color: theme.ink,
  };
}

function FieldBlock({
  theme,
  label,
  required,
  helpText,
  htmlFor,
  children,
}: {
  theme: ParentThemeTokens;
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
        className="text-[13px] font-bold"
        style={{ color: theme.ink }}
      >
        {label}
        {required ? (
          <span style={{ color: theme.muted }} aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {helpText ? (
        <p className="mt-1 text-xs leading-relaxed" style={{ color: theme.muted }}>
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
  const { theme } = useParentTheme();
  const styles = inputStyle(theme);

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
              theme={theme}
              label={field.label}
              required={field.required}
              helpText={field.helpText}
            >
              <div
                className="mt-3 space-y-3 rounded-[12px] border p-4"
                style={{
                  borderColor: theme.line,
                  backgroundColor: theme.cream,
                }}
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
                      className={`${inputClassName().replace("mt-2", "mt-0")} min-w-0`}
                      style={styles}
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
                      className={`${inputClassName().replace("mt-2", "mt-0")} min-w-0`}
                      style={styles}
                    />
                  </div>
                ))}
                <ParentButton
                  theme={theme}
                  type="button"
                  variant="soft"
                  disabled={disabled}
                  onClick={() =>
                    setField(field.id, [...children, { name: "", gradeAttending: "" }])
                  }
                >
                  + Add child
                </ParentButton>
              </div>
            </FieldBlock>
          );
        }

        if (field.type === "textarea") {
          const fieldId = `public-tour-${field.id}`;
          return (
            <FieldBlock
              key={field.id}
              theme={theme}
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
                className={`${inputClassName()} resize-y`}
                style={styles}
              />
            </FieldBlock>
          );
        }

        if (field.type === "select" && field.options?.length) {
          const fieldId = `public-tour-${field.id}`;
          return (
            <FieldBlock
              key={field.id}
              theme={theme}
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
                className={inputClassName()}
                style={styles}
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
          return (
            <label
              key={field.id}
              htmlFor={fieldId}
              className="flex cursor-pointer items-start gap-3 rounded-[10px] border px-3 py-3"
              style={{ borderColor: theme.line, backgroundColor: theme.white }}
            >
              <input
                id={fieldId}
                type="checkbox"
                disabled={disabled}
                checked={values[field.id] === true}
                onChange={(event) => setField(field.id, event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded"
              />
              <span className="text-[13px] font-bold" style={{ color: theme.ink }}>
                {field.label}
                {field.required ? (
                  <span style={{ color: theme.muted }} aria-hidden>
                    {" "}
                    *
                  </span>
                ) : null}
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
              theme={theme}
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
                className={inputClassName()}
                style={styles}
              />
            </FieldBlock>
          );
        }

        const inputType = field.type === "email" ? "email" : "text";
        const fieldId = `public-tour-${field.id}`;

        return (
          <FieldBlock
            key={field.id}
            theme={theme}
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
              className={inputClassName()}
              style={styles}
            />
          </FieldBlock>
        );
      })}
    </div>
  );
}
