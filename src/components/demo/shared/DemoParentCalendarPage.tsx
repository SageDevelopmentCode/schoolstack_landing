"use client";

import { useEffect, useMemo } from "react";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
import ParentCalendarPageShell from "@/components/school-parent/calendar/ParentCalendarPageShell";
import { useParentCalendarPageContext } from "@/components/school-parent/calendar/parent-calendar-page-context";
import {
  buildDemoParentBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import { buildDemoParentEvents } from "@/data/school-demos/demo-parent-portal-fixtures";

function CalendarEventsHydrator() {
  const { hydrateEvents } = useParentCalendarPageContext();

  useEffect(() => {
    hydrateEvents(buildDemoParentEvents(DEMO_PORTAL_ORG_ID));
  }, [hydrateEvents]);

  return null;
}

type DemoParentCalendarPageProps = {
  initialView?: "month" | "week";
  previewAnchorDate?: string;
  previewAgendaAsOf?: string;
};

export default function DemoParentCalendarPage({
  initialView,
  previewAnchorDate,
  previewAgendaAsOf,
}: DemoParentCalendarPageProps = {}) {
  const branding = useMemo(() => buildDemoParentBranding(), []);

  return (
    <DemoSchoolParentStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
        <ParentCalendarPageShell
          organizationId={DEMO_PORTAL_ORG_ID}
          organizationSlug={DEMO_PORTAL_SLUG}
          branding={branding}
          previewMode
          initialView={initialView}
          previewAnchorDate={previewAnchorDate}
          previewAgendaAsOf={previewAgendaAsOf}
        >
          <CalendarEventsHydrator />
        </ParentCalendarPageShell>
      </div>
    </DemoSchoolParentStoryProvider>
  );
}
