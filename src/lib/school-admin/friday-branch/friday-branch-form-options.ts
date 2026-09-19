import type { CSSProperties } from "react";
import type { CustomSelectOption } from "@/components/ui/CustomSelect";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export const FRIDAY_BRANCH_FIELD_LABEL_CLASS =
  "mb-1 block text-[10px] font-extrabold uppercase tracking-[0.08em]";

export const FRIDAY_BRANCH_FIELD_INPUT_CLASS =
  "w-full rounded-[9px] border px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#315E4F]/20";

export function fridayBranchFieldInputStyle(
  theme: ParentThemeTokens,
  C: AdminThemeTokens,
): CSSProperties {
  return {
    fontFamily: theme.fontBody,
    borderColor: C.inputBorder,
    color: C.textPrimary,
  };
}

export function fridayBranchSelectOptions(values: string[]): CustomSelectOption[] {
  return values.map((value) => ({ value, label: value }));
}
