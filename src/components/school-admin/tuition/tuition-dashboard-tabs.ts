import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Receipt,
  Scale,
  Tags,
  Users,
} from "lucide-react";

export type TuitionDashboardTabId =
  | "families"
  | "catalog"
  | "rules"
  | "payment_history"
  | "forms";

export const TUITION_DASHBOARD_TABS: ReadonlyArray<{
  id: TuitionDashboardTabId;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "families", label: "Families", icon: Users },
  { id: "catalog", label: "Rate catalog", icon: Tags },
  { id: "rules", label: "Rules", icon: Scale },
  { id: "payment_history", label: "Payment history", icon: Receipt },
  { id: "forms", label: "Forms", icon: FileText },
];

export const TUITION_DASHBOARD_TAB_ICON_CLASS = "h-3.5 w-3.5 shrink-0";

export const TUITION_DASHBOARD_TABS_WITH_KPI: ReadonlySet<TuitionDashboardTabId> =
  new Set(["families", "catalog", "payment_history"]);

export function tuitionDashboardTabShowsKpi(tab: TuitionDashboardTabId): boolean {
  return TUITION_DASHBOARD_TABS_WITH_KPI.has(tab);
}
