"use client";

import type { SchoolParentDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import { luffLearningParentDemoConfig } from "@/data/school-demos/luff-learning-parent-demo";
import SchoolParentDemoShell, {
  type ParentDemoNavTab,
} from "@/components/demo/shared/SchoolParentDemoShell";
import { useShowcaseDesktopEmbed } from "@/components/demo/shared/showcase-desktop-embed";

export type NavTab = ParentDemoNavTab;

export default function ParentDashboardDemo({
  initialTab = "home",
  disableTour = false,
  hideNav = false,
  onMount,
  config = luffLearningParentDemoConfig,
}: {
  initialTab?: NavTab;
  disableTour?: boolean;
  hideNav?: boolean;
  onMount?: () => void;
  /** Brand for the demo. Defaults to the home page's Luff Learning demo. */
  config?: SchoolParentDemoConfig;
}) {
  const desktopEmbed = useShowcaseDesktopEmbed();

  return (
    <SchoolParentDemoShell
      config={config}
      initialTab={initialTab}
      disableTour={disableTour}
      hideNav={hideNav}
      desktopEmbed={desktopEmbed}
      onMount={onMount}
    />
  );
}
