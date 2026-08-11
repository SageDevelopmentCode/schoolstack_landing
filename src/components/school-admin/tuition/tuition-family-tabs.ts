export const TUITION_FAMILY_TABS = [
  { id: "assignments", label: "Assignments" },
  { id: "balance", label: "Balance" },
  { id: "autopay", label: "Autopay" },
  { id: "schedule", label: "Schedule" },
  { id: "payments", label: "Payment history" },
] as const;

export type TuitionFamilyTabId = (typeof TUITION_FAMILY_TABS)[number]["id"];

export const DEFAULT_TUITION_FAMILY_TAB: TuitionFamilyTabId = "schedule";
