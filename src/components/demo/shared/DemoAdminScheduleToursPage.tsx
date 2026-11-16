"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ClipboardList, Globe, Globe2 } from "lucide-react";
import DemoSchoolAdminStoryProvider from "@/components/demo/shared/DemoSchoolAdminStoryProvider";
import AdmissionsAvailabilityEditor from "@/components/school-admin/admissions/AdmissionsAvailabilityEditor";
import { AdminGardenPage, AdminGardenPageHeader } from "@/components/school-admin/garden/kit";
import { SCHEDULE_TABS } from "@/components/school-admin/schedule/schedule-tabs";
import { scheduleStatusLine } from "@/components/school-admin/schedule/useScheduleModel";
import { GCard, GChip } from "@/components/school-parent/garden/ui";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import TuitionSubTabBar from "@/components/school-admin/tuition/TuitionSubTabBar";
import { formatOrganizationTimezoneLabel } from "@/lib/admissions/admissions-availability";
import {
  DEMO_MARKETING_TOUR_TIMEZONE,
  buildDemoMarketingTourAvailabilitySlots,
} from "@/data/school-demos/demo-admin-schedule-fixtures";
import { DEMO_PORTAL_ORG_ID } from "@/data/school-demos/demo-portal-shared";

const TOURS_SUBTABS = [
  { id: "availability", label: "Availability", icon: CalendarDays },
  { id: "submissions", label: "Tour submissions", icon: ClipboardList },
  { id: "public-tour", label: "Public tour page", icon: Globe },
] as const;

function DemoAdminScheduleToursContent() {
  const { theme, C } = useSchoolAdminStoryTheme();
  const slots = useMemo(() => buildDemoMarketingTourAvailabilitySlots(), []);
  const [monthSlotCount, setMonthSlotCount] = useState(slots.length);
  const timezoneLabel = formatOrganizationTimezoneLabel(DEMO_MARKETING_TOUR_TIMEZONE);

  return (
    <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
      <AdminGardenPage theme={theme} scroll={false} data-testid="demo-admin-schedule-tours">
        <AdminGardenPageHeader
          kicker="School calendar"
          title={<span className="text-[var(--sf-clay)]">Schedule</span>}
          subtitle={scheduleStatusLine({
            tab: "tours",
            monthSlotCount,
            monthObservationDayCount: 3,
            upcomingVisitCount: 2,
            permittedStaffCount: null,
          })}
          actions={
            <GChip tone="neutral" className="!normal-case">
              <Globe2 className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
              {timezoneLabel}
            </GChip>
          }
          tabs={{
            items: SCHEDULE_TABS.map((tab) => ({ key: tab.id, label: tab.label })),
            activeKey: "tours",
            onChange: () => {},
            ariaLabel: "Schedule sections",
            "data-testid": "schedule-tab-nav",
          }}
        />
        <GCard index={1}>
          <div className="flex flex-col gap-4">
            <TuitionSubTabBar
              theme={theme}
              tabs={TOURS_SUBTABS}
              activeTab="availability"
              onTabChange={() => {}}
              ariaLabel="Tours and interviews sections"
              testIdPrefix="schedule-tours"
            />
            <AdmissionsAvailabilityEditor
              C={C}
              organizationId={DEMO_PORTAL_ORG_ID}
              readOnly
              timezone={DEMO_MARKETING_TOUR_TIMEZONE}
              compactLayout
              storySurface
              previewSlots={slots}
              onMonthSlotCountChange={setMonthSlotCount}
            />
          </div>
        </GCard>
      </AdminGardenPage>
    </div>
  );
}

export default function DemoAdminScheduleToursPage() {
  return (
    <DemoSchoolAdminStoryProvider className="flex min-h-0 flex-1 flex-col">
      <DemoAdminScheduleToursContent />
    </DemoSchoolAdminStoryProvider>
  );
}
