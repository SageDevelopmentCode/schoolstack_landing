"use client";

import { useId } from "react";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { greatVibes } from "@/lib/fonts";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentFormSignatureFieldProps = {
  theme: ParentThemeTokens;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
};

export default function ParentFormSignatureField({
  theme,
  value,
  onChange,
  onSubmit,
  disabled = false,
  readOnly = false,
}: ParentFormSignatureFieldProps) {
  const inputId = useId();
  const { adminCompat: C } = useParentTheme();
  const trimmedValue = value.trim();
  const previewText = trimmedValue || "Your signature will appear here";
  const isInputDisabled = disabled || readOnly;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-xs font-medium"
        style={{ color: theme.muted }}
      >
        Type your full legal name to sign
      </label>

      <div
        className="mb-3 flex min-h-[48px] flex-col justify-center rounded-md border px-3 py-2"
        style={{
          borderColor: theme.line,
          backgroundColor: theme.white,
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        <p
          className={`${greatVibes.className} break-words text-2xl leading-tight sm:text-3xl`}
          style={{
            color: trimmedValue ? C.accentDark : C.textTertiary,
            letterSpacing: "0.02em",
          }}
        >
          {previewText}
        </p>
      </div>

      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && onSubmit && trimmedValue && !isInputDisabled) {
            event.preventDefault();
            onSubmit();
          }
        }}
        disabled={isInputDisabled}
        placeholder="Full legal name"
        readOnly={readOnly}
        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
        style={{
          borderColor: theme.line,
          backgroundColor: readOnly ? theme.paper : theme.white,
          color: theme.ink,
        }}
      />
    </div>
  );
}
