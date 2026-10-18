import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type GetStartedStoryTextFieldProps = {
  theme: ParentThemeTokens;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  variant?: "default" | "intro";
  optionalHint?: ReactNode;
  helperText?: string;
  errorText?: string;
  id?: string;
  autoComplete?: string;
  maxLength?: number;
  className?: string;
};

export default function GetStartedStoryTextField({
  theme,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  hasError = false,
  variant = "default",
  optionalHint,
  helperText,
  errorText,
  id,
  autoComplete,
  maxLength,
  className = "",
}: GetStartedStoryTextFieldProps) {
  const isIntro = variant === "intro";
  const borderColor = hasError ? "#B5594A" : theme.line;
  const focusOutline = hasError ? "#B5594A" : theme.primary;

  if (isIntro) {
    return (
      <div className={className}>
        <label
          htmlFor={id}
          className="block text-[12px] font-bold leading-snug mb-2.5"
          style={{ color: theme.ink, fontFamily: theme.fontBody }}
        >
          {label}
          {optionalHint ? (
            <span className="text-[11px] font-normal text-[#849087]"> {optionalHint}</span>
          ) : null}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-invalid={hasError}
          aria-describedby={
            [helperText && id ? `${id}-helper` : null, errorText && id ? `${id}-error` : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className="w-full rounded-[12px] border px-[15px] py-3.5 text-[13px] leading-normal outline-none transition-[border-color] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            fontFamily: theme.fontBody,
            color: theme.ink,
            backgroundColor: theme.white,
            borderColor,
            outlineColor: focusOutline,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = focusOutline;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = borderColor;
          }}
        />
        {helperText ? (
          <p
            id={id ? `${id}-helper` : undefined}
            className="mt-2 text-[11px] leading-[1.8]"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            {helperText}
          </p>
        ) : null}
        {hasError && errorText ? (
          <p
            id={id ? `${id}-error` : undefined}
            className="mt-1.5 text-[11px] leading-snug"
            style={{ color: "#B5594A", fontFamily: theme.fontBody }}
          >
            {errorText}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        className="text-[13px] font-semibold"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full px-4 text-[14px] outline-none transition-colors duration-150 focus:ring-2"
        style={{
          fontFamily: theme.fontBody,
          color: theme.ink,
          backgroundColor: theme.white,
          borderRadius: theme.radiusButton,
          border: `1px solid ${hasError ? theme.alert : theme.line}`,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = hasError ? theme.alert : theme.primary;
          e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primarySoft}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = hasError ? theme.alert : theme.line;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

type GetStartedIntroTextAreaProps = {
  theme: ParentThemeTokens;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  maxLength?: number;
};

export function GetStartedIntroTextArea({
  theme,
  label,
  value,
  onChange,
  placeholder,
  id,
  maxLength,
}: GetStartedIntroTextAreaProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] mb-2"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full min-h-[94px] resize-y rounded-[12px] border px-[15px] py-3.5 text-[13px] leading-normal outline-none transition-[border-color] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          fontFamily: theme.fontBody,
          color: theme.ink,
          backgroundColor: theme.white,
          borderColor: theme.line,
          outlineColor: theme.primary,
        }}
      />
    </div>
  );
}
