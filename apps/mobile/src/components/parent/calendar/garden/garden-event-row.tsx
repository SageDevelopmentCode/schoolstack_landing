import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GChip, GPressable } from '@/components/parent/garden/ui';
import { eventTypeGardenTone } from '@/lib/parent/parent-calendar-garden';
import { formatEventTimeRange } from '@/lib/school-events/calendar-time';
import { getEventDisplayStyle, SCHOOL_EVENT_TYPE_LABELS } from '@/lib/school-events/event-labels';
import type { OrganizationEvent } from '@/lib/school-events/types';

/** Event-type chip (Field trip, No school, …) in Garden tones. */
export function EventTypeChip({ event }: { event: Pick<OrganizationEvent, 'type'> }) {
  return <GChip tone={eventTypeGardenTone(event.type)} label={SCHOOL_EVENT_TYPE_LABELS[event.type]} />;
}

/**
 * One event as a full-width row: colour bar in the event's own colour, title,
 * time + place, type chip, chevron. The whole row is the button.
 */
export function GardenEventRow({
  event,
  onPress,
  selected = false,
  testID,
}: {
  event: OrganizationEvent;
  onPress: (event: OrganizationEvent) => void;
  selected?: boolean;
  testID?: string;
}) {
  const colors = getEventDisplayStyle(event);
  const time = formatEventTimeRange(event);
  const type = SCHOOL_EVENT_TYPE_LABELS[event.type];

  return (
    <View style={selected ? styles.selectedWrap : null}>
      {selected ? <View style={styles.selectedUnderlay} /> : null}
      <GPressable
        testID={testID}
        accessibilityLabel={`${event.title}, ${type}, ${time}${event.location ? `, at ${event.location}` : ''}`}
        accessibilityHint="Opens event details"
        accessibilityState={{ selected }}
        onPress={() => onPress(event)}
        style={[styles.row, { borderColor: selected ? Garden.ink : Garden.ink12 }]}>
        <View style={[styles.bar, { backgroundColor: colors.text }]} />
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={13} color={Garden.soft} />
            <Text style={styles.meta} numberOfLines={1}>
              {time}
            </Text>
          </View>
          {event.location ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={13} color={Garden.soft} />
              <Text style={styles.meta} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.trailing}>
          <EventTypeChip event={event} />
          <Ionicons name="chevron-forward" size={16} color={Garden.ink60} />
        </View>
      </GPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  selectedWrap: {
    paddingBottom: 3,
  },
  selectedUnderlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 3,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: Garden.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingVertical: 12,
    paddingLeft: 18,
    paddingRight: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: Garden.white,
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  meta: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 17,
    color: Garden.soft,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
  },
});
