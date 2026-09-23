import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { CommitteeTask } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteeTaskCardProps = {
  task: CommitteeTask;
  onPress: () => void;
};

export function ParentCommitteeTaskCard({ task, onPress }: ParentCommitteeTaskCardProps) {
  const theme = useParentTheme();

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <StoryCard compact style={styles.card}>
        <Text style={[styles.title, { color: theme.ink }]} numberOfLines={2}>
          {task.title}
        </Text>
        {task.description ? (
          <Text style={[styles.description, { color: theme.muted }]} numberOfLines={3}>
            {task.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: theme.muted }]}>
            {task.assigneeName ?? 'Unassigned'}
          </Text>
          {task.dueDate ? (
            <Text style={[styles.meta, { color: theme.muted }]}>
              Due{' '}
              {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          ) : null}
        </View>
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
  },
});
