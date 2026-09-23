import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryChip } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type {
  CommitteeMember,
  CommitteeTask,
  CommitteeTaskGroupDef,
  CommitteeTaskStatus,
} from '@/lib/parent/parent-committees-types';
import { TASK_STATUS_LABELS } from '@/lib/parent/parent-committees-types';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

export type CommitteeTaskFormState = {
  title: string;
  description: string;
  group: string;
  status: CommitteeTaskStatus;
  assigneeMemberId: string | null;
  dueDate: string;
};

type ParentCommitteeTaskDetailSheetProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  task: CommitteeTask | null;
  defaultStatus: CommitteeTaskStatus;
  taskGroups: CommitteeTaskGroupDef[];
  members: CommitteeMember[];
  readOnly?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (data: CommitteeTaskFormState) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
};

const STATUS_OPTIONS: CommitteeTaskStatus[] = ['open', 'claimed', 'in_progress', 'done'];

function buildFormState(
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

  return {
    title: '',
    description: '',
    group: defaultGroup,
    status: defaultStatus,
    assigneeMemberId: null,
    dueDate: '',
  };
}

export function ParentCommitteeTaskDetailSheet({
  visible,
  mode,
  task,
  defaultStatus,
  taskGroups,
  members,
  readOnly = false,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: ParentCommitteeTaskDetailSheetProps) {
  const theme = useParentTheme();
  const defaultGroup = taskGroups[0]?.id ?? 'general';
  const [form, setForm] = useState(() => buildFormState(mode, task, defaultStatus, defaultGroup));

  useEffect(() => {
    if (visible) {
      setForm(buildFormState(mode, task, defaultStatus, defaultGroup));
    }
  }, [defaultGroup, defaultStatus, mode, task, visible]);

  const canSave = Boolean(form.title.trim());

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? 'Add task' : task?.title ?? 'Task'}>
      <ScrollView contentContainerStyle={styles.form}>
        <Field label="Title" theme={theme}>
          <TextInput
            editable={!readOnly}
            value={form.title}
            onChangeText={(value) => setForm((current) => ({ ...current, title: value }))}
            placeholder="Task title"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.ink, borderColor: theme.line }]}
          />
        </Field>

        <Field label="Description" theme={theme}>
          <TextInput
            editable={!readOnly}
            value={form.description}
            onChangeText={(value) => setForm((current) => ({ ...current, description: value }))}
            placeholder="Optional details"
            placeholderTextColor={theme.muted}
            multiline
            style={[styles.input, styles.multiline, { color: theme.ink, borderColor: theme.line }]}
          />
        </Field>

        <Field label="Status" theme={theme}>
          <View style={styles.chipRow}>
            {STATUS_OPTIONS.map((status) => (
              <Pressable
                key={status}
                disabled={readOnly}
                onPress={() => setForm((current) => ({ ...current, status }))}>
                <StoryChip
                  tone={form.status === status ? 'success' : 'info'}
                  label={TASK_STATUS_LABELS[status]}
                />
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Assignee" theme={theme}>
          <View style={styles.chipRow}>
            <Pressable
              disabled={readOnly}
              onPress={() => setForm((current) => ({ ...current, assigneeMemberId: null }))}>
              <StoryChip
                tone={form.assigneeMemberId == null ? 'success' : 'info'}
                label="Unassigned"
              />
            </Pressable>
            {members
              .filter((member) => member.status === 'active')
              .map((member) => (
                <Pressable
                  key={member.id}
                  disabled={readOnly}
                  onPress={() => setForm((current) => ({ ...current, assigneeMemberId: member.id }))}>
                  <StoryChip
                    tone={form.assigneeMemberId === member.id ? 'success' : 'info'}
                    label={member.name}
                    uppercase={false}
                  />
                </Pressable>
              ))}
          </View>
        </Field>

        <Field label="Due date (YYYY-MM-DD)" theme={theme}>
          <TextInput
            editable={!readOnly}
            value={form.dueDate}
            onChangeText={(value) => setForm((current) => ({ ...current, dueDate: value }))}
            placeholder="Optional"
            placeholderTextColor={theme.muted}
            autoCapitalize="none"
            style={[styles.input, { color: theme.ink, borderColor: theme.line }]}
          />
        </Field>

        {!readOnly ? (
          <View style={styles.actions}>
            <StoryButton
              label={saving ? 'Saving…' : mode === 'create' ? 'Create task' : 'Save changes'}
              previewSafe
              disabled={!canSave || saving}
              onPress={() => void onSave(form)}
            />
            {mode === 'edit' && onDelete ? (
              <StoryButton label="Delete task" previewSafe onPress={() => void onDelete()} />
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </ParentBottomSheet>
  );
}

function Field({
  label,
  theme,
  children,
}: {
  label: string;
  theme: { muted: string };
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  field: {
    gap: Spacing.one,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actions: {
    gap: Spacing.two,
  },
});
