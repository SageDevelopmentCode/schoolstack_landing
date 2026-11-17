import { createContext, useContext, type ReactNode } from 'react';

/**
 * Which portal is showing the Garden calendar. The parent Calendar is the
 * default; the teacher Calendar reuses the same screen with its own testIDs,
 * `reportError` operation names and preview copy.
 */
export type CalendarPortal = {
  /** testIDs read `${testIdPrefix}-screen`, `${testIdPrefix}-view-week`, … */
  testIdPrefix: string;
  /** Operations read `${operationPrefix}_copy_details`, `_share`, `_open_maps`. */
  operationPrefix: string;
  /** In-sheet notice when Copy / Share is tapped in read-only preview. */
  previewShareNotice: string;
  /** The tip under an event's details. */
  shareTip: string;
};

export const PARENT_CALENDAR_PORTAL: CalendarPortal = {
  testIdPrefix: 'parent-calendar',
  operationPrefix: 'parent_calendar',
  previewShareNotice: 'Copying and sharing are available to families in the live portal.',
  shareTip: '“Share event” sends it to Messages, Notes, email or your partner, so everyone has the plan.',
};

const CalendarPortalContext = createContext<CalendarPortal>(PARENT_CALENDAR_PORTAL);

export function CalendarPortalProvider({ portal, children }: { portal: CalendarPortal; children: ReactNode }) {
  return <CalendarPortalContext.Provider value={portal}>{children}</CalendarPortalContext.Provider>;
}

export function useCalendarPortal(): CalendarPortal {
  return useContext(CalendarPortalContext);
}

/** `useCalendarTestId()('view-week')` → "parent-calendar-view-week" (or the teacher prefix). */
export function useCalendarTestId(): (suffix: string) => string {
  const { testIdPrefix } = useCalendarPortal();
  return (suffix) => `${testIdPrefix}-${suffix}`;
}
