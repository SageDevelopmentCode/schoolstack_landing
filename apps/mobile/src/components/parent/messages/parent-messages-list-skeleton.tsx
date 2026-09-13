import { StyleSheet, View } from 'react-native';

import {
  MESSAGES_ROW_PADDING_HORIZONTAL,
  MESSAGES_ROW_PADDING_VERTICAL,
} from '@/components/parent/messages/messages-layout';
import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { Story } from '@/constants/story-theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Radius, Spacing } from '@/constants/theme';

function SkeletonRow({
  backgroundColor,
  borderColor,
}: {
  backgroundColor: string;
  borderColor: string;
}) {
  return (
    <View style={[styles.rowWrap, { borderBottomColor: borderColor }]}>
      <View style={styles.row}>
        <SkeletonPulse style={styles.avatar} backgroundColor={backgroundColor} />
        <View style={styles.textColumn}>
          <View style={styles.topLine}>
            <SkeletonPulse style={styles.nameBar} backgroundColor={backgroundColor} />
            <SkeletonPulse style={styles.timeBar} backgroundColor={backgroundColor} />
          </View>
          <SkeletonPulse style={styles.previewBar} backgroundColor={backgroundColor} />
        </View>
      </View>
    </View>
  );
}

type ParentMessagesListSkeletonProps = {
  rowCount?: number;
};

export function ParentMessagesListSkeleton({ rowCount = 8 }: ParentMessagesListSkeletonProps) {
  const theme = useParentTheme();
  const blockColor = Story.line;

  return (
    <View style={[styles.container, { backgroundColor: theme.white }]}>
      {Array.from({ length: rowCount }, (_, index) => (
        <SkeletonRow key={index} backgroundColor={blockColor} borderColor={theme.line} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowWrap: {
    paddingHorizontal: MESSAGES_ROW_PADDING_HORIZONTAL,
    paddingVertical: MESSAGES_ROW_PADDING_VERTICAL,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  textColumn: {
    flex: 1,
    gap: Spacing.two,
  },
  topLine: {
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
  timeBar: {
    width: 36,
    height: 12,
    borderRadius: Radius.sm,
  },
  previewBar: {
    width: '72%',
    height: 12,
    borderRadius: Radius.sm,
  },
});
