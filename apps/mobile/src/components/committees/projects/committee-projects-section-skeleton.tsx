import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { Story } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

const SKELETON_COLOR = Story.line;

function ProjectCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <SkeletonPulse style={styles.cardTitle} backgroundColor={SKELETON_COLOR} />
        <SkeletonPulse style={styles.cardChip} backgroundColor={SKELETON_COLOR} />
      </View>
      <SkeletonPulse style={styles.cardDescriptionLine} backgroundColor={SKELETON_COLOR} />
      <SkeletonPulse style={styles.cardDescriptionLineShort} backgroundColor={SKELETON_COLOR} />
      <SkeletonPulse style={styles.cardMeta} backgroundColor={SKELETON_COLOR} />
    </View>
  );
}

type CommitteeProjectsSectionSkeletonProps = {
  showCreateButton?: boolean;
};

export function CommitteeProjectsSectionSkeleton({
  showCreateButton = true,
}: CommitteeProjectsSectionSkeletonProps) {
  return (
    <StoryDetailSection title="Projects">
      <SkeletonPulse style={styles.subtitle} backgroundColor={SKELETON_COLOR} />
      {showCreateButton ? (
        <SkeletonPulse style={styles.createButton} backgroundColor={SKELETON_COLOR} />
      ) : null}
      <View style={styles.list}>
        {[0, 1, 2].map((index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </View>
    </StoryDetailSection>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    width: '85%',
    height: 14,
    borderRadius: Radius.sm,
    marginBottom: Spacing.three,
  },
  createButton: {
    width: '100%',
    height: 44,
    borderRadius: Radius.md,
    marginBottom: Spacing.three,
  },
  list: {
    gap: Spacing.three,
  },
  card: {
    borderWidth: 1,
    borderColor: Story.line,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cardTitle: {
    flex: 1,
    height: 18,
    borderRadius: Radius.sm,
  },
  cardChip: {
    width: 52,
    height: 22,
    borderRadius: Radius.pill,
  },
  cardDescriptionLine: {
    width: '100%',
    height: 12,
    borderRadius: Radius.sm,
  },
  cardDescriptionLineShort: {
    width: '70%',
    height: 12,
    borderRadius: Radius.sm,
  },
  cardMeta: {
    width: '40%',
    height: 11,
    borderRadius: Radius.sm,
  },
});
