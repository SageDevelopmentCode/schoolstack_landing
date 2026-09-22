"use client";

import { rootedMeadowsParentDemoConfig } from "@/data/school-demos/rootedmeadows-parent-demo";
import SchoolParentDemoShell, {
  type ParentDemoNavTab,
} from "@/components/demo/shared/SchoolParentDemoShell";

export type NavTab = ParentDemoNavTab;

export {
  RootedMeadowsParentMessagesMobilePreview,
  RootedMeadowsParentBillingMobilePreview,
} from "@/components/demo/rootedmeadows/RootedMeadowsParentDashboardLegacy";

export default function RootedMeadowsParentDashboardDemo({
  initialTab = "home",
  disableTour = true,
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
      config={rootedMeadowsParentDemoConfig}
      initialTab={initialTab}
      disableTour={disableTour}
      hideNav={hideNav}
      onMount={onMount}
    />
  );
}
