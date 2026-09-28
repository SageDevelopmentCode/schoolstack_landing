import {
  DEMO_REQUEST_ROLE_OPTIONS,
  type DemoRequestRoleId,
} from "@/lib/demo-request-roles";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type GetStartedRoleChoicesProps = {
  theme: ParentThemeTokens;
  value: DemoRequestRoleId | "";
  onChange: (role: DemoRequestRoleId) => void;
  hasError?: boolean;
};

export default function GetStartedRoleChoices({
  theme,
  value,
  onChange,
  hasError = false,
}: GetStartedRoleChoicesProps) {
  return (
    <div>
      <p
        className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        Where are you today?
      </p>
      <div
        className="rounded-[14px]"
        style={{
          outline: hasError ? `2px solid ${theme.alert}40` : undefined,
        }}
      >
        <div className="flex flex-col gap-2.5">
          {DEMO_REQUEST_ROLE_OPTIONS.map((option) => {
            const selected = value === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                className="w-full text-left px-4 py-3.5 text-[14px] font-semibold transition-all duration-150 cursor-pointer"
                style={{
                  fontFamily: theme.fontBody,
                  borderRadius: theme.radiusButton,
                  border: `1.5px solid ${selected ? theme.primary : theme.line}`,
                  backgroundColor: selected ? theme.primaryLight : theme.white,
                  color: selected ? theme.primary : theme.ink,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
