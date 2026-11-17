import { StyleSheet, Text, View } from 'react-native';

import { GStepList, type GStep } from '@/components/parent/garden/steps';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GOutlineButton, GSkeleton } from '@/components/parent/garden/ui';
import { draftSummary, sessionCountLabel } from '@/components/teacher/my-hours/garden/adjust-validation';
import type { AdjustEditor } from '@/components/teacher/my-hours/garden/use-adjust-editor';
import {
  addDays,
  formatHoursMinutes,
  formatShortWeekdayDate,
  startOfWeekMonday,
  toDateKey,
} from '@/lib/teacher/my-hours/format-duration';
import type { TeacherMyHoursPageData } from '@/lib/teacher/my-hours/types';

/** How fixing hours works: three steps, the last one in the school's words. */
export function AdjustGuideCard({ requireApproval, index }: { requireApproval: boolean; index?: number }) {
  const steps: GStep[] = [
    { id: 'pick', title: 'Pick a day below', meta: '“Add hours” for a missed day, “Adjust” to fix one.', state: 'current' },
    { id: 'times', title: 'Set clock-in and clock-out times', meta: 'Add a session for each stretch you worked.', state: 'todo' },
    requireApproval
      ? {
          id: 'send',
          title: 'Submit for approval',
          meta: 'Submitted days stay pending until your school approves them.',
          state: 'todo',
        }
      : { id: 'send', title: 'Save changes', meta: 'Saved days update your hours right away.', state: 'todo' },
  ];
  return (
    <GCard
      index={index}
      title="Fix a past day"
      action={
        <GChip
          tone={requireApproval ? 'warning' : 'success'}
          icon={requireApproval ? 'hourglass-outline' : 'flash-outline'}
          label={requireApproval ? 'Needs approval' : 'Saves right away'}
        />
      }>
      <GStepList steps={steps} accessibilityLabel="How fixing hours works" />
    </GCard>
  );
}

/**
 * Adjust view: the week's days with the same chips, hints and "Adjust" /
 * "Add hours" rules as before; the button opens the editor sheet.
 */
export function AdjustViewCard({
  pageData,
  focusDate,
  referenceDate,
  weekLoading,
  editor,
  index,
}: {
  pageData: TeacherMyHoursPageData;
  focusDate: Date;
  referenceDate: Date;
  weekLoading: boolean;
  editor: AdjustEditor;
  index?: number;
}) {
  const accent = useGardenAccent();
  const weekStart = startOfWeekMonday(focusDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const referenceKey = toDateKey(referenceDate);
  const pendingByDay = pageData.pendingAdjustmentsByDateKey ?? {};
  const pendingCount = days.filter((day) => pendingByDay[toDateKey(day)]).length;

  return (
    <GCard
      index={index}
      title="Pick a day"
      action={pendingCount > 0 ? <GChip tone="warning" label={`${pendingCount} pending`} /> : null}
      testID="teacher-my-hours-adjust-panel">
      <View style={styles.paper}>
        {days.map((day, i) => {
          const dateKey = toDateKey(day);
          const isToday = dateKey === referenceKey;
          const isFuture = dateKey > referenceKey;
          const closed = editor.closedSessionsFor(dateKey);
          const pending = pendingByDay[dateKey] ?? null;
          const openOnDay = pageData.activeSession?.workDate === dateKey;
          const daySessionsKnown = editor.sessionsKnownFor(dateKey);
          const canEdit = !isFuture && !openOnDay && daySessionsKnown && !weekLoading;
          const loadingRow = !isFuture && !openOnDay && (weekLoading || !daySessionsKnown);
          const summary = isFuture
            ? 'Upcoming'
            : !daySessionsKnown || weekLoading
              ? 'Loading…'
              : pending
                ? draftSummary(pending.sessions)
                : closed.length > 0
                  ? `${formatHoursMinutes(closed.reduce((sum, s) => sum + s.minutes, 0))} · ${sessionCountLabel(closed.length)}`
                  : openOnDay
                    ? 'In progress'
                    : 'Not logged';
          const label = pending || closed.length > 0 ? 'Adjust' : 'Add hours';

          return (
            <View
              key={dateKey}
              style={[styles.row, i > 0 && styles.divider, isToday && { backgroundColor: accent.wash }]}>
              <View style={styles.rowMain}>
                <View style={styles.rowTitle}>
                  <Text style={[styles.day, isFuture && styles.dim]}>{formatShortWeekdayDate(day)}</Text>
                  {isToday ? <GChip label="Today" tone="info" /> : null}
                  {pending ? <GChip label="Pending" tone="warning" /> : null}
                  {openOnDay ? <GChip label="In progress" tone="success" /> : null}
                </View>
                {loadingRow ? (
                  <GSkeleton style={styles.skLine} />
                ) : (
                  <Text style={[styles.summary, (pending || closed.length > 0) && styles.summaryOn]}>{summary}</Text>
                )}
                {openOnDay ? <Text style={styles.hint}>Clock out before changing this day.</Text> : null}
              </View>
              {canEdit ? (
                <GOutlineButton
                  label={label}
                  icon={label === 'Adjust' ? 'pencil' : 'add'}
                  onPress={() => editor.openEditor(dateKey)}
                  accessibilityLabel={`${label} for ${formatShortWeekdayDate(day)}`}
                  testID={`teacher-my-hours-adjust-${dateKey}`}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </GCard>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: Garden.notebook,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Garden.ink10,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 64, paddingHorizontal: 12, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink10 },
  rowMain: { flex: 1, minWidth: 0, gap: 4 },
  rowTitle: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  day: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  dim: { color: Garden.soft },
  summary: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft, fontVariant: ['tabular-nums'] },
  summaryOn: { color: Garden.ink, fontFamily: GardenFonts.bodyBold },
  hint: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: '#7E4533' },
  skLine: { width: '55%', height: 12, borderRadius: 6 },
});
