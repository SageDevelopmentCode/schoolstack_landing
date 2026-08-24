import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';

import { PARENT_MESSAGE_ROW_SEPARATOR_INSET } from './parent-message-thread-row';

function SkeletonRow({ backgroundColor, borderColor }: { backgroundColor: string; borderColor: string }) {
  return (
    <View>
      <View style={styles.row}>
        <SkeletonPulse style={styles.avatar} backgroundColor={backgroundColor} />
        <View style={styles.textColumn}>
          <View style={styles.topLine}>
            <SkeletonPulse style={styles.nameBar} backgroundColor={backgroundColor} />
            <SkeletonPulse style={styles.timeBar} backgroundColor={backgroundColor} />
          </View>
          <SkeletonPulse style={styles.subtitleBar} backgroundColor={backgroundColor} />
          <SkeletonPulse style={styles.previewBar} backgroundColor={backgroundColor} />
        </View>
      </View>
      <View style={[styles.separator, { backgroundColor: borderColor, marginLeft: PARENT_MESSAGE_ROW_SEPARATOR_INSET }]} />
    </View>
  );
}

type ParentMessagesListSkeletonProps = {
  rowCount?: number;
};

export function ParentMessagesListSkeleton({ rowCount = 8 }: ParentMessagesListSkeletonProps) {
  const theme = useAdminTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: rowCount }, (_, index) => (
        <SkeletonRow key={index} backgroundColor={theme.border} borderColor={theme.border} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
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
    height: 14,
    flex: 1,
    maxWidth: '55%',
    borderRadius: Radius.sm,
  },
  timeBar: {
    height: 12,
    width: 48,
    borderRadius: Radius.sm,
  },
  subtitleBar: {
    height: 12,
    width: '40%',
    borderRadius: Radius.sm,
  },
  previewBar: {
    height: 12,
    width: '85%',
    borderRadius: Radius.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});
