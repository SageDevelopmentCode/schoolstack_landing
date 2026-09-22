"use client";

import { luffLearningParentDemoConfig } from "@/data/school-demos/luff-learning-parent-demo";
import SchoolParentDemoShell, {
  type ParentDemoNavTab,
} from "@/components/demo/shared/SchoolParentDemoShell";

export type NavTab = ParentDemoNavTab;

export default function ParentDashboardDemo({
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
      config={luffLearningParentDemoConfig}
      initialTab={initialTab}
      disableTour={disableTour}
      hideNav={hideNav}
      onMount={onMount}
    />
  );
}
