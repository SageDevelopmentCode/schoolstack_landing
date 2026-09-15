import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ParentCommitteeRequestStatusChip } from '@/components/parent/committees/parent-committee-request-status-chip';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentCommitteeBrowseItem } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteeBrowseListItemProps = {
  committee: ParentCommitteeBrowseItem;
  onPress: () => void;
};

export function ParentCommitteeBrowseListItem({
  committee,
  onPress,
}: ParentCommitteeBrowseListItemProps) {
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
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.primary} style={styles.chevron} />
        </View>
        <Text style={[styles.description, { color: theme.muted }]} numberOfLines={3}>
          {committee.description}
        </Text>
        <View style={styles.metaRow}>
          {committee.isMember ? <StoryChip tone="success" label="Member" /> : null}
          {committee.requestStatus && !committee.isMember ? (
            <ParentCommitteeRequestStatusChip status={committee.requestStatus} />
          ) : null}
          {committee.dutyRoles.length > 0 ? (
            <Text style={[styles.roleCount, { color: theme.muted }]}>
              {committee.dutyRoles.length} role{committee.dutyRoles.length !== 1 ? 's' : ''}
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
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    fontSize: 15,
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
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 28,
  },
  roleCount: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
});
