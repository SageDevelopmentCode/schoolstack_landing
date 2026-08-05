export const TUITION_RULES_TABS = [
  { id: "late_fees", label: "Late fees" },
  { id: "adjustments", label: "Adjustments" },
] as const;

export type TuitionRulesTabId = (typeof TUITION_RULES_TABS)[number]["id"];

export const DEFAULT_TUITION_RULES_TAB: TuitionRulesTabId = "late_fees";
