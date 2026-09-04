"use client";

import { useCallback, useMemo, useState } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { OrganizationEvent } from "@/lib/school-events/types";
import ParentCalendarPage from "./ParentCalendarPage";
import { ParentCalendarPageContext } from "./parent-calendar-page-context";

type ParentCalendarPageShellProps = {
  organizationId: string;
  organizationSlug: string;
  branding: OrganizationBranding;
  previewMode?: boolean;
  agendaTitle?: string;
  programId?: string;
  children?: React.ReactNode;
};

export default function ParentCalendarPageShell({
  organizationId,
  organizationSlug,
  branding,
  previewMode = false,
  agendaTitle,
  programId,
  children,
}: ParentCalendarPageShellProps) {
  const [events, setEvents] = useState<OrganizationEvent[]>([]);
  const [eventsHydrated, setEventsHydrated] = useState(false);

  const hydrateEvents = useCallback((nextEvents: OrganizationEvent[]) => {
    setEvents(nextEvents);
    setEventsHydrated(true);
  }, []);

  const contextValue = useMemo(() => ({ hydrateEvents }), [hydrateEvents]);

  return (
    <ParentCalendarPageContext.Provider value={contextValue}>
      <ParentCalendarPage
        branding={branding}
        organizationId={organizationId}
        organizationSlug={organizationSlug}
        previewMode={previewMode}
        agendaTitle={agendaTitle}
        programId={programId}
        events={events}
        eventsDeferred={!eventsHydrated}
      />
      {children}
    </ParentCalendarPageContext.Provider>
  );
}
