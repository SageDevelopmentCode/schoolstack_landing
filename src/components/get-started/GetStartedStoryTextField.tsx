import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type GetStartedStoryTextFieldProps = {
  theme: ParentThemeTokens;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
};

export default function GetStartedStoryTextField({
  theme,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  hasError = false,
}: GetStartedStoryTextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
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
          boxShadow: hasError ? undefined : undefined,
          // focus ring via onFocus would need state; use focus-visible in class
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
