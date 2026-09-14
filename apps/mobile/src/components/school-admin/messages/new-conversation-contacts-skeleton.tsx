import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
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
          <SkeletonPulse style={styles.nameBar} backgroundColor={backgroundColor} />
          <SkeletonPulse style={styles.subtitleBar} backgroundColor={backgroundColor} />
        </View>
      </View>
    </View>
  );
}

type NewConversationContactsSkeletonProps = {
  rowCount?: number;
};

export function NewConversationContactsSkeleton({
  rowCount = 8,
}: NewConversationContactsSkeletonProps) {
  const theme = useParentTheme();
  const blockColor = Story.line;

  return (
    <View style={styles.container}>
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
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  nameBar: {
    width: '48%',
    height: 14,
    borderRadius: Radius.sm,
  },
  subtitleBar: {
    width: '32%',
    height: 12,
    borderRadius: Radius.sm,
  },
});
