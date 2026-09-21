"use client";

import type { SchoolParentDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import SchoolParentDemoShell, {
  type ParentDemoNavTab,
} from "@/components/demo/shared/SchoolParentDemoShell";

export type NavTab = ParentDemoNavTab;

export default function SchoolParentDashboardDemo({
  config,
  initialTab = "home",
  disableTour = true,
  hideNav = false,
  onMount,
}: {
  config: SchoolParentDemoConfig;
  initialTab?: NavTab;
  disableTour?: boolean;
  hideNav?: boolean;
  onMount?: () => void;
}) {
  return (
    <SchoolParentDemoShell
      config={config}
      initialTab={initialTab}
      disableTour={disableTour}
      hideNav={hideNav}
      onMount={onMount}
    />
  );
}
