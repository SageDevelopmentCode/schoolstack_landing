"use client";

import type { CSSProperties } from "react";
import type { ApplicationField } from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationFieldInputProps = {
  field: ApplicationField;
  value: string;
  onChange: (value: string) => void;
  C: AdminThemeTokens;
  disabled?: boolean;
};

function fieldClassName() {
  return "w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2";
}

export default function ApplicationFieldInput({
  field,
  value,
  onChange,
  C,
  disabled = false,
}: ApplicationFieldInputProps) {
  const style = {
    borderColor: C.border,
    color: disabled ? C.textTertiary : C.textPrimary,
    backgroundColor: disabled ? C.input : "#FFFFFF",
  } as const;

  const focusRing = { "--tw-ring-color": `${C.accent}40` } as CSSProperties;

  if (field.type === "textarea") {
    return (
      <textarea
        id={field.id}
        rows={field.rows ?? 3}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${fieldClassName()} resize-y min-h-[88px]`}
        style={{ ...style, ...focusRing }}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        id={field.id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={fieldClassName()}
        style={{ ...style, ...focusRing }}
      >
        <option value="">Select...</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="flex flex-wrap gap-4">
        {field.options?.map((option) => (
          <label
            key={option.value}
            className="inline-flex items-center gap-2 text-sm"
            style={{ color: C.textPrimary }}
          >
            <input
              type="radio"
              name={field.id}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="h-4 w-4"
              style={{ accentColor: C.accent }}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="inline-flex items-center gap-2 text-sm" style={{ color: C.textPrimary }}>
        <input
          id={field.id}
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "")}
          disabled={disabled}
          className="h-4 w-4 rounded"
          style={{ accentColor: C.accent }}
        />
        <span>{field.helpText ?? field.label}</span>
      </label>
    );
  }

  if (field.type === "file") {
    return (
      <div>
        <input
          id={field.id}
          type="file"
          disabled={disabled}
          className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:px-3 file:py-2 file:text-sm file:font-medium"
          style={{ color: C.textSecondary }}
        />
        {field.helpText ? (
          <p className="mt-1.5 text-xs" style={{ color: C.textSecondary }}>
            {field.helpText}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <input
      id={field.id}
      type={field.type}
      placeholder={field.placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={fieldClassName()}
      style={{ ...style, ...focusRing }}
    />
  );
}
