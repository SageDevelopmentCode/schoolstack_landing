import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent, withAlpha } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import {
  formatEventTimeRange,
  formatHourLabel,
  getCurrentTimeTop,
  getEventTimeRange,
  HOUR_HEIGHT_PX,
  minutesToHeight,
  minutesToTop,
  WEEK_END_HOUR,
  WEEK_GRID_TOTAL_HEIGHT,
  WEEK_START_HOUR,
} from '@/lib/school-events/calendar-time';
import { getEventDisplayStyle, SCHOOL_EVENT_TYPE_LABELS } from '@/lib/school-events/event-labels';
import type { OrganizationEvent } from '@/lib/school-events/types';

const GUTTER_WIDTH = 48;

/**
 * Day view: all-day strip + an hour timeline (same time math as the Story
 * `ParentCalendarDayGrid`), restyled in Garden. Events take their own colour;
 * the "now" line uses the school accent.
 */
export function GardenDayTimeline({
  date,
  today,
  events,
  selectedEventId = null,
  onEventPress,
}: {
  date: string;
  today: string;
  events: OrganizationEvent[];
  selectedEventId?: string | null;
  onEventPress: (event: OrganizationEvent) => void;
}) {
  const accent = useGardenAccent();
  const isTodayDay = date === today;
  const hourCount = WEEK_END_HOUR - WEEK_START_HOUR;
  const nowTop = isTodayDay ? getCurrentTimeTop() : -1;

  const allDayEvents = useMemo(() => events.filter((event) => event.isAllDay), [events]);
  const timedEvents = useMemo(() => events.filter((event) => !event.isAllDay), [events]);
  const hiddenTimed = useMemo(
    () => timedEvents.filter((event) => getEventTimeRange(event) === null),
    [timedEvents],
  );

  return (
    <View style={styles.container} testID="parent-calendar-day-timeline">
      {events.length === 0 ? (
        <View style={styles.emptyBanner}>
          <Ionicons name="sunny-outline" size={16} color={Garden.soft} />
          <Text style={styles.emptyText}>Nothing scheduled for this day.</Text>
        </View>
      ) : null}

      {allDayEvents.length > 0 || hiddenTimed.length > 0 ? (
        <View style={styles.allDayRow}>
          <Text style={styles.allDayLabel}>All day</Text>
          <View style={styles.allDayEvents}>
            {[...allDayEvents, ...hiddenTimed].map((event) => {
              const colors = getEventDisplayStyle(event);
              const selected = selectedEventId === event.id;
              return (
                <GPressable
                  key={event.id}
                  accessibilityLabel={`${event.title}, ${SCHOOL_EVENT_TYPE_LABELS[event.type]}, ${formatEventTimeRange(event)}`}
                  accessibilityHint="Opens event details"
                  onPress={() => onEventPress(event)}
                  style={[
                    styles.allDayChip,
                    {
                      backgroundColor: colors.bg,
                      borderLeftColor: colors.text,
                      borderColor: selected ? Garden.ink : 'transparent',
                    },
                  ]}>
                  <Text style={[styles.allDayChipText, { color: colors.text }]} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.text} />
                </GPressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={[styles.grid, { height: WEEK_GRID_TOTAL_HEIGHT }]}>
        <View style={styles.gutter}>
          {Array.from({ length: hourCount }, (_, index) => {
            const hour = WEEK_START_HOUR + index;
            return (
              <View key={hour} style={[styles.hourLabelCell, { height: HOUR_HEIGHT_PX }]}>
                <Text style={styles.hourLabel}>{formatHourLabel(hour)}</Text>
              </View>
            );
          })}
        </View>

        <View
          style={[styles.dayColumn, isTodayDay ? { backgroundColor: withAlpha(accent.clay, 0.04) } : null]}>
          {Array.from({ length: hourCount }, (_, index) => (
            <View
              key={index}
              pointerEvents="none"
              style={[styles.hourLine, { top: index * HOUR_HEIGHT_PX }]}
            />
          ))}

          {timedEvents.map((event) => {
            const range = getEventTimeRange(event);
            if (!range) return null;
            const top = minutesToTop(range.startMinutes);
            const height = Math.max(minutesToHeight(range.startMinutes, range.endMinutes), 26);
            const colors = getEventDisplayStyle(event);
            const selected = selectedEventId === event.id;
            const time = formatEventTimeRange(event);
            return (
              <GPressable
                key={event.id}
                accessibilityLabel={`${event.title}, ${SCHOOL_EVENT_TYPE_LABELS[event.type]}, ${time}`}
                accessibilityHint="Opens event details"
                pressedScale={0.98}
                onPress={() => onEventPress(event)}
                style={[
                  styles.eventBlock,
                  {
                    top,
                    height,
                    backgroundColor: colors.bg,
                    borderLeftColor: colors.text,
                    borderColor: selected ? Garden.ink : withAlpha(colors.text, 0.25),
                  },
                ]}>
                <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={height > 40 ? 2 : 1}>
                  {event.title}
                </Text>
                {height > 34 ? (
                  <Text style={[styles.eventTime, { color: colors.text }]} numberOfLines={1}>
                    {time}
                  </Text>
                ) : null}
              </GPressable>
            );
          })}

          {nowTop >= 0 ? (
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.nowWrap, { top: nowTop - 5 }]}>
              <View style={[styles.nowDot, { backgroundColor: accent.clay }]} />
              <View style={[styles.nowLine, { backgroundColor: accent.clay }]} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Garden.notebook,
    paddingBottom: 6,
  },
  emptyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
    backgroundColor: Garden.paper,
  },
  emptyText: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    color: Garden.soft,
  },
  allDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
    paddingVertical: 8,
  },
  allDayLabel: {
    width: GUTTER_WIDTH,
    textAlign: 'right',
    paddingRight: 8,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Garden.soft,
  },
  allDayEvents: {
    flex: 1,
    gap: 6,
    paddingRight: 8,
  },
  allDayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    borderLeftWidth: 4,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  allDayChipText: {
    flex: 1,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
  },
  gutter: {
    width: GUTTER_WIDTH,
    borderRightWidth: 1,
    borderRightColor: Garden.ink10,
  },
  hourLabelCell: {
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingTop: 2,
  },
  hourLabel: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 10,
    color: Garden.soft,
  },
  dayColumn: {
    flex: 1,
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: Garden.ink10,
  },
  eventBlock: {
    position: 'absolute',
    left: 6,
    right: 8,
    borderLeftWidth: 4,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
    zIndex: 5,
  },
  eventTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12,
    lineHeight: 15,
  },
  eventTime: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 11,
    lineHeight: 14,
    opacity: 0.85,
  },
  nowWrap: {
    position: 'absolute',
    left: -5,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  nowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nowLine: {
    flex: 1,
    height: 2,
  },
});
