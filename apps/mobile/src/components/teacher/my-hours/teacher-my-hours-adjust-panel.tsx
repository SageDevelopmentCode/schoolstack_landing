import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryTextField } from '@/components/story/story-text-field';
import { formatClockLabel, StoryTimeField } from '@/components/story/story-time-field';
import { TeacherMyHoursDateNav } from '@/components/teacher/my-hours/teacher-my-hours-date-nav';
import { MY_HOURS_CALENDAR_LINE } from '@/components/teacher/my-hours/teacher-my-hours-theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  addDays,
  formatHoursMinutes,
  formatLongWeekdayDate,
  formatShortWeekdayDate,
  parseDateKey,
  startOfWeekMonday,
  toDateKey,
} from '@/lib/teacher/my-hours/format-duration';
import type {
  MyHoursAdjustmentSession,
  MyHoursPendingAdjustment,
  MyHoursSession,
  TeacherMyHoursActiveSession,
} from '@/lib/teacher/my-hours/types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

const DEFAULT_CLOCK_IN = '08:00';
const DEFAULT_CLOCK_OUT = '15:00';

type SessionDraft = {
  key: string;
  clockIn: string;
  clockOut: string;
};

type EditorState = {
  dateKey: string;
  sessions: SessionDraft[];
  note: string;
  showError: boolean;
};

type TeacherMyHoursAdjustPanelProps = {
  navLabel: string;
  onPreviousDate: () => void;
  onNextDate: () => void;
  focusDate: Date;
  referenceDate: Date;
  timezone: string;
  sessionsByDateKey: Record<string, MyHoursSession[]>;
  pendingAdjustmentsByDateKey: Record<string, MyHoursPendingAdjustment>;
  adjustmentsRequireApproval: boolean;
  activeSession: TeacherMyHoursActiveSession | null;
  onSubmit: (input: {
    dateKey: string;
    note: string;
    sessions: MyHoursAdjustmentSession[];
  }) => Promise<void>;
};

function minutesFromTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function sessionMinutes(clockIn: string, clockOut: string): number | null {
  const start = minutesFromTime(clockIn);
  const end = minutesFromTime(clockOut);
  if (start == null || end == null || end <= start) return null;
  return end - start;
}

