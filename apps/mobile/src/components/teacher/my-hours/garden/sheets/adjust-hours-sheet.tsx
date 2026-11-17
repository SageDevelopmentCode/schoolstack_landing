import { StyleSheet, Text, View } from 'react-native';

import { GInlineBanner, GTextField, GTimeField } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GChip, GLink, GOutlineButton } from '@/components/parent/garden/ui';
import { AdminFormSheet } from '@/components/school-admin/garden/admin-sheet';
import {
  sessionCountLabel,
  sessionMinutes,
} from '@/components/teacher/my-hours/garden/adjust-validation';
import type { AdjustEditor } from '@/components/teacher/my-hours/garden/use-adjust-editor';
import { formatHoursMinutes, formatLongWeekdayDate, parseDateKey } from '@/lib/teacher/my-hours/format-duration';

/**
 * Add / adjust hours for one day. Sessions as cards with two time fields and a
 * live duration, per-session errors, a running total in the footer, and the
 * note on the approved keyboard path (`AdminFormSheet`).
 */
export function AdjustHoursSheet({ editor }: { editor: AdjustEditor }) {
  const draft = editor.editor;
  const { validation, requireApproval } = editor;
  const count = draft?.sessions.length ?? 0;

  const statusLine = !draft
    ? null
    : validation.valid
      ? `${formatHoursMinutes(validation.totalMinutes)} across ${sessionCountLabel(count)} · ${
          requireApproval ? 'goes to your school for approval' : 'saves right away'
        }`
      : 'Fix the highlighted times to save.';

  return (
    <AdminFormSheet
      visible={editor.visible}
      onClose={editor.close}
      title={draft?.hasExisting ? 'Adjust hours' : 'Add hours'}
      subtitle={draft ? formatLongWeekdayDate(parseDateKey(draft.dateKey)) : null}
      headerAside={draft?.pending ? <GChip label="Pending approval" tone="warning" /> : undefined}
      isDirty={editor.isDirty}
      saving={editor.saving}
      canSave={validation.valid}
      saveLabel={requireApproval ? 'Submit for approval' : 'Save changes'}
      saveIcon={requireApproval ? 'paper-plane-outline' : 'checkmark'}
      saveTestID="teacher-my-hours-adjust-save"
      onSave={() => void editor.save()}
      statusLine={statusLine}
      notice={editor.notice}
      accessibilityLabel="Close hour editor"
      closeAccessibilityLabel="Close hour editor">
      {draft ? (
        <View style={styles.body}>
          {draft.pending ? (
            <GInlineBanner
              tone="info"
              title="Editing the change you sent earlier"
              description="It’s still waiting for your school to approve it."
            />
          ) : null}

          {draft.sessions.map((session, index) => {
            const minutes = sessionMinutes(session.clockIn, session.clockOut);
            const error = validation.errors[session.key] ?? null;
            return (
              <View
                key={session.key}
                style={[styles.session, error ? styles.sessionError : null]}
                accessibilityLabel={`Session ${index + 1}`}>
                <View style={styles.sessionHead}>
                  <Text style={styles.sessionTitle}>Session {index + 1}</Text>
                  {minutes != null ? (
                    <GChip tone="success" icon="time-outline" label={formatHoursMinutes(minutes)} />
                  ) : null}
                  {count > 1 ? (
                    <GLink
                      label="Remove"
                      icon="trash-outline"
                      onPress={() => editor.removeSession(session.key)}
                      accessibilityLabel={`Remove session ${index + 1}`}
                      style={styles.remove}
                    />
                  ) : null}
                </View>
                <GTimeField
                  label="Clock in"
                  value={session.clockIn}
                  onChange={(value) => editor.setTime(session.key, 'clockIn', value)}
                  disabled={editor.saving}
                />
                <GTimeField
                  label="Clock out"
                  value={session.clockOut}
                  onChange={(value) => editor.setTime(session.key, 'clockOut', value)}
                  error={error}
                  disabled={editor.saving}
                />
              </View>
            );
          })}

          <GOutlineButton
            label="Add another session"
            icon="add"
            onPress={editor.addSession}
            accessibilityHint="Adds a session that starts when the last one ends"
          />

          <GTextField
            label="Note"
            optional
            value={draft.note}
            onChangeText={editor.setNote}
            placeholder="Optional — why you’re changing this day"
            multiline
            editable={!editor.saving}
          />
        </View>
      ) : null}
    </AdminFormSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: 14 },
  session: {
    gap: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: Garden.white,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
  },
  sessionError: { borderColor: '#C2714F', backgroundColor: '#FFF8F3' },
  sessionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 16, color: Garden.ink },
  remove: { marginLeft: 'auto' },
});
