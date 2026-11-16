"use client";

import { useMemo } from "react";
import OrganizationEventsCalendarManager from "@/components/school-events/OrganizationEventsCalendarManager";
import ParentCalendarPage from "@/components/school-parent/calendar/ParentCalendarPage";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { GChip } from "@/components/school-parent/garden/ui";
import { AdminGardenSkin } from "@/components/school-admin/garden/skin";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import type { TeacherCalendarInitialData } from "@/lib/school-events/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TeacherCalendarPageProps = {
  branding: OrganizationBranding;
  initialData: TeacherCalendarInitialData;
  organizationId: string;
  previewMode?: boolean;
};

/**
 * Staff Calendar (Garden). Staff who can't manage events get the parent
 * Garden calendar (every event is already loaded, so months never refetch).
 * Event managers get the admin Garden events calendar: Add event, event
 * drawer, edit form, delete + discard confirms and toasts.
 */
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
        eventsComplete
        previewMode={previewMode}
        agendaTitle="School agenda"
      />
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto bg-[var(--sf-cream,#FBF7EF)]">
        <ParentGardenFrame theme={theme} className="bg-[var(--sf-cream)]">
          <AdminGardenSkin theme={theme}>
            <div className={`sf-admin-garden-skin ${PORTAL_HOME_CONTAINER_CLASS}`}>
              <ParentGardenPageHeader
                title="Calendar"
                subtitle={
                  <span className="flex flex-wrap items-center gap-2">
                    <span>Families see school events in the parent portal.</span>
                    <GChip tone={previewMode ? "neutral" : "info"}>
                      {previewMode ? "Preview · editing off" : "You can add and edit events"}
                    </GChip>
                  </span>
                }
              />
              <OrganizationEventsCalendarManager
                theme={theme}
                C={C}
                organizationId={organizationId}
                readOnly={previewMode}
                toastVariant="parent"
                garden
                emptyHint="No events yet — click a day to add one, or use Add event."
              />
            </div>
          </AdminGardenSkin>
        </ParentGardenFrame>
      </div>
    </div>
  );
}
