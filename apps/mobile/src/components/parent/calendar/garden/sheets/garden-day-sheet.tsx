import { useEffect, useState } from 'react';

import { DayEventList } from '@/components/parent/calendar/garden/sections/calendar-sections';
import { GSheet } from '@/components/parent/garden/sheet';
import { GLink } from '@/components/parent/garden/ui';
import { formatDayHeading, pluralEvents } from '@/lib/parent/parent-calendar-garden';
import type { OrganizationEvent } from '@/lib/school-events/types';

/**
 * A tapped day in Week / Month view. Empty days show the calm empty state
 * (same as the Story empty-day sheet); days with 2+ events list them all.
 */
export function GardenDaySheet({
  visible,
  date,
  today,
  events,
  onOpenEvent,
  onSeeNextUp,
  onClose,
}: {
  visible: boolean;
  date: string | null;
  today: string;
  events: OrganizationEvent[];
  onOpenEvent: (event: OrganizationEvent) => void;
  onSeeNextUp: () => void;
  onClose: () => void;
}) {
  // Keep the last day while the sheet animates out.
  const [shownDate, setShownDate] = useState(date);
  const [shownEvents, setShownEvents] = useState(events);
  useEffect(() => {
    if (!date) return;
    setShownDate(date);
    setShownEvents(events);
  }, [date, events]);

  if (!shownDate) return null;

  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      title={shownDate === today ? `Today · ${formatDayHeading(shownDate)}` : formatDayHeading(shownDate)}
      subtitle={shownEvents.length > 0 ? `${pluralEvents(shownEvents.length)} · tap one for details` : undefined}>
      <DayEventList
        events={shownEvents}
        selectedEventId={null}
        onPress={onOpenEvent}
        emptyAction={
          <GLink
            testID="parent-calendar-see-next-up"
            label="See what’s next up"
            icon="arrow-down"
            onPress={onSeeNextUp}
            accessibilityHint="Closes this sheet and scrolls to upcoming events"
          />
        }
      />
    </GSheet>
  );
}
