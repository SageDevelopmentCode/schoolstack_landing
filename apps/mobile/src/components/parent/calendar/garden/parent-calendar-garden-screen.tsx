import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CalendarPortalProvider,
  PARENT_CALENDAR_PORTAL,
  type CalendarPortal,
} from '@/components/parent/calendar/garden/calendar-portal';
import { GardenDayTimeline } from '@/components/parent/calendar/garden/garden-day-timeline';
import { GardenMonthGrid } from '@/components/parent/calendar/garden/garden-month-grid';
import { GardenWeekStrip } from '@/components/parent/calendar/garden/garden-week-strip';
import { ParentCalendarGardenSkeleton } from '@/components/parent/calendar/garden/parent-calendar-garden-skeleton';
import {
  AgendaCard,
  CalendarLegend,
  CalendarSpotlight,
  SelectedDayCard,
} from '@/components/parent/calendar/garden/sections/calendar-sections';
import { CalendarToolbar } from '@/components/parent/calendar/garden/sections/calendar-toolbar';
import { GardenDaySheet } from '@/components/parent/calendar/garden/sheets/garden-day-sheet';
import {
  GardenEventSheet,
  type GardenEventSheetManage,
} from '@/components/parent/calendar/garden/sheets/garden-event-sheet';
import { useParentCalendarFeedback } from '@/components/parent/calendar/garden/use-parent-calendar-feedback';
import { useParentCalendarModel } from '@/components/parent/calendar/garden/use-parent-calendar-model';
import type { ParentCalendarScreenController } from '@/components/parent/calendar/garden/use-parent-calendar-screen-controller';
import { closeThen } from '@/components/parent/messages/garden/use-parent-messages-feedback';
import { Garden, PORTAL_EASE, useGardenAccent } from '@/components/parent/garden/tokens';
import { GErrorCard, GOutlineButton } from '@/components/parent/garden/ui';
import { haptic } from '@/lib/haptics';
import type { OrganizationEvent } from '@/lib/school-events/types';

const SWIPE_DISTANCE = 60;

/** Staff who can manage the school calendar (teacher Calendar with `canManageEvents`). */
export type CalendarManage = {
  /** Opens the add form, prefilled with `date` when given. */
  onAddEvent: (date?: string) => void;
  onEditEvent: (event: OrganizationEvent) => void;
  /** Resolves `true` when the event was deleted (the sheet then closes). */
  onDeleteEvent: (event: OrganizationEvent) => Promise<boolean>;
  deleting: boolean;
  /** Status inside the event sheet (a failed delete, read-only preview). */
  sheetNotice: GardenEventSheetManage['notice'];
  /** The event sheet closed: clear its notice so it doesn't show on the next event. */
  onSheetClosed: () => void;
  /** Rendered at the top of the calendar pane (helper + "Add event"). */
  header: ReactNode;
};

/**
 * Parent Calendar in Garden. The calendar IS the page (web parity): a full-bleed
 * pane (Day | Week | Month, ‹ › and swipe, Today, legend, grid), then on cream a
 * "today / next up" note, the selected day and the family agenda. Sheets sit at the root.
 */
