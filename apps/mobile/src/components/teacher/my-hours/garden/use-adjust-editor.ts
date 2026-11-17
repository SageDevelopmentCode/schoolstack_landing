import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { closeThen } from '@/components/parent/garden/feedback';
import { READ_ONLY_NOTICE, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import {
  isoToTimeInput,
  validateAdjustmentSessions,
  type AdjustSessionDraft,
} from '@/components/teacher/my-hours/garden/adjust-validation';
import type {
  MyHoursAdjustInput,
  MyHoursAdjustResult,
  TeacherMyHoursController,
} from '@/components/teacher/my-hours/garden/use-teacher-my-hours-controller';
import { haptic } from '@/lib/haptics';
import { defaultNextAdjustmentSession } from '@/lib/teacher/my-hours/adjustment-sessions';
import { addDays, startOfWeekMonday, toDateKey } from '@/lib/teacher/my-hours/format-duration';
import { isDateKeyInLoadedRange } from '@/lib/teacher/my-hours/my-hours-range-merge';

const DEFAULT_CLOCK_IN = '08:00';
const DEFAULT_CLOCK_OUT = '15:00';

type EditorState = {
  dateKey: string;
  sessions: AdjustSessionDraft[];
  note: string;
  /** Editing a day that already has hours or a pending change ("Adjust hours"). */
  hasExisting: boolean;
  pending: boolean;
  snapshot: string;
};

function snapshotOf(sessions: AdjustSessionDraft[], note: string): string {
  return JSON.stringify({ s: sessions.map(({ clockIn, clockOut }) => [clockIn, clockOut]), note });
}

/**
 * The adjust editor (sheet state + rules), moved from the old adjust panel:
 * prefill from the pending change → closed sessions → 08:00–15:00, the same
 * "week loaded" gate, add / remove sessions, the same save rule. Adds per-session
 * errors, dirty tracking and in-sheet status (toasts sit behind the sheet).
 */
export function useAdjustEditor({
  controller,
  readOnly,
  onSaved,
}: {
  controller: TeacherMyHoursController;
  readOnly: boolean;
  onSaved: (result: MyHoursAdjustResult, input: MyHoursAdjustInput) => void;
}) {
  const {
    pageData,
    focusDate,
    referenceDate,
    adjustWeekLoading,
    view,
    pendingEditorDateKey,
    clearPendingEditor,
    submitAdjustment,
    reportError,
  } = controller;
  const keyRef = useRef(0);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<AdminSheetNotice | null>(null);

  const nextKey = useCallback(() => {
    keyRef.current += 1;
    return `adjust-session-${keyRef.current}`;
  }, []);

  const weekStart = startOfWeekMonday(focusDate);
  const weekKey = toDateKey(weekStart);
  const weekEndKey = toDateKey(addDays(weekStart, 6));
  const referenceKey = toDateKey(referenceDate);

  const sessionsKnownFor = useCallback(
    (dateKey: string) =>
      pageData != null && isDateKeyInLoadedRange(dateKey, pageData.rangeFrom, pageData.rangeTo),
    [pageData],
  );

  const closedSessionsFor = useCallback(
    (dateKey: string) =>
      (pageData?.sessionsByDateKey[dateKey] ?? []).filter((session) => session.clockOutAt != null),
    [pageData],
  );

  /** Same rule as the old row button: past or today, no open session that day, week loaded. */
  const canEditDay = useCallback(
    (dateKey: string) =>
      dateKey <= referenceKey &&
      pageData?.activeSession?.workDate !== dateKey &&
      sessionsKnownFor(dateKey) &&
      !adjustWeekLoading,
    [adjustWeekLoading, pageData?.activeSession?.workDate, referenceKey, sessionsKnownFor],
  );

  const openEditor = useCallback(
    (dateKey: string) => {
      if (!pageData || adjustWeekLoading || !sessionsKnownFor(dateKey)) return;
      const closed = closedSessionsFor(dateKey);
      const pending = pageData.pendingAdjustmentsByDateKey?.[dateKey];
      let sessions: AdjustSessionDraft[];
      let note = '';
      if (pending && pending.sessions.length > 0) {
        note = pending.note;
        sessions = pending.sessions.map((session) => ({
          key: nextKey(),
          clockIn: session.clockIn,
          clockOut: session.clockOut,
        }));
      } else {
        sessions =
          closed.length > 0
            ? closed.map((session) => ({
                key: nextKey(),
                clockIn: isoToTimeInput(session.clockInAt, pageData.timezone),
                clockOut: session.clockOutAt
                  ? isoToTimeInput(session.clockOutAt, pageData.timezone)
                  : DEFAULT_CLOCK_OUT,
              }))
            : [{ key: nextKey(), clockIn: DEFAULT_CLOCK_IN, clockOut: DEFAULT_CLOCK_OUT }];
      }
      setNotice(null);
      setEditor({
        dateKey,
        sessions,
        note,
        hasExisting: Boolean(pending) || closed.length > 0,
        pending: Boolean(pending),
        snapshot: snapshotOf(sessions, note),
      });
    },
    [adjustWeekLoading, closedSessionsFor, nextKey, pageData, sessionsKnownFor],
  );

  // Day view "Add hours for this day": open the editor once that week has loaded.
  useEffect(() => {
    if (!pendingEditorDateKey || view !== 'adjust') return;
    if (adjustWeekLoading || !sessionsKnownFor(pendingEditorDateKey)) return;
    const dateKey = pendingEditorDateKey;
    queueMicrotask(() => {
      clearPendingEditor();
      if (canEditDay(dateKey)) openEditor(dateKey);
    });
  }, [
    adjustWeekLoading,
    canEditDay,
    clearPendingEditor,
    openEditor,
    pendingEditorDateKey,
    sessionsKnownFor,
    view,
  ]);

  // Same visibility gate as the old panel: hide while the week changes or reloads.
  const visibleEditor =
    editor &&
    editor.dateKey >= weekKey &&
    editor.dateKey <= weekEndKey &&
    !adjustWeekLoading &&
    sessionsKnownFor(editor.dateKey)
      ? editor
      : null;

  // Keep the last editor while the sheet animates closed.
  const [shown, setShown] = useState<EditorState | null>(visibleEditor);
  if (visibleEditor && visibleEditor !== shown) setShown(visibleEditor);
  const display = visibleEditor ?? shown;

  const validation = useMemo(
    () => validateAdjustmentSessions(display?.sessions ?? []),
    [display?.sessions],
  );
  const isDirty = display != null && snapshotOf(display.sessions, display.note) !== display.snapshot;

  const updateSessions = useCallback(
    (update: (sessions: AdjustSessionDraft[]) => AdjustSessionDraft[]) => {
      setNotice(null);
      setEditor((current) => (current ? { ...current, sessions: update(current.sessions) } : current));
    },
    [],
  );

  const setTime = useCallback(
    (key: string, field: 'clockIn' | 'clockOut', value: string) =>
      updateSessions((sessions) =>
        sessions.map((session) => (session.key === key ? { ...session, [field]: value } : session)),
      ),
    [updateSessions],
  );

  const addSession = useCallback(() => {
    haptic.tap();
    updateSessions((sessions) => {
      const next = defaultNextAdjustmentSession(sessions);
      return [...sessions, { key: nextKey(), clockIn: next.clockIn, clockOut: next.clockOut }];
    });
  }, [nextKey, updateSessions]);

  const removeSession = useCallback(
    (key: string) => {
      haptic.warning();
      updateSessions((sessions) =>
        sessions.length > 1 ? sessions.filter((session) => session.key !== key) : sessions,
      );
    },
    [updateSessions],
  );

  const setNote = useCallback((note: string) => {
    setEditor((current) => (current ? { ...current, note } : current));
  }, []);

  const close = useCallback(() => {
    if (saving) return;
    setEditor(null);
  }, [saving]);

  const save = useCallback(async () => {
    if (!visibleEditor || saving) return;
    if (readOnly) {
      setNotice(READ_ONLY_NOTICE);
      return;
    }
    if (!validation.valid) {
      haptic.warning();
      setNotice({
        tone: 'warning',
        title: 'Check the times above before saving.',
        description: 'Each session needs a clock-out after its clock-in, and sessions can’t overlap.',
      });
      return;
    }
    const input: MyHoursAdjustInput = {
      dateKey: visibleEditor.dateKey,
      note: visibleEditor.note,
      sessions: visibleEditor.sessions.map((session) => ({
        clockIn: session.clockIn,
        clockOut: session.clockOut,
      })),
    };
    setSaving(true);
    setNotice(null);
    try {
      const result = await submitAdjustment(input);
      haptic.success();
      closeThen(
        () => setEditor(null),
        () => onSaved(result, input),
      );
    } catch (err) {
      void reportError('my_hours.adjust', err);
      haptic.error();
      setNotice({
        tone: 'error',
        title: 'Couldn’t save your hours',
        description: `${err instanceof Error && err.message ? err.message : 'Could not save hours.'} Nothing was changed — try again.`,
      });
    } finally {
      setSaving(false);
    }
  }, [onSaved, readOnly, reportError, saving, submitAdjustment, validation.valid, visibleEditor]);

  return {
    visible: visibleEditor != null,
    editor: display,
    saving,
    notice,
    isDirty,
    validation,
    requireApproval: pageData?.adjustmentsRequireApproval !== false,
    canEditDay,
    sessionsKnownFor,
    closedSessionsFor,
    openEditor,
    setTime,
    addSession,
    removeSession,
    setNote,
    close,
    save,
  };
}

export type AdjustEditor = ReturnType<typeof useAdjustEditor>;
