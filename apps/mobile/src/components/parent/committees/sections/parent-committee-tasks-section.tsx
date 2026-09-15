import { StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { Committee, CommitteeTaskStatus } from '@/lib/parent/parent-committees-types';
import { TASK_STATUS_LABELS } from '@/lib/parent/parent-committees-types';
import type { StoryChipTone } from '@/components/story/story-chip';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteeTasksSectionProps = {
  committee: Committee;
};

function taskChipTone(status: CommitteeTaskStatus): StoryChipTone {
  if (status === 'done') return 'success';
  if (status === 'open') return 'info';
  if (status === 'claimed' || status === 'in_progress') return 'warning';
  return 'info';
}

export function ParentCommitteeTasksSection({ committee }: ParentCommitteeTasksSectionProps) {
  const theme = useParentTheme();
  const tasks = committee.tasks;

  if (tasks.length === 0) {
    return (
      <StoryDetailSection title="Tasks">
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>No tasks yet.</Text>
      </StoryDetailSection>
    );
  }

  const groups = committee.config.taskGroups ?? [{ id: 'general', label: 'General' }];

  return (
    <View style={styles.container}>
      {groups.map((group) => {
        const groupTasks = tasks.filter((task) => task.group === group.id);
        if (groupTasks.length === 0) return null;

        return (
          <StoryDetailSection key={group.id} title={group.label}>
            <View style={styles.list}>
              {groupTasks.map((task) => (
                <StoryCard key={task.id} compact style={styles.card}>
                  <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: theme.ink }]}>{task.title}</Text>
                    <StoryChip
                      tone={taskChipTone(task.status)}
                      label={TASK_STATUS_LABELS[task.status]}
                    />
                  </View>
                  {task.description ? (
                    <Text style={[styles.description, { color: theme.muted }]}>{task.description}</Text>
                  ) : null}
                  <Text style={[styles.meta, { color: theme.muted }]}>
                    {task.assigneeName ?? 'Unassigned'}
                    {task.dueDate
                      ? ` · Due ${new Date(`${task.dueDate}T00:00:00`).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}`
                      : ''}
                  </Text>
                </StoryCard>
              ))}
            </View>
          </StoryDetailSection>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  list: {
    gap: Spacing.two,
  },
  card: {
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    flex: 1,
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
});
