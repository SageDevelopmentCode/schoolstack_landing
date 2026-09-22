"use client";

import { sagefieldParentDemoConfig } from "@/data/school-demos/sagefield-parent-demo";
import SchoolParentDemoShell, {
  type ParentDemoNavTab,
} from "@/components/demo/shared/SchoolParentDemoShell";

export type NavTab = ParentDemoNavTab;

export default function SagefieldParentDashboardDemo({
  initialTab = "home",
  disableTour = false,
  hideNav = false,
  onMount,
}: {
  initialTab?: NavTab;
  disableTour?: boolean;
  hideNav?: boolean;
  onMount?: () => void;
}) {
  return (
    <SchoolParentDemoShell
      config={sagefieldParentDemoConfig}
      initialTab={initialTab}
      disableTour={disableTour}
      hideNav={hideNav}
      onMount={onMount}
    />
  );
}
