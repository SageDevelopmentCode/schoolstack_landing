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
  /** "garden" needs a `.sf-garden` ancestor; only applies to `variant="intro"`. */
  appearance?: "story" | "garden";
};

/** Garden form-field classes (literal so Tailwind can see them). */
export const GARDEN_FIELD = {
  label: "mb-2 block text-sm font-extrabold leading-snug text-[var(--sf-ink)]",
  optional: "text-xs font-semibold text-[var(--sf-soft)]",
  input:
    "w-full rounded-2xl border-2 bg-white px-4 py-3.5 text-[15px] leading-normal text-[var(--sf-ink)] outline-none transition-colors placeholder:text-[var(--sf-ink)]/40 hover:border-[var(--sf-ink)]/40 focus-visible:border-[var(--sf-ink)] focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/25",
  inputOk: "border-[var(--sf-ink)]/15",
  inputError: "border-[var(--sf-clay-deep)]",
  helper: "mt-2 text-xs leading-relaxed text-[var(--sf-soft)]",
  error: "mt-2 text-xs font-bold leading-snug text-[var(--sf-clay-deep)]",
} as const;

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
  appearance = "story",
}: GetStartedStoryTextFieldProps) {
  const isIntro = variant === "intro";
  const describedBy =
    [helperText && id ? `${id}-helper` : null, hasError && errorText && id ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  if (isIntro && appearance === "garden") {
    return (
      <div className={className}>
        <label htmlFor={id} className={GARDEN_FIELD.label}>
          {label}
          {optionalHint ? <span className={GARDEN_FIELD.optional}> {optionalHint}</span> : null}
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
          aria-describedby={describedBy}
          className={`${GARDEN_FIELD.input} ${hasError ? GARDEN_FIELD.inputError : GARDEN_FIELD.inputOk}`}
        />
        {helperText ? (
          <p id={id ? `${id}-helper` : undefined} className={GARDEN_FIELD.helper}>
            {helperText}
          </p>
        ) : null}
        {hasError && errorText ? (
          <p id={id ? `${id}-error` : undefined} className={GARDEN_FIELD.error} role="alert">
            {errorText}
          </p>
        ) : null}
      </div>
    );
  }
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
        htmlFor={id}
        className="text-[13px] font-semibold"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
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
      {helperText ? (
        <p
          id={id ? `${id}-helper` : undefined}
          className="text-[11px] leading-[1.8]"
          style={{ color: theme.muted, fontFamily: theme.fontBody }}
        >
          {helperText}
        </p>
      ) : null}
      {hasError && errorText ? (
        <p
          id={id ? `${id}-error` : undefined}
          className="text-[11px] leading-snug"
          style={{ color: "#B5594A", fontFamily: theme.fontBody }}
        >
          {errorText}
        </p>
      ) : null}
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
  appearance?: "story" | "garden";
};

export function GetStartedIntroTextArea({
  theme,
  label,
  value,
  onChange,
  placeholder,
  id,
  maxLength,
  appearance = "story",
}: GetStartedIntroTextAreaProps) {
  if (appearance === "garden") {
    return (
      <div>
        <label htmlFor={id} className={GARDEN_FIELD.label}>
          {label}
        </label>
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`${GARDEN_FIELD.input} ${GARDEN_FIELD.inputOk} min-h-[110px] resize-y`}
        />
      </div>
    );
  }
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
