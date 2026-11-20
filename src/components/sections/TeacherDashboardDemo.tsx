"use client";

import type { SchoolTeacherDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import { luffLearningTeacherDemoConfig } from "@/data/school-demos/luff-learning-teacher-demo";
import SchoolTeacherDemoShell, {
  type TeacherDemoNavTab,
} from "@/components/demo/shared/SchoolTeacherDemoShell";
import { useShowcaseDesktopEmbed } from "@/components/demo/shared/showcase-desktop-embed";

export type NavTab = TeacherDemoNavTab;

export default function TeacherDashboardDemo({
  initialTab = "dashboard",
  disableTour = false,
  hideNav = false,
  onMount,
  config = luffLearningTeacherDemoConfig,
}: {
  initialTab?: NavTab;
  disableTour?: boolean;
  hideNav?: boolean;
  onMount?: () => void;
  /** Brand for the demo. Defaults to the home page's Luff Learning demo. */
  config?: SchoolTeacherDemoConfig;
}) {
  const desktopEmbed = useShowcaseDesktopEmbed();

  return (
    <SchoolTeacherDemoShell
      config={config}
      initialTab={initialTab}
      disableTour={disableTour}
      hideNav={hideNav}
      desktopEmbed={desktopEmbed}
      onMount={onMount}
    />
  );
}
