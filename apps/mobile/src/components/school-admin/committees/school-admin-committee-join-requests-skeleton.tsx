import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { StoryCard } from '@/components/story/story-card';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { Story, StoryCardPadding } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

const SKELETON_COLOR = Story.line;

function JoinRequestCardSkeleton() {
  return (
    <StoryCard compact style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <SkeletonPulse style={styles.nameBar} backgroundColor={SKELETON_COLOR} />
        <SkeletonPulse style={styles.badge} backgroundColor={SKELETON_COLOR} />
      </View>
      <SkeletonPulse style={styles.metaBar} backgroundColor={SKELETON_COLOR} />
      <SkeletonPulse style={styles.metaBarShort} backgroundColor={SKELETON_COLOR} />
      <View style={styles.actionRow}>
        <SkeletonPulse style={styles.actionButton} backgroundColor={SKELETON_COLOR} />
        <SkeletonPulse style={styles.actionButton} backgroundColor={SKELETON_COLOR} />
      </View>
    </StoryCard>
  );
}

type SchoolAdminCommitteeJoinRequestsSkeletonProps = {
  cardCount?: number;
  compact?: boolean;
  hideTitle?: boolean;
};

export function SchoolAdminCommitteeJoinRequestsSkeleton({
  cardCount = 2,
  compact = false,
  hideTitle = false,
}: SchoolAdminCommitteeJoinRequestsSkeletonProps) {
  return (
    <View style={styles.container}>
      {hideTitle ? null : (
        <StoryDisplayHeading size="section" style={styles.title}>
          {compact ? 'Pending requests' : 'Join requests'}
        </StoryDisplayHeading>
      )}
      <View style={styles.list}>
        {Array.from({ length: cardCount }, (_, index) => (
          <JoinRequestCardSkeleton key={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 18,
  },
  list: {
    gap: Spacing.two,
  },
  requestCard: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  nameBar: {
    flex: 1,
    height: 14,
    borderRadius: Radius.sm,
  },
  badge: {
    width: 48,
    height: 20,
    borderRadius: Radius.pill,
  },
  metaBar: {
    width: '70%',
    height: 12,
    borderRadius: Radius.sm,
  },
  metaBarShort: {
    width: '45%',
    height: 10,
    borderRadius: Radius.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  actionButton: {
    flex: 1,
    height: 36,
    borderRadius: Radius.md,
  },
});
