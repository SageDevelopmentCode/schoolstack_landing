import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// keyboard: verified on device — committee task sheet uses ParentBottomSheet (description field)

import { GChoiceChips, GDateField, GInlineBanner, GTextField } from '@/components/parent/garden/fields';
import { GOutlineButton, GToyButton } from '@/components/parent/garden/ui';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { TASK_STATUSES, TASK_STATUS_LABELS } from '@/lib/parent/parent-committees-garden';
import type {
  CommitteeMember,
  CommitteeTask,
  CommitteeTaskGroupDef,
  CommitteeTaskStatus,
} from '@/lib/parent/parent-committees-types';

export type CommitteeTaskFormState = {
  title: string;
  description: string;
  group: string;
  status: CommitteeTaskStatus;
  assigneeMemberId: string | null;
  dueDate: string;
};

const UNASSIGNED = '__unassigned__';

function buildForm(
  mode: 'create' | 'edit',
  task: CommitteeTask | null,
  defaultStatus: CommitteeTaskStatus,
  defaultGroup: string,
): CommitteeTaskFormState {
  if (mode === 'edit' && task) {
    return {
      title: task.title,
      description: task.description ?? '',
      group: task.group,
      status: task.status,
      assigneeMemberId: task.assigneeId ?? null,
      dueDate: task.dueDate ?? '',
    };
  }
  return { title: '', description: '', group: defaultGroup, status: defaultStatus, assigneeMemberId: null, dueDate: '' };
}

/** Add or edit a committee task. Same fields as before; chips are labelled radios now. */
export function TaskSheet({
  visible,
  mode,
  task,
  defaultStatus,
  taskGroups,
  members,
  currentMemberId,
  readOnly,
  saving,
  error,
  onBlocked,
  onClose,
  onSave,
  onDelete,
}: {
  visible: boolean;
  mode: 'create' | 'edit';
  task: CommitteeTask | null;
  defaultStatus: CommitteeTaskStatus;
  taskGroups: CommitteeTaskGroupDef[];
  members: CommitteeMember[];
  currentMemberId?: string;
  readOnly: boolean;
  saving: boolean;
  error: string | null;
  onBlocked: () => void;
  onClose: () => void;
  onSave: (form: CommitteeTaskFormState) => void;
  onDelete?: () => void;
}) {
  const keyboardOpen = useKeyboardHeight() > 0;
  const defaultGroup = taskGroups[0]?.id ?? 'general';
  const [form, setForm] = useState(() => buildForm(mode, task, defaultStatus, defaultGroup));
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm(buildForm(mode, task, defaultStatus, defaultGroup));
      setShowErrors(false);
    }
  }, [defaultGroup, defaultStatus, mode, task, visible]);

  const activeMembers = members.filter((member) => member.status === 'active');
  const titleError = showErrors && !form.title.trim() ? 'Give the task a title.' : null;

  const submit = () => {
    if (readOnly) return onBlocked();
    if (!form.title.trim()) {
      setShowErrors(true);
      return;
    }
    onSave(form);
  };

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? 'Add task' : (task?.title ?? 'Task')}
      subtitle={mode === 'create' ? 'New committee task' : 'Committee task'}
      accessibilityLabel="Close task">
      <View style={styles.form}>
        <GTextField
          label="Title"
          value={form.title}
          onChangeText={(title) => setForm((current) => ({ ...current, title }))}
          placeholder="Task title"
          disabled={readOnly}
          error={titleError}
        />
        <GTextField
          label="Description"
          optional
          value={form.description}
          onChangeText={(description) => setForm((current) => ({ ...current, description }))}
          placeholder="Optional details"
          multiline
          disabled={readOnly}
        />
        <GChoiceChips
          label="Status"
          value={form.status}
          onChange={(status) => setForm((current) => ({ ...current, status }))}
          disabled={readOnly}
          onBlocked={onBlocked}
          options={TASK_STATUSES.map((status) => ({
            id: status,
            label: TASK_STATUS_LABELS[status],
            testID: `committee-task-status-${status}`,
          }))}
        />
        <GChoiceChips
          label="Assignee"
          value={form.assigneeMemberId ?? UNASSIGNED}
          onChange={(id) => setForm((current) => ({ ...current, assigneeMemberId: id === UNASSIGNED ? null : id }))}
          disabled={readOnly}
          onBlocked={onBlocked}
          helper={
            currentMemberId && form.assigneeMemberId !== currentMemberId && !readOnly
              ? 'Tip: pick your own name to claim this task.'
              : undefined
          }
          options={[
            { id: UNASSIGNED, label: 'Unassigned' },
            ...activeMembers.map((member) => ({
              id: member.id,
              label: member.id === currentMemberId ? `${member.name} (you)` : member.name,
            })),
          ]}
        />
        <GDateField
          label="Due date"
          optional
          value={form.dueDate}
          onChange={(dueDate) => setForm((current) => ({ ...current, dueDate }))}
          placeholder="No due date"
          clearable
          disabled={readOnly}
        />
        {error ? <GInlineBanner tone="error" title="Couldn't save the task" description={`${error} Your changes are still here.`} /> : null}
        {!readOnly && !keyboardOpen ? (
          <View style={styles.actions}>
            <GToyButton
              label={saving ? 'Saving…' : mode === 'create' ? 'Create task' : 'Save changes'}
              icon="checkmark"
              size="md"
              fullWidth
              loading={saving}
              onPress={submit}
            />
            {mode === 'edit' && onDelete ? (
              <GOutlineButton label="Delete task" icon="trash-outline" onPress={onDelete} style={styles.center} />
            ) : null}
          </View>
        ) : null}
      </View>
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  actions: { gap: 10, marginTop: 4 },
  center: { alignSelf: 'center' },
});