export function ParentCalendarGardenScreen({
  controller,
  agendaTitle = 'Family agenda',
  portal = PARENT_CALENDAR_PORTAL,
  manage,
}: {
  controller: ParentCalendarScreenController;
  agendaTitle?: string;
  /** testIDs, operation names and copy for the portal showing the calendar. */
  portal?: CalendarPortal;
  manage?: CalendarManage;
}) {
  const insets = useSafeAreaInsets();
  const accent = useGardenAccent();
  const { calendar } = controller;
  const model = useParentCalendarModel(controller, {
    onEmptyDay: manage?.onAddEvent,
  });
  const tid = (suffix: string) => `${portal.testIdPrefix}-${suffix}`;
  const { pullRefreshing, onPullRefresh } = useParentCalendarFeedback({
    refresh: controller.refresh,
    error: controller.error,
    deepLinkMissing: controller.deepLinkMissing,
  });

  const scrollRef = useRef<ScrollView>(null);
  const agendaYRef = useRef(0);
  const lowerYRef = useRef(0);

  const { prevPeriod, nextPeriod } = calendar;
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-24, 24])
    .failOffsetY([-12, 12])
    .onEnd((event) => {
      if (event.translationX <= -SWIPE_DISTANCE) {
        haptic.select();
        nextPeriod();
      } else if (event.translationX >= SWIPE_DISTANCE) {
        haptic.select();
        prevPeriod();
      }
    });

  const seeNextUp = useCallback(() => {
    closeThen(model.closeSheets, () => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, lowerYRef.current + agendaYRef.current - 12),
        animated: true,
      });
    });
  }, [model.closeSheets]);

  if (controller.isLoading && !controller.hasData) {
    return <ParentCalendarGardenSkeleton />;
  }

  const rootStyle = [styles.root, { marginTop: -insets.top, paddingTop: insets.top }];

  if (controller.error && !controller.hasData) {
    return (
      <View style={[rootStyle, styles.errorRoot]}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.errorContent}>
          <GErrorCard
            title="We couldn't load the calendar"
            message={`${controller.error} Check your connection, then try again.`}
            onRetry={() => void controller.refresh()}
          />
        </ScrollView>
      </View>
    );
  }

  const selectedEventId = model.selectedEvent?.id ?? null;
  const { viewMode, selectedDate, today } = calendar;

  const eventSheetManage = manage
    ? {
        deleting: manage.deleting,
        notice: manage.sheetNotice,
        onEdit: (event: OrganizationEvent) => closeThen(model.closeSheets, () => manage.onEditEvent(event)),
        onDelete: (event: OrganizationEvent) => {
          void manage.onDeleteEvent(event).then((deleted) => {
            if (deleted) {
              model.closeSheets();
              manage.onSheetClosed();
            }
          });
        },
      }
    : undefined;

  return (
    <CalendarPortalProvider portal={portal}>
      <View style={rootStyle} testID={tid('screen')}>
        <StatusBar style="dark" />
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={pullRefreshing || controller.isRefreshing}
              onRefresh={() => void onPullRefresh()}
              tintColor={accent.clay}
            />
          }>
          {/* Full-bleed calendar pane: toolbar · legend · grid, split by hairlines (web parity). */}
          <View testID={tid('card')} style={styles.pane}>
            {manage ? <View style={styles.manageBand}>{manage.header}</View> : null}
            <View style={styles.toolbarBand}>
              <CalendarToolbar
                viewMode={viewMode}
                periodLabel={calendar.periodLabel}
                summary={model.summary}
                isCurrentPeriod={model.isCurrentPeriod}
                onViewModeChange={calendar.setViewMode}
                onPrev={prevPeriod}
                onNext={nextPeriod}
                onToday={calendar.goToToday}
              />
            </View>

            <View style={[styles.legendBand, model.legend.length === 0 ? styles.legendBandEmpty : null]}>
              <CalendarLegend items={model.legend} />
            </View>

            <GestureDetector gesture={swipe}>
              <Animated.View
                key={`${viewMode}-${calendar.periodLabel}`}
                entering={FadeIn.duration(220).easing(PORTAL_EASE)}
                accessibilityHint="Swipe left or right to change the period"
                style={viewMode === 'day' ? null : styles.gridBand}>
                {viewMode === 'day' && selectedDate ? (
                  <GardenDayTimeline
                    date={selectedDate}
                    today={today}
                    events={model.eventsByDate.get(selectedDate) ?? []}
                    selectedEventId={selectedEventId}
                    onEventPress={model.handleEventPress}
                  />
                ) : viewMode === 'week' ? (
                  <GardenWeekStrip
                    weekDates={calendar.weekDates}
                    selectedDate={selectedDate}
                    today={today}
                    eventsByDate={model.eventsByDate}
                    onSelectDate={model.handleDayPress}
                  />
                ) : (
                  <GardenMonthGrid
                    year={calendar.viewYear}
                    month={calendar.viewMonth}
                    selectedDate={selectedDate}
                    today={today}
                    eventsByDate={model.eventsByDate}
                    onSelectDate={model.handleDayPress}
                  />
                )}
              </Animated.View>
            </GestureDetector>
          </View>

          <View
            style={styles.lower}
            onLayout={(event) => {
              lowerYRef.current = event.nativeEvent.layout.y;
            }}>
            {model.spotlight ? (
              <CalendarSpotlight
                event={model.spotlight.event}
                isToday={model.spotlight.isToday}
                onPress={model.handleEventPress}
              />
            ) : null}

            {viewMode !== 'day' && selectedDate ? (
              <SelectedDayCard
                index={1}
                date={selectedDate}
                today={today}
                events={model.selectedDayEvents}
                selectedEventId={selectedEventId}
                onPress={model.handleEventPress}
                emptyAction={
                  manage ? (
                    <GOutlineButton
                      testID={tid('add-event-on-day')}
                      label="Add event on this day"
                      icon="add"
                      onPress={() => manage.onAddEvent(selectedDate)}
                      style={styles.addOnDay}
                    />
                  ) : undefined
                }
              />
            ) : null}

            <AgendaCard
              index={2}
              title={agendaTitle}
              events={model.upcoming}
              selectedEventId={selectedEventId}
              onPress={model.handleEventPress}
              onLayout={(y) => {
                agendaYRef.current = y;
              }}
            />
          </View>
        </ScrollView>

        <GardenEventSheet
          organizationId={controller.organizationId}
          event={model.selectedEvent}
          today={today}
          onClose={() => {
          model.closeSheets();
          manage?.onSheetClosed();
        }}
          manage={eventSheetManage}
        />

        <GardenDaySheet
          visible={model.daySheetVisible}
          date={model.daySheetDate}
          today={today}
          events={model.daySheetEvents}
          onOpenEvent={model.openEventFromDaySheet}
          onSeeNextUp={seeNextUp}
          onClose={model.closeSheets}
        />
      </View>
    </CalendarPortalProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // White up under the status bar so the full-bleed pane reaches the top edge.
    backgroundColor: Garden.white,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  pane: {
    backgroundColor: Garden.white,
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
  },
  manageBand: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  addOnDay: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  toolbarBand: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  legendBand: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: Garden.paper,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Garden.ink10,
  },
  legendBandEmpty: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  gridBand: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 14,
  },
  lower: {
    flexGrow: 1,
    backgroundColor: Garden.cream,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  errorRoot: {
    backgroundColor: Garden.cream,
  },
  errorContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    backgroundColor: Garden.cream,
  },
});
