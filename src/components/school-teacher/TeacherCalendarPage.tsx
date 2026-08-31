"use client";

import ParentCalendarPage from "@/components/school-parent/calendar/ParentCalendarPage";
import type { ParentCalendarInitialData } from "@/lib/school-events/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TeacherCalendarPageProps = {
  branding: OrganizationBranding;
  initialData: ParentCalendarInitialData;
  previewMode?: boolean;
};

export default function TeacherCalendarPage({
  branding,
  initialData,
  previewMode = false,
}: TeacherCalendarPageProps) {
  return (
    <ParentCalendarPage
      branding={branding}
      initialData={initialData}
      previewMode={previewMode}
      agendaTitle="School agenda"
    />
  );
}
