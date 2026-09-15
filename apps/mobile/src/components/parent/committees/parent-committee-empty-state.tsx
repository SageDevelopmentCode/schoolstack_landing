import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentCommitteesTab } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteeEmptyStateProps = {
  tab: ParentCommitteesTab;
};

export function ParentCommitteeEmptyState({ tab }: ParentCommitteeEmptyStateProps) {
  const theme = useParentTheme();
  const isExplore = tab === 'explore';

  return (
    <StoryCard compact style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name="heart" size={28} color={theme.primary} />
      </View>
      <StoryDisplayHeading size="section" style={styles.title}>
        {isExplore ? 'No committees available' : 'No committees yet'}
      </StoryDisplayHeading>
      <Text style={[styles.copy, { color: theme.muted }]}>
        {isExplore
          ? 'When the school opens volunteer committees, they will appear here for you to explore.'
          : 'After the school approves your join request, your committee workspace will appear here.'}
      </Text>
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  title: {
    textAlign: 'center',
    fontSize: 17,
  },
  copy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
  },
});
