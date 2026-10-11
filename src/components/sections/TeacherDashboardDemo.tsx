"use client";

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
}: {
  initialTab?: NavTab;
  disableTour?: boolean;
  hideNav?: boolean;
  onMount?: () => void;
}) {
  const desktopEmbed = useShowcaseDesktopEmbed();

  return (
    <SchoolTeacherDemoShell
      config={luffLearningTeacherDemoConfig}
      initialTab={initialTab}
      disableTour={disableTour}
      hideNav={hideNav}
      desktopEmbed={desktopEmbed}
      onMount={onMount}
    />
  );
}