function isoToTimeInput(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  let hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
  if (hour === '24') hour = '00';
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

function draftSummary(sessions: MyHoursAdjustmentSession[]): string {
  const total = sessions.reduce(
    (sum, session) => sum + (sessionMinutes(session.clockIn, session.clockOut) ?? 0),
    0,
  );
  if (sessions.length === 1) {
    const session = sessions[0];
    return `${formatClockLabel(session.clockIn)} – ${formatClockLabel(session.clockOut)} · ${formatHoursMinutes(total)}`;
  }
  return `${formatHoursMinutes(total)} · ${sessions.length} sessions`;
}

export function TeacherMyHoursAdjustPanel({
  navLabel,
  onPreviousDate,
  onNextDate,
  focusDate,
  referenceDate,
  timezone,
  sessionsByDateKey,
  pendingAdjustmentsByDateKey,
  adjustmentsRequireApproval,
  activeSession,
  onSubmit,
}: TeacherMyHoursAdjustPanelProps) {
  const theme = useParentTheme();
  const keyRef = useRef(0);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);

  const weekStart = startOfWeekMonday(focusDate);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const referenceKey = toDateKey(referenceDate);

  const nextKey = () => {
    keyRef.current += 1;
    return `adjust-session-${keyRef.current}`;
  };

  const closedSessionsFor = (dateKey: string) =>
    (sessionsByDateKey[dateKey] ?? []).filter((session) => session.clockOutAt != null);

  const openEditor = (dateKey: string) => {
    const closed = closedSessionsFor(dateKey);
    const pending = pendingAdjustmentsByDateKey[dateKey];
    if (pending && pending.sessions.length > 0) {
      setEditor({
        dateKey,
        note: pending.note,
        showError: false,
        sessions: pending.sessions.map((session) => ({
          key: nextKey(),
          clockIn: session.clockIn,
          clockOut: session.clockOut,
        })),
      });
      return;
    }
    setEditor({
      dateKey,
      note: '',
      showError: false,
      sessions:
        closed.length > 0
          ? closed.map((session) => ({
              key: nextKey(),
              clockIn: isoToTimeInput(session.clockInAt, timezone),
              clockOut: session.clockOutAt
                ? isoToTimeInput(session.clockOutAt, timezone)
                : DEFAULT_CLOCK_OUT,
            }))
          : [{ key: nextKey(), clockIn: DEFAULT_CLOCK_IN, clockOut: DEFAULT_CLOCK_OUT }],
    });
  };

  const saveEditor = async () => {
    if (!editor || saving) return;
    const invalid = editor.sessions.some(
      (session) => sessionMinutes(session.clockIn, session.clockOut) == null,
    );
    if (invalid) {
      setEditor({ ...editor, showError: true });
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        dateKey: editor.dateKey,
        note: editor.note,
        sessions: editor.sessions.map((session) => ({
          clockIn: session.clockIn,
          clockOut: session.clockOut,
        })),
      });
      setEditor(null);
    } catch (error) {
      Alert.alert(
        'Could not save hours',
        error instanceof Error ? error.message : 'Could not save hours.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <StoryCard compact style={styles.card} testID="teacher-my-hours-adjust-panel">
        <TeacherMyHoursDateNav
          label={navLabel}
          onPrevious={onPreviousDate}
          onNext={onNextDate}
          fullWidth
          embedded
        />
        <View style={[styles.header, { borderColor: MY_HOURS_CALENDAR_LINE }]}>
          <Text style={[styles.headerTitle, { color: theme.ink }]}>
            Week of {formatShortWeekdayDate(weekStart)}
          </Text>
          <Text style={[styles.headerCopy, { color: theme.muted }]}>
            {adjustmentsRequireApproval
              ? 'Submitted days stay pending until your school approves them.'
              : 'Saved days update your hours right away.'}
          </Text>
        </View>
        {days.map((day, index) => {
          const dateKey = toDateKey(day);
          const isLast = index === days.length - 1;
          const isToday = dateKey === referenceKey;
          const isFuture = dateKey > referenceKey;
          const closed = closedSessionsFor(dateKey);
          const pending = pendingAdjustmentsByDateKey[dateKey] ?? null;
          const openOnDay = activeSession?.workDate === dateKey;
          const canEdit = !isFuture && !openOnDay;
          const summary = isFuture
            ? 'Upcoming'
            : pending
              ? draftSummary(pending.sessions)
              : closed.length > 0
                ? `${formatHoursMinutes(closed.reduce((sum, session) => sum + session.minutes, 0))} · ${closed.length} ${closed.length === 1 ? 'session' : 'sessions'}`
                : openOnDay
                  ? 'In progress'
                  : 'Not logged';

          return (
            <View
              key={dateKey}
              style={[
                styles.row,
                !isLast && { borderBottomWidth: 1, borderColor: MY_HOURS_CALENDAR_LINE },
              ]}>
              <View style={styles.rowMain}>
                <View style={styles.rowTitle}>
                  <Text style={[styles.rowLabel, { color: isFuture ? theme.muted : theme.ink }]}>
                    {formatShortWeekdayDate(day)}
                  </Text>
                  {isToday ? <StoryChip label="Today" tone="info" uppercase={false} /> : null}
                  {pending ? <StoryChip label="Pending" tone="warning" uppercase={false} /> : null}
                  {openOnDay ? (
                    <StoryChip label="In progress" tone="success" uppercase={false} />
                  ) : null}
                </View>
                <Text style={[styles.rowSummary, { color: theme.muted }]}>{summary}</Text>
                {openOnDay ? (
                  <Text style={[styles.rowHint, { color: theme.muted }]}>
                    Clock out before changing this day.
                  </Text>
                ) : null}
              </View>
              {canEdit ? (
                <StoryButton
                  label={pending || closed.length > 0 ? 'Adjust' : 'Add hours'}
                  variant="outline"
                  fullWidth={false}
                  previewSafe
                  onPress={() => openEditor(dateKey)}
                  testID={`teacher-my-hours-adjust-${dateKey}`}
                  style={styles.rowButton}
                />
              ) : null}
            </View>
          );
        })}
      </StoryCard>

      <StoryBottomSheet
        visible={editor != null}
        onClose={() => {
          if (!saving) setEditor(null);
        }}
        accessibilityLabel="Close hour editor">
        {editor ? (
          <View style={styles.sheet}>
            <Text style={[styles.sheetTitle, { color: theme.ink }]}>
              {editor.sessions.length > 0 &&
              (pendingAdjustmentsByDateKey[editor.dateKey] ||
                closedSessionsFor(editor.dateKey).length > 0)
                ? 'Adjust hours'
                : 'Add hours'}
            </Text>
            <Text style={[styles.sheetDate, { color: theme.muted }]}>
              {formatLongWeekdayDate(parseDateKey(editor.dateKey))}
            </Text>
            {editor.sessions.map((session, index) => {
              const minutes = sessionMinutes(session.clockIn, session.clockOut);
              return (
                <View key={session.key} style={[styles.sessionCard, { borderColor: theme.line }]}>
                  <View style={styles.sessionHeader}>
                    <Text style={[styles.sessionLabel, { color: theme.ink }]}>
                      Session {index + 1}
                    </Text>
                    {minutes != null ? (
                      <View style={[styles.durationBadge, { backgroundColor: theme.primarySoft }]}>
                        <Text style={[styles.durationText, { color: theme.primary }]}>
                          {formatHoursMinutes(minutes)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <StoryTimeField
                    label="Clock in"
                    value={session.clockIn}
                    onChange={(clockIn) =>
                      setEditor((current) =>
                        current
                          ? {
                              ...current,
                              showError: false,
                              sessions: current.sessions.map((item) =>
                                item.key === session.key ? { ...item, clockIn } : item,
                              ),
                            }
                          : current,
                      )
                    }
                  />
                  <StoryTimeField
                    label="Clock out"
                    value={session.clockOut}
                    onChange={(clockOut) =>
                      setEditor((current) =>
                        current
                          ? {
                              ...current,
                              showError: false,
                              sessions: current.sessions.map((item) =>
                                item.key === session.key ? { ...item, clockOut } : item,
                              ),
                            }
                          : current,
                      )
                    }
                  />
                  {editor.sessions.length > 1 ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove session ${index + 1}`}
                      onPress={() =>
                        setEditor((current) =>
                          current
                            ? {
                                ...current,
                                sessions: current.sessions.filter((item) => item.key !== session.key),
                              }
                            : current,
                        )
                      }>
                      <Text style={[styles.remove, { color: theme.alert }]}>Remove</Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
            <StoryButton
              label="Add another session"
              variant="outline"
              previewSafe
              onPress={() =>
                setEditor((current) =>
                  current
                    ? {
                        ...current,
                        showError: false,
                        sessions: [
                          ...current.sessions,
                          {
                            key: nextKey(),
                            clockIn: DEFAULT_CLOCK_IN,
                            clockOut: DEFAULT_CLOCK_OUT,
                          },
                        ],
                      }
                    : current,
                )
              }
            />
            <StoryTextField
              label="Note"
              value={editor.note}
              onChangeText={(note) =>
                setEditor((current) => (current ? { ...current, note } : current))
              }
              placeholder="Optional — why you’re changing this day"
              multiline
              style={styles.note}
            />
            {editor.showError ? (
              <Text style={[styles.error, { color: theme.alert }]}>
                Check the times above before saving.
              </Text>
            ) : null}
            <StoryButton
              label={
                saving
                  ? 'Saving…'
                  : adjustmentsRequireApproval
                    ? 'Submit for approval'
                    : 'Save changes'
              }
              loading={saving}
              onPress={() => void saveEditor()}
              testID="teacher-my-hours-adjust-save"
            />
          </View>
        ) : null}
      </StoryBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    gap: Spacing.one,
  },
  headerTitle: {
    fontFamily: StoryFonts.display,
    fontSize: 18,
    fontWeight: '600',
  },
  headerCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  rowTitle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  rowSummary: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  rowHint: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  rowButton: {
    flexGrow: 0,
    alignSelf: 'center',
  },
  sheet: {
    gap: Spacing.three,
  },
  sheetTitle: {
    fontFamily: StoryFonts.display,
    fontSize: 22,
    fontWeight: '600',
  },
  sheetDate: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    marginTop: -Spacing.two,
  },
  sessionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  sessionLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  durationBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  durationText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '700',
  },
  remove: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  note: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  error: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
