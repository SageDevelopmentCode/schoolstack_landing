import { useCallback, useState } from 'react';

import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { useGardenToast } from '@/components/parent/garden/toast';
import type { TimeClockCardModel } from '@/components/teacher/home/garden/sections/time-clock-card';
import { useTeacherClockActions } from '@/components/teacher/home/garden/use-teacher-clock-actions';
import { rememberTeacherMyHoursPageData } from '@/components/teacher/home/garden/use-teacher-time-clock';
import {
  sessionCountLabel,
  validateAdjustmentSessions,
} from '@/components/teacher/my-hours/garden/adjust-validation';
import type {
  MyHoursAdjustInput,
  MyHoursAdjustResult,
  TeacherMyHoursController,
} from '@/components/teacher/my-hours/garden/use-teacher-my-hours-controller';
import { haptic } from '@/lib/haptics';
import {
  formatHoursMinutes,
  formatShortWeekdayDate,
  parseDateKey,
  toDateKey,
  startOfWeekMonday,
} from '@/lib/teacher/my-hours/format-duration';
import type { MyHoursView, TeacherMyHoursPageData } from '@/lib/teacher/my-hours/types';

function crossedWeekGoal(before: TeacherMyHoursPageData | null, after: TeacherMyHoursPageData): boolean {
  const goal = after.sidebar.week.goalMinutes;
  if (!before || goal <= 0) return false;
  return before.sidebar.week.loggedMinutes < goal && after.sidebar.week.loggedMinutes >= goal;
}

/**
 * Wraps the controller with Garden feedback (never changes behaviour): clock
 * toasts with Retry, pull-to-refresh toast, select haptics on view / pager
 * changes, adjust success toasts, and a celebration when an action meets the
 * week's goal.
 */
export function useTeacherMyHoursFeedback({
  organizationId,
  slug,
  controller,
}: {
  organizationId: string;
  slug: string;
  controller: TeacherMyHoursController;
}) {
  const toast = useGardenToast();
  const [goalWeekKey, setGoalWeekKey] = useState<string | null>(null);
  const { pageData, applyPageData, refresh, error } = controller;

  const noteGoal = useCallback(
    (before: TeacherMyHoursPageData | null, after: TeacherMyHoursPageData) => {
      if (crossedWeekGoal(before, after)) {
        setGoalWeekKey(toDateKey(startOfWeekMonday(parseDateKey(after.referenceDateKey))));
      }
    },
    [],
  );

  const onClockPageData = useCallback(
    (next: TeacherMyHoursPageData) => {
      noteGoal(pageData, next);
      applyPageData(next);
      rememberTeacherMyHoursPageData(organizationId, slug, next);
    },
    [applyPageData, noteGoal, organizationId, pageData, slug],
  );

  const actions = useTeacherClockActions({
    organizationId,
    slug,
    clockedIn: controller.clockedIn,
    onPageData: onClockPageData,
  });

  const clock: TimeClockCardModel = {
    loading: false,
    loadFailed: false,
    retryLoad: controller.retry,
    week: controller.week,
    weekProgress: controller.weekProgress,
    clockedIn: controller.clockedIn,
    activeSessionStartedAt: controller.activeSessionStartedAt,
    clockActionPending: actions.clockActionPending,
    clockIn: actions.clockIn,
    clockOut: actions.clockOut,
  };

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh,
    error,
    label: 'My Hours',
    id: 'teacher-my-hours-refresh',
  });

  const setView = useCallback(
    (next: MyHoursView) => {
      if (next !== controller.view) controller.setView(next);
    },
    [controller],
  );

  const goToToday = useCallback(() => {
    haptic.select();
    controller.goToToday();
  }, [controller]);

  const openDay = useCallback(
    (date: Date) => {
      haptic.select();
      controller.openDayDetail(date);
    },
    [controller],
  );

  const onAdjustSaved = useCallback(
    (result: MyHoursAdjustResult, input: MyHoursAdjustInput) => {
      const day = formatShortWeekdayDate(parseDateKey(input.dateKey));
      const { totalMinutes } = validateAdjustmentSessions(
        input.sessions.map((session, index) => ({ key: String(index), ...session })),
      );
      const summary = `${day} · ${formatHoursMinutes(totalMinutes)} across ${sessionCountLabel(input.sessions.length)}.`;
      toast.success(result.requireApproval ? 'Sent for approval' : 'Hours saved', {
        id: 'teacher-my-hours-adjust',
        description: result.requireApproval
          ? `${summary} It stays pending until your school approves it.`
          : `${summary} Your totals are updated.`,
      });
      if (result.weekReloadFailed) {
        toast.warning("Couldn't refresh this week", {
          id: 'teacher-my-hours-adjust-reload',
          description: 'Your change was saved. Pull down or try again to see it here.',
          action: { label: 'Try again', onPress: () => void refresh() },
        });
      }
    },
    [refresh, toast],
  );

  return {
    clock,
    readOnly: actions.readOnly,
    pullRefreshing,
    onPullRefresh,
    setView,
    goToToday,
    openDay,
    onAdjustSaved,
    celebrate: goalWeekKey != null && !actions.readOnly,
    celebrationKey: `teacher-my-hours-goal-${goalWeekKey ?? 'none'}`,
  };
}

export type TeacherMyHoursFeedback = ReturnType<typeof useTeacherMyHoursFeedback>;
