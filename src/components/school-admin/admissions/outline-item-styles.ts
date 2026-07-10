import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export function outlineItemCardStyle(C: AdminThemeTokens, active: boolean) {
  return {
    border: `1px solid ${active ? C.accent : C.border}`,
    backgroundColor: active ? C.accentLight : C.surface,
  };
}
