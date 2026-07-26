import type { CSSProperties } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  guardianRoleLabelText,
  type GuardianRoleLabel,
} from "@/lib/admissions/guardian-role-label";

type GuardianRoleBadgeProps = {
  role: GuardianRoleLabel;
  C?: AdminThemeTokens;
  className?: string;
};

function resolveBadgeStyle(
  role: GuardianRoleLabel,
  C?: AdminThemeTokens,
): CSSProperties {
  if (role === "primary") {
    return C
      ? { backgroundColor: C.accentLight, color: C.accentDark }
      : {
          backgroundColor: "var(--admin-accent-light, #ede9fe)",
          color: "var(--admin-accent-dark, #5b21b6)",
        };
  }

  return C
    ? {
        backgroundColor: C.bg,
        color: C.textTertiary,
        border: `1px solid ${C.border}`,
      }
    : {
        backgroundColor: "var(--admin-bg, #f9fafb)",
        color: "var(--admin-muted, #6b7280)",
        border: "1px solid var(--admin-border, #e5e7eb)",
      };
}

export default function GuardianRoleBadge({
  role,
  C,
  className = "",
}: GuardianRoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
      style={resolveBadgeStyle(role, C)}
    >
      {guardianRoleLabelText(role)}
    </span>
  );
}
