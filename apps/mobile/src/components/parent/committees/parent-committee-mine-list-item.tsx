import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentCommitteeListItem } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteeMineListItemProps = {
  committee: ParentCommitteeListItem;
  onPress: () => void;
};

export function ParentCommitteeMineListItem({
  committee,
  onPress,
}: ParentCommitteeMineListItemProps) {
  const theme = useParentTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
      <StoryCard compact style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <StoryDisplayHeading size="section" style={styles.title}>
                {committee.name}
              </StoryDisplayHeading>
              <StoryChip tone="info" label={committee.termLabel} />
            </View>
            <Text style={[styles.description, { color: theme.muted }]} numberOfLines={2}>
              {committee.description}
            </Text>
            <View style={styles.metaRow}>
              {committee.openTaskCount > 0 ? (
                <View style={styles.metaItem}>
                  <Ionicons name="checkbox-outline" size={14} color={theme.muted} />
                  <Text style={[styles.metaText, { color: theme.muted }]}>
                    {committee.openTaskCount} open task
                    {committee.openTaskCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              ) : null}
              {committee.nextEventTitle ? (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={theme.muted} />
                  <Text style={[styles.metaText, { color: theme.muted }]} numberOfLines={1}>
                    Next: {committee.nextEventTitle}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.primary} style={styles.chevron} />
        </View>
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    fontSize: 16,
    flexShrink: 1,
  },
  chevron: {
    opacity: 0.5,
    marginTop: 2,
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  metaText: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    flexShrink: 1,
  },
});
