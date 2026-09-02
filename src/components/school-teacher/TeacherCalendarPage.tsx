"use client";

import { useMemo } from "react";
import OrganizationEventsCalendarManager from "@/components/school-events/OrganizationEventsCalendarManager";
import ParentCalendarPage from "@/components/school-parent/calendar/ParentCalendarPage";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { TeacherCalendarInitialData } from "@/lib/school-events/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TeacherCalendarPageProps = {
  branding: OrganizationBranding;
  initialData: TeacherCalendarInitialData;
  organizationId: string;
  previewMode?: boolean;
};

export default function TeacherCalendarPage({
  branding,
  initialData,
  organizationId,
  previewMode = false,
}: TeacherCalendarPageProps) {
  const { theme } = useParentTheme();
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  if (!initialData.canManageEvents) {
    return (
      <ParentCalendarPage
        branding={branding}
        organizationId={organizationId}
        organizationSlug=""
        events={initialData.events}
        previewMode={previewMode}
        agendaTitle="School agenda"
      />
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-2 py-2 sm:px-3 sm:py-3 lg:gap-4">
          <h1 className="sr-only">Calendar</h1>
          <OrganizationEventsCalendarManager
            theme={theme}
            C={C}
            organizationId={organizationId}
            readOnly={previewMode}
            toastVariant="parent"
            emptyHint="No events yet — click a day to add one, or use Add event."
          />
        </div>
      </div>
    </div>
  );
}
