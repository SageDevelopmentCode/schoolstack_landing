import type { LucideIcon } from "lucide-react";
import { Activity, BookOpen, Compass, Sun } from "lucide-react";

export type DashboardTabId = "today" | "journey" | "activity" | "guides";

export const DASHBOARD_TAB_ICON_CLASS = "h-3.5 w-3.5 shrink-0";

export const DASHBOARD_TABS: ReadonlyArray<{
  id: DashboardTabId;
  label: string;
  panelLabel: string;
  icon: LucideIcon;
}> = [
  {
    id: "today",
    label: "Today",
    panelLabel: "Today's focus and metrics",
    icon: Sun,
  },
  {
    id: "journey",
    label: "Journey",
    panelLabel: "Family journey shortcuts by stage",
    icon: Compass,
  },
  {
    id: "activity",
    label: "Activity",
    panelLabel: "Recent activity and quick actions",
    icon: Activity,
  },
  {
    id: "guides",
    label: "Guides",
    panelLabel: "Announcements and how-to guides",
    icon: BookOpen,
  },
];

export function parseDashboardTab(value: string | null): DashboardTabId {
  if (value === "journey" || value === "activity" || value === "guides") {
    return value;
  }
  return "today";
}
