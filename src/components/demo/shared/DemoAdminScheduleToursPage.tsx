"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ClipboardList, Globe } from "lucide-react";
import DemoSchoolAdminStoryProvider from "@/components/demo/shared/DemoSchoolAdminStoryProvider";
import AdmissionsAvailabilityEditor from "@/components/school-admin/admissions/AdmissionsAvailabilityEditor";
import ScheduleStoryHeader from "@/components/school-admin/schedule/ScheduleStoryHeader";
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
    <div className="pointer-events-none mx-auto max-w-[1350px] select-none px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
      <ScheduleStoryHeader
        theme={theme}
        activeTab="tours"
        timezoneLabel={timezoneLabel}
        monthSlotCount={monthSlotCount}
        monthObservationDayCount={3}
        upcomingVisitCount={2}
        onTabChange={() => {}}
      />

      <div className="space-y-4">
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
    </div>
  );
}

export default function DemoAdminScheduleToursPage() {
  return (
    <DemoSchoolAdminStoryProvider>
      <DemoAdminScheduleToursContent />
    </DemoSchoolAdminStoryProvider>
  );
}
