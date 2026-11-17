"use client";

import { useMemo } from "react";
import DemoSchoolTeacherStoryProvider from "@/components/demo/shared/DemoSchoolTeacherStoryProvider";
import { useShowcaseDesktopEmbed } from "@/components/demo/shared/showcase-desktop-embed";
import TeacherMyHoursPage from "@/components/school-teacher/my-hours/TeacherMyHoursPage";
import {
  buildDemoTeacherBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import { buildShowcaseTeacherHoursSummary } from "@/data/school-demos/demo-showcase-fixtures";
import {
  buildDemoTeacherMyHoursPageData,
  buildDemoTeacherMyHoursPageDataFromSummary,
} from "@/data/school-demos/demo-teacher-hours-fixtures";

/**
 * The real Garden staff My Hours page in preview mode with demo fixtures
 * (32.4h this week, 128.6h this month, clocked in at 7:44 AM). Clocking and
 * saving are disabled; no network, no URL writes. `interactive` lets visitors
 * switch views and open the adjust drawer (the walkthrough keeps it static).
 */
export default function DemoTeacherHoursPage({ interactive = false }: { interactive?: boolean }) {
  const showcaseEmbed = useShowcaseDesktopEmbed();
  const branding = useMemo(() => buildDemoTeacherBranding(), []);
  const { pageData, previewNow } = useMemo(
    () =>
      showcaseEmbed
        ? buildDemoTeacherMyHoursPageDataFromSummary(buildShowcaseTeacherHoursSummary())
        : buildDemoTeacherMyHoursPageData(),
    [showcaseEmbed],
  );

  return (
    <DemoSchoolTeacherStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div
        className={`flex min-h-0 flex-1 flex-col ${interactive ? "" : "pointer-events-none select-none"}`}
        data-testid="demo-teacher-hours-page"
      >
        <TeacherMyHoursPage
          organizationId={DEMO_PORTAL_ORG_ID}
          branding={branding}
          slug={DEMO_PORTAL_SLUG}
          initialData={pageData}
          previewNow={previewNow}
          previewMode
        />
      </div>
    </DemoSchoolTeacherStoryProvider>
  );
}
