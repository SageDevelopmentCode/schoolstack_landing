import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TaskSheet, type CommitteeTaskFormState } from '@/components/parent/committees/garden/sheets/task-sheet';
import { closeThen, confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GSegmented } from '@/components/parent/garden/segmented';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden } from '@/components/parent/garden/tokens';
import { GCard, GChip, GHand, GPressable, GTick, GRing, GToyButton, gText } from '@/components/parent/garden/ui';
import { notifyCommitteeTaskAssignment } from '@/lib/committees/notify-committee-task-assignment';
import { createCommitteeTask, deleteCommitteeTask, updateCommitteeTask } from '@/lib/parent/committees/mutations';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_STATUS_TONE,
  countTasksByStatus,
  taskSavedToast,
} from '@/lib/parent/parent-committees-garden';
import type { CommitteeTask, CommitteeTaskStatus } from '@/lib/parent/parent-committees-types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

function dueLabel(dueDate: string): string {
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function TaskRow({ task, mine, onPress }: { task: CommitteeTask; mine: boolean; onPress: () => void }) {
  return (
    <GPressable
      accessibilityLabel={`${task.title}, ${TASK_STATUS_LABELS[task.status]}, ${task.assigneeName ?? 'Unassigned'}${task.dueDate ? `, due ${dueLabel(task.dueDate)}` : ''}. Open task`}
      pressedScale={0.98}
      onPress={onPress}
      style={[styles.task, mine && styles.taskMine]}>
      {task.status === 'done' ? <GTick size={24} /> : <GRing size={24} />}
      <View style={styles.flex}>
        <Text style={[gText.itemTitle, task.status === 'done' && styles.done]} numberOfLines={2}>
          {task.title}
        </Text>
        {task.description ? (
          <Text style={gText.meta} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Ionicons name="person-outline" size={13} color={Garden.soft} />
            <Text style={gText.meta}>{mine ? 'You' : (task.assigneeName ?? 'Unassigned')}</Text>
          </View>
          {task.dueDate ? (
            <View style={styles.meta}>
              <Ionicons name="time-outline" size={13} color={Garden.soft} />
              <Text style={gText.meta}>Due {dueLabel(task.dueDate)}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Garden.ink60} />
    </GPressable>
  );
}

/**
 * Tasks as a status switcher over a stacked list (the kanban columns, phone
 * sized). Same mutations, assignment notification and operation names.
 */
export function WorkspaceTasksSection({
  committee,
  organizationId,
  supabase,
  currentMemberId,
  readOnly = false,
  isAdmin = false,
  portalApiNamespace = 'parent-portal',
  onRefresh,
  initialTaskId,
}: ParentCommitteeSectionProps) {
  const toast = useGardenToast();
  const gate = useGardenReadOnlyGate();
  const { reportError } = useMobileErrorReporter(organizationId);
  const deepLinkHandled = useRef(false);

  const [status, setStatus] = useState<CommitteeTaskStatus>('open');
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | null>(null);
  const [selectedTask, setSelectedTask] = useState<CommitteeTask | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<CommitteeTaskStatus>('open');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taskGroups = committee.config.taskGroups ?? [{ id: 'general', label: 'General' }];
  const counts = useMemo(() => countTasksByStatus(committee.tasks), [committee.tasks]);
  const visible = useMemo(() => committee.tasks.filter((task) => task.status === status), [committee.tasks, status]);

  const notifyBlocked = useCallback(() => {
    if (gate.readOnly) return gate.notifyReadOnly();
    toast.info('Only committee members can edit tasks', { id: 'committee-tasks-readonly' });
  }, [gate, toast]);

  const openCreate = useCallback(
    (nextStatus: CommitteeTaskStatus) => {
      if (readOnly) return notifyBlocked();
      setSelectedTask(null);
      setDefaultStatus(nextStatus);
      setError(null);
      setPanelMode('create');
    },
    [notifyBlocked, readOnly],
  );

  const openEdit = useCallback((task: CommitteeTask) => {
    setSelectedTask(task);
    setDefaultStatus(task.status);
    setError(null);
    setPanelMode('edit');
  }, []);

  useEffect(() => {
    if (!initialTaskId || deepLinkHandled.current) return;
    const match = committee.tasks.find((task) => task.id === initialTaskId);
    if (!match) return;
    deepLinkHandled.current = true;
    setStatus(match.status);
    queueMicrotask(() => openEdit(match));
  }, [committee.tasks, initialTaskId, openEdit]);

  const closePanel = useCallback(() => {
    setPanelMode(null);
    setSelectedTask(null);
  }, []);

  const handleSave = useCallback(
    async (data: CommitteeTaskFormState) => {
      setSaving(true);
      setError(null);
      const previous = panelMode === 'edit' ? selectedTask : null;
      const previousAssigneeMemberId = selectedTask?.assigneeId ?? null;
      let savedTaskId: string | null = null;
      try {
        if (panelMode === 'create') {
          const created = await createCommitteeTask(supabase, committee.id, {
            title: data.title.trim(),
            description: data.description || undefined,
            group: data.group,
            status: data.status,
            assigneeMemberId: data.assigneeMemberId ?? undefined,
            dueDate: data.dueDate || undefined,
            createdByMemberId: currentMemberId,
            workspaceRecord: { organizationId, portalApiNamespace: isAdmin ? 'school-admin' : portalApiNamespace },
          });
          savedTaskId = created.id;
        } else if (selectedTask) {
          await updateCommitteeTask(supabase, selectedTask.id, {
            title: data.title.trim(),
            description: data.description,
            group: data.group,
            status: data.status,
            assigneeMemberId: data.assigneeMemberId,
            dueDate: data.dueDate || null,
          });
          savedTaskId = selectedTask.id;
        }
        const copy = taskSavedToast(previous, { title: data.title.trim(), status: data.status });
        closeThen(closePanel, () => {
          setStatus(data.status);
          toast.success(copy.title, { description: copy.description });
        });
        await onRefresh();
        if (savedTaskId) {
          const taskId = savedTaskId;
          void notifyCommitteeTaskAssignment({
            portalApiNamespace: isAdmin ? 'school-admin' : portalApiNamespace,
            taskId,
            organizationId,
            previousAssigneeMemberId: panelMode === 'edit' ? previousAssigneeMemberId : null,
          }).catch((notifyError) => {
            reportError('committees.tasks.notify_assignment', notifyError, {
              entityType: 'committee_task',
              entityId: taskId,
            });
          });
        }
      } catch (saveError) {
        reportError('committees.tasks.save', saveError, { entityType: 'committee', entityId: committee.id });
        setError(saveError instanceof Error ? saveError.message : 'Failed to save task.');
      } finally {
        setSaving(false);
      }
    },
    [closePanel, committee.id, currentMemberId, isAdmin, onRefresh, organizationId, panelMode, portalApiNamespace, reportError, selectedTask, supabase, toast],
  );

  const handleDelete = useCallback(async () => {
    if (!selectedTask) return;
    const confirmed = await confirmDestructive({
      title: 'Delete task?',
      message: `"${selectedTask.title}" will be removed from the board for everyone.`,
    });
    if (!confirmed) return;
    setSaving(true);
    setError(null);
    const title = selectedTask.title;
    try {
      await deleteCommitteeTask(supabase, selectedTask.id);
      closeThen(closePanel, () => toast.success('Task deleted', { description: `"${title}" is off the board.` }));
      await onRefresh();
    } catch (deleteError) {
      reportError('committees.tasks.delete', deleteError, { entityType: 'committee_task', entityId: selectedTask.id });
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete task.');
    } finally {
      setSaving(false);
    }
  }, [closePanel, onRefresh, reportError, selectedTask, supabase, toast]);

  const myOpen = currentMemberId
    ? committee.tasks.filter((task) => task.assigneeId === currentMemberId && task.status !== 'done').length
    : 0;

  return (
    <View style={styles.container}>
      <GCard
        kicker="Tasks"
        title={myOpen > 0 ? `${myOpen} on your plate` : 'Committee tasks'}
        index={0}
        action={myOpen > 0 ? <GChip label="Assigned to you" tone="info" /> : null}>
        <View style={styles.body}>
          {currentMemberId ? (
            <GToyButton label="Add task" icon="add" onPress={() => openCreate(status === 'done' ? 'open' : status)} />
          ) : null}
          {committee.tasks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={gText.meta}>No tasks yet.</Text>
              <GHand>Add the first one.</GHand>
            </View>
          ) : (
            <>
              <GSegmented
                scrollable
                accessibilityLabel="Task status"
                items={TASK_STATUSES.map((id) => ({
                  id,
                  label: `${TASK_STATUS_LABELS[id]} · ${counts[id]}`,
                  testID: `committee-tasks-tab-${id}`,
                }))}
                activeId={status}
                onChange={setStatus}
              />
              {visible.length === 0 ? (
                <View style={styles.emptyColumn}>
                  <GChip label={TASK_STATUS_LABELS[status]} tone={TASK_STATUS_TONE[status]} />
                  <Text style={gText.meta}>
                    {status === 'done' ? 'Nothing finished yet.' : `No ${TASK_STATUS_LABELS[status].toLowerCase()} tasks.`}
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {visible.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      mine={Boolean(currentMemberId && task.assigneeId === currentMemberId)}
                      onPress={() => openEdit(task)}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </GCard>

      <TaskSheet
        visible={panelMode != null}
        mode={panelMode === 'create' ? 'create' : 'edit'}
        task={selectedTask}
        defaultStatus={defaultStatus}
        taskGroups={taskGroups}
        members={committee.members}
        currentMemberId={currentMemberId}
        readOnly={readOnly}
        saving={saving}
        error={error}
        onBlocked={notifyBlocked}
        onClose={closePanel}
        onSave={(form) => void handleSave(form)}
        onDelete={panelMode === 'edit' && !readOnly ? () => void handleDelete() : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  body: { gap: 14 },
  flex: { flex: 1, gap: 3 },
  empty: { gap: 8 },
  emptyColumn: { gap: 8, alignItems: 'flex-start', paddingVertical: 8 },
  list: { gap: 10 },
  task: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.paper,
  },
  taskMine: { borderColor: Garden.forest, backgroundColor: Garden.notebook },
  done: { textDecorationLine: 'line-through', color: Garden.soft },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
