import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ParentCommitteeTaskCard } from '@/components/parent/committees/parent-committee-task-card';
import {
  ParentCommitteeTaskDetailSheet,
  type CommitteeTaskFormState,
} from '@/components/parent/committees/parent-committee-task-detail-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  createCommitteeTask,
  deleteCommitteeTask,
  updateCommitteeTask,
} from '@/lib/parent/committees/mutations';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import type { CommitteeTask, CommitteeTaskStatus } from '@/lib/parent/parent-committees-types';
import { TASK_STATUS_LABELS } from '@/lib/parent/parent-committees-types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const COLUMNS: CommitteeTaskStatus[] = ['open', 'claimed', 'in_progress', 'done'];

export function ParentCommitteeTasksSection({
  committee,
  organizationId,
  supabase,
  currentMemberId,
  readOnly = false,
  isAdmin = false,
  onRefresh,
}: ParentCommitteeSectionProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [panelMode, setPanelMode] = useState<'create' | 'edit' | null>(null);
  const [selectedTask, setSelectedTask] = useState<CommitteeTask | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<CommitteeTaskStatus>('open');
  const [saving, setSaving] = useState(false);

  const taskGroups = committee.config.taskGroups ?? [{ id: 'general', label: 'General' }];

  const tasksByStatus = useMemo(() => {
    const grouped: Record<CommitteeTaskStatus, CommitteeTask[]> = {
      open: [],
      claimed: [],
      in_progress: [],
      done: [],
    };
    for (const task of committee.tasks) {
      grouped[task.status].push(task);
    }
    return grouped;
  }, [committee.tasks]);

  const openCreate = useCallback((status: CommitteeTaskStatus = 'open') => {
    setSelectedTask(null);
    setDefaultStatus(status);
    setPanelMode('create');
  }, []);

  const openEdit = useCallback((task: CommitteeTask) => {
    setSelectedTask(task);
    setDefaultStatus(task.status);
    setPanelMode('edit');
  }, []);

  const closePanel = useCallback(() => {
    setPanelMode(null);
    setSelectedTask(null);
  }, []);

  const handleSave = useCallback(async (data: CommitteeTaskFormState) => {
    setSaving(true);
    try {
      if (panelMode === 'create') {
        await createCommitteeTask(supabase, committee.id, {
          title: data.title.trim(),
          description: data.description || undefined,
          group: data.group,
          status: data.status,
          assigneeMemberId: data.assigneeMemberId ?? undefined,
          dueDate: data.dueDate || undefined,
          createdByMemberId: currentMemberId,
        });
      } else if (selectedTask) {
        await updateCommitteeTask(supabase, selectedTask.id, {
          title: data.title.trim(),
          description: data.description,
          group: data.group,
          status: data.status,
          assigneeMemberId: data.assigneeMemberId,
          dueDate: data.dueDate || null,
        });
      }
      closePanel();
      await onRefresh();
    } catch (error) {
      reportError('committees.tasks.save', error, {
        entityType: 'committee',
        entityId: committee.id,
      });
    } finally {
      setSaving(false);
    }
  }, [closePanel, committee.id, currentMemberId, onRefresh, panelMode, reportError, selectedTask, supabase]);

  const handleDelete = useCallback(async () => {
    if (!selectedTask) return;
    setSaving(true);
    try {
      await deleteCommitteeTask(supabase, selectedTask.id);
      closePanel();
      await onRefresh();
    } catch (error) {
      reportError('committees.tasks.delete', error, {
        entityType: 'committee_task',
        entityId: selectedTask.id,
      });
    } finally {
      setSaving(false);
    }
  }, [closePanel, onRefresh, reportError, selectedTask, supabase]);

  return (
    <View style={styles.container}>
      <StoryDetailSection title="Tasks">
        {!readOnly ? (
          <StoryButton
            label="Add task"
            previewSafe
            onPress={() => openCreate('open')}
            style={styles.addButton}
          />
        ) : null}

        {committee.tasks.length === 0 ? (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>No tasks yet.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.board}>
            {COLUMNS.map((status) => (
              <View key={status} style={styles.column}>
                <View style={styles.columnHeader}>
                  <Text style={[styles.columnTitle, { color: theme.ink }]}>
                    {TASK_STATUS_LABELS[status]}
                  </Text>
                  <Text style={[styles.columnCount, { color: theme.muted }]}>
                    {tasksByStatus[status].length}
                  </Text>
                </View>
                <View style={styles.columnList}>
                  {tasksByStatus[status].map((task) => (
                    <ParentCommitteeTaskCard key={task.id} task={task} onPress={() => openEdit(task)} />
                  ))}
                </View>
                {!readOnly ? (
                  <StoryButton
                    label="Add"
                    previewSafe
                    onPress={() => openCreate(status)}
                    style={styles.columnAdd}
                  />
                ) : null}
              </View>
            ))}
          </ScrollView>
        )}
      </StoryDetailSection>

      <ParentCommitteeTaskDetailSheet
        visible={panelMode != null}
        mode={panelMode === 'create' ? 'create' : 'edit'}
        task={selectedTask}
        defaultStatus={defaultStatus}
        taskGroups={taskGroups}
        members={committee.members}
        readOnly={readOnly}
        saving={saving}
        onClose={closePanel}
        onSave={handleSave}
        onDelete={panelMode === 'edit' && !readOnly ? handleDelete : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  addButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.two,
  },
  board: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  column: {
    width: 280,
    gap: Spacing.two,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  columnTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  columnCount: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  columnList: {
    gap: Spacing.two,
  },
  columnAdd: {
    alignSelf: 'flex-start',
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
});
