import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { Story } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

const SKELETON_COLOR = Story.line;

function SupplyRowSkeleton() {
  return (
    <View style={styles.row}>
      <SkeletonPulse style={styles.rowTitle} backgroundColor={SKELETON_COLOR} />
      <View style={styles.rowMeta}>
        <SkeletonPulse style={styles.rowChip} backgroundColor={SKELETON_COLOR} />
        <SkeletonPulse style={styles.rowMetaText} backgroundColor={SKELETON_COLOR} />
      </View>
    </View>
  );
}

type CommitteeProjectSupplyListSkeletonProps = {
  showAddButton?: boolean;
  rowCount?: number;
};

export function CommitteeProjectSupplyListSkeleton({
  showAddButton = true,
  rowCount = 4,
}: CommitteeProjectSupplyListSkeletonProps) {
  return (
    <View style={styles.container}>
      {showAddButton ? (
        <View style={styles.headerRow}>
          <StorySectionKicker style={styles.kicker}>Supply list</StorySectionKicker>
          <SkeletonPulse style={styles.addActionPulse} backgroundColor={SKELETON_COLOR} />
        </View>
      ) : null}
      <View style={styles.list}>
        {Array.from({ length: rowCount }, (_, index) => (
          <SupplyRowSkeleton key={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    minHeight: 44,
  },
  kicker: {
    marginBottom: 0,
    flex: 1,
  },
  addActionPulse: {
    width: 72,
    height: 14,
    borderRadius: Radius.sm,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    borderWidth: 1,
    borderColor: Story.line,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  rowTitle: {
    width: '65%',
    height: 16,
    borderRadius: Radius.sm,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowChip: {
    width: 64,
    height: 22,
    borderRadius: Radius.pill,
  },
  rowMetaText: {
    width: 72,
    height: 12,
    borderRadius: Radius.sm,
  },
});
