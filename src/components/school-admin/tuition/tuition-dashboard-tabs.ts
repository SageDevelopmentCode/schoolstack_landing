export type TuitionDashboardTabId = "families" | "catalog" | "rules" | "payment_history";

export const TUITION_DASHBOARD_TABS: ReadonlyArray<{
  id: TuitionDashboardTabId;
  label: string;
}> = [
  { id: "families", label: "Families" },
  { id: "catalog", label: "Rate catalog" },
  { id: "rules", label: "Rules" },
  { id: "payment_history", label: "Payment history" },
];
