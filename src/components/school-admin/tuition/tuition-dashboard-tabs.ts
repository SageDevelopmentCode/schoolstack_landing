export type TuitionDashboardTabId = "families" | "catalog" | "rules";

export const TUITION_DASHBOARD_TABS: ReadonlyArray<{
  id: TuitionDashboardTabId;
  label: string;
}> = [
  { id: "families", label: "Families" },
  { id: "catalog", label: "Rate catalog" },
  { id: "rules", label: "Rules" },
];
