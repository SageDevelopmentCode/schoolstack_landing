import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Radius } from '@/constants/theme';
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
import { DAY_NAMES, isToday, parseEventDate } from '@/lib/school-events/calendar-utils';
import { getEventDisplayStyle } from '@/lib/school-events/event-labels';
import type { OrganizationEvent } from '@/lib/school-events/types';

const GUTTER_WIDTH = 44;
const NOW_COLOR = '#ef4444';

type ParentCalendarDayGridProps = {
  date: string;
  today: string;
  events: OrganizationEvent[];
  selectedEventId?: string | null;
  onEventPress: (event: OrganizationEvent) => void;
};

function TimedEventBlock({
  event,
  selected,
  accentColor,
  onPress,
}: {
  event: OrganizationEvent;
  selected: boolean;
  accentColor: string;
  onPress: () => void;
}) {
  const range = getEventTimeRange(event);
  if (!range) return null;

  const top = minutesToTop(range.startMinutes);
  const height = Math.max(minutesToHeight(range.startMinutes, range.endMinutes), 22);
  const colors = getEventDisplayStyle(event);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.eventBlock,
        {
          top,
          height,
          backgroundColor: colors.bg,
          borderLeftColor: colors.text,
          borderColor: selected ? accentColor : 'transparent',
          borderWidth: selected ? 1 : 0,
        },
      ]}>
      <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
        {event.title}
      </Text>
      <Text style={[styles.eventTime, { color: colors.text }]} numberOfLines={1}>
        {formatEventTimeRange(event)}
      </Text>
    </Pressable>
  );
}

export function ParentCalendarDayGrid({
  date,
  today,
  events,
  selectedEventId = null,
  onEventPress,
}: ParentCalendarDayGridProps) {
  const theme = useParentTheme();
  const dayDate = parseEventDate(date);
  const isTodayDay = isToday(dayDate, today);
  const hourCount = WEEK_END_HOUR - WEEK_START_HOUR;
  const nowTop = isTodayDay ? getCurrentTimeTop() : -1;

  const allDayEvents = useMemo(() => events.filter((event) => event.isAllDay), [events]);
  const timedEvents = useMemo(() => events.filter((event) => !event.isAllDay), [events]);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.line,
          backgroundColor: theme.white,
        },
      ]}>
      <View style={[styles.dayHeader, { borderBottomColor: theme.line }]}>
        <Text style={[styles.dayName, { color: theme.muted }]}>
          {DAY_NAMES[dayDate.getDay()].toUpperCase()}
        </Text>
        <View
          style={[
            styles.dayNumberWrap,
            isTodayDay && { backgroundColor: theme.primary },
          ]}>
          <Text
            style={[
              styles.dayNumber,
              { color: isTodayDay ? '#FFFFFF' : theme.ink },
            ]}>
            {dayDate.getDate()}
          </Text>
        </View>
      </View>

      {allDayEvents.length > 0 ? (
        <View style={[styles.allDayRow, { borderBottomColor: theme.line }]}>
          <View style={[styles.allDayGutter, { borderRightColor: theme.line }]}>
            <Text style={[styles.allDayLabel, { color: theme.muted }]}>All day</Text>
          </View>
          <View style={styles.allDayEvents}>
            {allDayEvents.map((event) => {
              const colors = getEventDisplayStyle(event);
              return (
                <Pressable
                  key={event.id}
                  accessibilityRole="button"
                  onPress={() => onEventPress(event)}
                  style={[
                    styles.allDayChip,
                    {
                      backgroundColor: colors.bg,
                      borderLeftColor: colors.text,
                    },
                  ]}>
                  <Text style={[styles.allDayChipText, { color: colors.text }]} numberOfLines={1}>
                    {event.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={[styles.grid, { height: WEEK_GRID_TOTAL_HEIGHT }]}>
        <View style={[styles.gutter, { borderRightColor: theme.line }]}>
          {Array.from({ length: hourCount }, (_, index) => {
            const hour = WEEK_START_HOUR + index;
            return (
              <View key={hour} style={[styles.hourLabelCell, { height: HOUR_HEIGHT_PX }]}>
                <Text style={[styles.hourLabel, { color: theme.muted }]}>
                  {formatHourLabel(hour)}
                </Text>
              </View>
            );
          })}
          {nowTop >= 0 ? (
            <View
              style={[
                styles.nowDot,
                {
                  top: nowTop - 4,
                  backgroundColor: NOW_COLOR,
                },
              ]}
            />
          ) : null}
        </View>

        <View
          style={[
            styles.dayColumn,
            {
              backgroundColor: isTodayDay ? `${theme.primary}08` : undefined,
            },
          ]}>
          {Array.from({ length: hourCount }, (_, index) => (
            <View
              key={index}
              pointerEvents="none"
              style={[
                styles.hourLine,
                {
                  top: index * HOUR_HEIGHT_PX,
                  borderTopColor: theme.line,
                },
              ]}
            />
          ))}
          {Array.from({ length: hourCount }, (_, index) => (
            <View
              key={`half-${index}`}
              pointerEvents="none"
              style={[
                styles.halfHourLine,
                {
                  top: index * HOUR_HEIGHT_PX + HOUR_HEIGHT_PX / 2,
                  borderTopColor: theme.line,
                },
              ]}
            />
          ))}

          {timedEvents.map((event) => (
            <TimedEventBlock
              key={event.id}
              event={event}
              selected={selectedEventId === event.id}
              accentColor={theme.primary}
              onPress={() => onEventPress(event)}
            />
          ))}

          {nowTop >= 0 ? (
            <View
              pointerEvents="none"
              style={[
                styles.nowLine,
                {
                  top: nowTop,
                  backgroundColor: NOW_COLOR,
                },
              ]}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  dayNumberWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '700',
  },
  allDayRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 36,
  },
  allDayGutter: {
    width: GUTTER_WIDTH,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 6,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  allDayLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  allDayEvents: {
    flex: 1,
    padding: 6,
    gap: 4,
  },
  allDayChip: {
    borderLeftWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  allDayChipText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    position: 'relative',
  },
  gutter: {
    width: GUTTER_WIDTH,
    borderRightWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  hourLabelCell: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingRight: 6,
    paddingTop: 2,
  },
  hourLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 10,
    fontWeight: '500',
  },
  nowDot: {
    position: 'absolute',
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    transform: [{ translateX: 4 }],
    zIndex: 20,
  },
  dayColumn: {
    flex: 1,
    position: 'relative',
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  halfHourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    opacity: 0.4,
  },
  eventBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderLeftWidth: 3,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 5,
    overflow: 'hidden',
  },
  eventTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
  },
  eventTime: {
    fontFamily: StoryFonts.body,
    fontSize: 9,
    lineHeight: 12,
    opacity: 0.85,
    marginTop: 1,
  },
  nowLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    zIndex: 10,
  },
});
