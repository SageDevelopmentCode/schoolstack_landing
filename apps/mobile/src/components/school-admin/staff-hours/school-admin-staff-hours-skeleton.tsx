import { StyleSheet, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryCardPadding } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

const SHIMMER = '#E8EDE9';

type SchoolAdminStaffHoursSkeletonProps = {
  variant: 'live' | 'summary' | 'requests' | 'settings';
};

function ShimmerBlock({ height, style }: { height: number; style?: object }) {
  return <View style={[styles.shimmer, { height }, style]} />;
}

export function SchoolAdminStaffHoursSkeleton({ variant }: SchoolAdminStaffHoursSkeletonProps) {
  if (variant === 'summary') {
    return (
      <View style={styles.container} testID="school-admin-staff-hours-loading-summary">
        <StoryCard style={styles.filterCard}>
          <ShimmerBlock height={44} />
          <ShimmerBlock height={44} />
          <ShimmerBlock height={48} />
        </StoryCard>
        <StoryCard style={styles.sectionCard}>
          <ShimmerBlock height={20} style={styles.titleShim} />
          <ShimmerBlock height={56} />
          <ShimmerBlock height={56} />
        </StoryCard>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="school-admin-staff-hours-loading-live">
      <View style={styles.metricRow}>
        <StoryCard compact style={styles.metricCard}>
          <ShimmerBlock height={32} />
          <ShimmerBlock height={14} style={{ marginTop: Spacing.two }} />
        </StoryCard>
        <StoryCard compact style={styles.metricCard}>
          <ShimmerBlock height={32} />
          <ShimmerBlock height={14} style={{ marginTop: Spacing.two }} />
        </StoryCard>
      </View>
      <StoryCard style={styles.sectionCard}>
        <ShimmerBlock height={20} style={styles.titleShim} />
        <ShimmerBlock height={48} />
      </StoryCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  shimmer: {
    backgroundColor: SHIMMER,
    borderRadius: 8,
  },
  metricRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  metricCard: {
    flex: 1,
    padding: StoryCardPadding,
  },
  filterCard: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  sectionCard: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  titleShim: {
    width: '50%',
    marginBottom: Spacing.one,
  },
});
