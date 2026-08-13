export const TUITION_ADJUSTMENT_RULES_UI_ENABLED = false;

export const TUITION_RULES_TABS = [
  { id: "late_fees", label: "Late fees" },
  { id: "adjustments", label: "Adjustments" },
] as const;

export const VISIBLE_TUITION_RULES_TABS = TUITION_RULES_TABS.filter(
  (tab) => tab.id !== "adjustments" || TUITION_ADJUSTMENT_RULES_UI_ENABLED,
);

export type TuitionRulesTabId = (typeof TUITION_RULES_TABS)[number]["id"];

export const DEFAULT_TUITION_RULES_TAB: TuitionRulesTabId = "late_fees";
