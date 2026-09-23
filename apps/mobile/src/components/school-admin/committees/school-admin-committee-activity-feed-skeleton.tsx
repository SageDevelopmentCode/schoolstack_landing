import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { Story } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

const SKELETON_COLOR = Story.line;

function ActivityRowSkeleton({ summaryWidth }: { summaryWidth: `${number}%` }) {
  return (
    <View style={styles.row}>
      <SkeletonPulse style={styles.chip} backgroundColor={SKELETON_COLOR} />
      <SkeletonPulse
        style={{ ...styles.summaryBar, width: summaryWidth }}
        backgroundColor={SKELETON_COLOR}
      />
      <SkeletonPulse style={styles.metaBar} backgroundColor={SKELETON_COLOR} />
    </View>
  );
}

type SchoolAdminCommitteeActivityFeedSkeletonProps = {
  title?: string;
  rowCount?: number;
};

export function SchoolAdminCommitteeActivityFeedSkeleton({
  title = 'Recent activity',
  rowCount = 5,
}: SchoolAdminCommitteeActivityFeedSkeletonProps) {
  const summaryWidths: `${number}%`[] = ['100%', '80%', '92%', '75%', '88%', '70%'];

  return (
    <View style={styles.container}>
      {title ? (
        <StoryDisplayHeading size="section" style={styles.title}>
          {title}
        </StoryDisplayHeading>
      ) : null}
      <View style={styles.list}>
        {Array.from({ length: rowCount }, (_, index) => (
          <ActivityRowSkeleton
            key={index}
            summaryWidth={summaryWidths[index % summaryWidths.length]}
          />
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
  row: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.one,
    width: '100%',
  },
  chip: {
    width: 56,
    height: 20,
    borderRadius: Radius.pill,
  },
  summaryBar: {
    height: 12,
    borderRadius: Radius.sm,
  },
  metaBar: {
    width: '35%',
    height: 10,
    borderRadius: Radius.sm,
  },
});
