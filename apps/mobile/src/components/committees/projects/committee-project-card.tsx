import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryChip } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  committeeProjectDisplayName,
  type CommitteeProject,
} from '@/lib/committees/committee-project-mappers';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type CommitteeProjectCardProps = {
  project: CommitteeProject;
  onPress: () => void;
};

export function CommitteeProjectCard({ project, onPress }: CommitteeProjectCardProps) {
  const theme = useParentTheme();
  const statusTone = project.status === 'active' ? 'success' : 'warning';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: theme.line,
          backgroundColor: theme.white,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
      accessibilityRole="button">
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.ink }]} numberOfLines={2}>
          {committeeProjectDisplayName(project)}
        </Text>
        <StoryChip tone={statusTone} label={project.status === 'active' ? 'Active' : 'Draft'} />
      </View>
      {project.description.trim() ? (
        <Text style={[styles.description, { color: theme.muted }]} numberOfLines={2}>
          {project.description.trim()}
        </Text>
      ) : null}
      <Text style={[styles.meta, { color: theme.muted }]}>
        {project.supplyItemCount ?? 0} supply item
        {(project.supplyItemCount ?? 0) === 1 ? '' : 's'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontFamily: StoryFonts.display,
    fontSize: 17,
    fontWeight: '600',
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
});
