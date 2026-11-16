import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCalendarTestId } from '@/components/parent/calendar/garden/calendar-portal';
import { EventTypeChip, GardenEventRow } from '@/components/parent/calendar/garden/garden-event-row';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  DateStamp,
  GCard,
  GChip,
  GDashedRule,
  GHand,
  GIcon,
  GNoteTile,
  GPressable,
} from '@/components/parent/garden/ui';
import {
  formatDayHeading,
  pluralEvents,
  type CalendarLegendItem,
} from '@/lib/parent/parent-calendar-garden';
import { formatAgendaEventMeta } from '@/lib/parent/parent-calendar-agenda-utils';
import { formatEventTimeRange } from '@/lib/school-events/calendar-time';
import type { OrganizationEvent } from '@/lib/school-events/types';

const NO_EVENTS_COPY =
  'No events scheduled yet. Your school calendar will appear here when events are added.';
const NO_UPCOMING_COPY =
  'No upcoming events — your school calendar will appear here when events are added.';

/* ------------------------------------------------------------------ */
/* Spotlight                                                           */
/* ------------------------------------------------------------------ */

/** Butter note for today's first event, or the next one coming up. */
export function CalendarSpotlight({
  event,
  isToday,
  onPress,
}: {
  event: OrganizationEvent;
  isToday: boolean;
  onPress: (event: OrganizationEvent) => void;
}) {
  const kicker = isToday ? 'Today' : `Next up · ${formatDayHeading(event.date)}`;
  return (
    <GNoteTile
      tint={Garden.butter}
      icon={isToday ? 'sunny-outline' : 'sparkles-outline'}
      title={event.title}
      subtitle={`${kicker} · ${formatEventTimeRange(event)}`}
      accessibilityLabel={`${isToday ? 'Today' : 'Next up'}: ${event.title}, ${formatAgendaEventMeta(event, formatEventTimeRange(event))}`}
      accessibilityHint="Opens event details"
      onPress={() => onPress(event)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Legend / no-events strip                                            */
/* ------------------------------------------------------------------ */

export function CalendarLegend({ items }: { items: CalendarLegendItem[] }) {
  const accent = useGardenAccent();
  if (items.length === 0) {
    return (
      <View style={[styles.noEvents, { backgroundColor: accent.wash }]}>
        <Ionicons name="heart-outline" size={18} color={accent.clayDeep} />
        <Text style={styles.noEventsText}>{NO_EVENTS_COPY}</Text>
      </View>
    );
  }
  return (
    <View
      style={styles.legend}
      accessible
      accessibilityLabel={`Event types: ${items.map((item) => item.label).join(', ')}`}>
      {items.map((item) => (
        <View key={item.type} style={styles.legendItem}>
          <View style={styles.legendSwatches}>
            {item.colors.map((color) => (
              <View key={color} style={[styles.legendSwatch, { backgroundColor: color }]} />
            ))}
          </View>
          <Text style={styles.legendLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Selected day                                                        */
/* ------------------------------------------------------------------ */

/** The selected day's events, or a calm empty state. Shared by the card and the day sheet. */
export function DayEventList({
  events,
  selectedEventId,
  onPress,
  emptyAction,
}: {
  events: OrganizationEvent[];
  selectedEventId: string | null;
  onPress: (event: OrganizationEvent) => void;
  emptyAction?: ReactNode;
}) {
  const tid = useCalendarTestId();
  if (events.length === 0) {
    return (
      <View style={styles.emptyDay}>
        <GIcon name="calendar-clear-outline" size="sm" bg={Garden.paper} />
        <View style={styles.emptyDayCopy}>
          <Text style={styles.emptyDayTitle}>Nothing scheduled for this day.</Text>
          <Text style={styles.emptyDayBody}>Pick another day on the calendar, or check what’s next up.</Text>
          {emptyAction}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.dayList}>
      {events.map((event) => (
        <GardenEventRow
          key={event.id}
          event={event}
          onPress={onPress}
          selected={selectedEventId === event.id}
          testID={tid('day-event')}
        />
      ))}
    </View>
  );
}

export function SelectedDayCard({
  date,
  today,
  events,
  selectedEventId,
  onPress,
  index,
  emptyAction,
}: {
  date: string;
  today: string;
  events: OrganizationEvent[];
  selectedEventId: string | null;
  onPress: (event: OrganizationEvent) => void;
  index: number;
  /** Shown under the empty-day copy (e.g. "Add event on this day" for staff). */
  emptyAction?: ReactNode;
}) {
  const tid = useCalendarTestId();
  return (
    <GCard
      index={index}
      testID={tid('selected-day')}
      title={date === today ? `Today · ${formatDayHeading(date)}` : formatDayHeading(date)}
      action={events.length > 0 ? <GChip tone="neutral" label={pluralEvents(events.length)} /> : null}>
      <DayEventList events={events} selectedEventId={selectedEventId} onPress={onPress} emptyAction={emptyAction} />
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Family agenda                                                       */
/* ------------------------------------------------------------------ */

function AgendaTicket({
  event,
  selected,
  onPress,
}: {
  event: OrganizationEvent;
  selected: boolean;
  onPress: (event: OrganizationEvent) => void;
}) {
  const accent = useGardenAccent();
  const meta = formatAgendaEventMeta(event, formatEventTimeRange(event));
  return (
    <GPressable
      accessibilityLabel={`${event.title}, ${meta}`}
      accessibilityHint="Opens event details"
      accessibilityState={{ selected }}
      onPress={() => onPress(event)}
      style={[
        styles.ticket,
        { backgroundColor: selected ? accent.wash : Garden.paper, borderColor: selected ? accent.clay : 'transparent' },
      ]}>
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={[styles.notch, styles.notchRight]} />
      <DateStamp date={event.date} />
      <GDashedRule vertical color={Garden.ink25} style={styles.perforation} />
      <View style={styles.ticketCopy}>
        <Text style={styles.ticketTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.ticketMeta} numberOfLines={1}>
          {event.isAllDay ? 'All day' : formatEventTimeRange(event)}
          {event.location ? ` · ${event.location}` : ''}
        </Text>
        <EventTypeChip event={event} />
      </View>
    </GPressable>
  );
}

export function AgendaCard({
  title,
  events,
  selectedEventId,
  onPress,
  index,
  onLayout,
}: {
  title: string;
  events: OrganizationEvent[];
  selectedEventId: string | null;
  onPress: (event: OrganizationEvent) => void;
  index: number;
  onLayout?: (y: number) => void;
}) {
  const tid = useCalendarTestId();
  return (
    <GCard
      index={index}
      testID={tid('agenda')}
      title={title}
      onLayout={onLayout}
      action={events.length > 0 ? <GChip tone="info" label={pluralEvents(events.length)} /> : null}>
      {events.length === 0 ? (
        <View style={styles.agendaEmpty}>
          <Text style={styles.agendaEmptyText}>{NO_UPCOMING_COPY}</Text>
          <GHand>Enjoy the quiet stretch!</GHand>
        </View>
      ) : (
        <View style={styles.agendaList}>
          {events.map((event) => (
            <AgendaTicket
              key={event.id}
              event={event}
              selected={selectedEventId === event.id}
              onPress={onPress}
            />
          ))}
        </View>
      )}
    </GCard>
  );
}

const styles = StyleSheet.create({
  noEvents: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noEventsText: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.ink65,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSwatches: {
    flexDirection: 'row',
  },
  legendSwatch: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginRight: -3,
    borderWidth: 2,
    borderColor: Garden.white,
  },
  legendLabel: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 12,
    color: Garden.soft,
  },
  emptyDay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Garden.ink15,
    backgroundColor: Garden.notebook,
  },
  emptyDayCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  emptyDayTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  emptyDayBody: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
  dayList: {
    gap: 10,
  },
  agendaEmpty: {
    gap: 6,
  },
  agendaEmptyText: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 21,
    color: Garden.soft,
  },
  agendaList: {
    gap: 10,
  },
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 84,
    overflow: 'hidden',
  },
  notch: {
    position: 'absolute',
    top: '50%',
    width: 18,
    height: 18,
    marginTop: -9,
    borderRadius: 9,
    backgroundColor: Garden.white,
  },
  notchLeft: {
    left: -9,
  },
  notchRight: {
    right: -9,
  },
  perforation: {
    marginVertical: -4,
  },
  ticketCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  ticketTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  ticketMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.soft,
  },
});
