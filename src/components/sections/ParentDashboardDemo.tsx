"use client";

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
}: {
  initialTab?: NavTab;
  disableTour?: boolean;
  hideNav?: boolean;
  onMount?: () => void;
}) {
  const desktopEmbed = useShowcaseDesktopEmbed();

  return (
    <SchoolParentDemoShell
      config={luffLearningParentDemoConfig}
      initialTab={initialTab}
      disableTour={disableTour}
      hideNav={hideNav}
      desktopEmbed={desktopEmbed}
      onMount={onMount}
    />
  );
}
