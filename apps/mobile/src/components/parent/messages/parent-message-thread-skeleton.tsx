import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';

const BUBBLE_LAYOUT = [
  { align: 'left' as const, width: '62%' },
  { align: 'right' as const, width: '48%' },
  { align: 'left' as const, width: '72%' },
  { align: 'right' as const, width: '55%' },
  { align: 'left' as const, width: '50%' },
];

export function ParentMessageThreadSkeleton() {
  const theme = useAdminTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
        <SkeletonPulse style={styles.backBar} backgroundColor={theme.border} />
        <View style={styles.headerCenter}>
          <SkeletonPulse style={styles.headerAvatar} backgroundColor={theme.border} />
          <View style={styles.headerText}>
            <SkeletonPulse style={styles.headerTitle} backgroundColor={theme.border} />
            <SkeletonPulse style={styles.headerSubtitle} backgroundColor={theme.border} />
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.messagesArea}>
        {BUBBLE_LAYOUT.map((bubble, index) => (
          <View
            key={index}
            style={[
              styles.bubbleRow,
              bubble.align === 'right' ? styles.bubbleRowRight : styles.bubbleRowLeft,
            ]}>
            <SkeletonPulse
              style={[
                styles.bubble,
                {
                  width: bubble.width,
                  borderRadius: Radius.lg,
                },
              ]}
              backgroundColor={theme.border}
            />
          </View>
        ))}
      </View>

      <View style={[styles.composeBar, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
        <SkeletonPulse style={styles.composeInput} backgroundColor={theme.border} />
        <SkeletonPulse style={styles.composeSend} backgroundColor={theme.border} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBar: {
    height: 14,
    width: 72,
    borderRadius: Radius.sm,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerText: {
    gap: Spacing.one,
    maxWidth: 140,
  },
  headerTitle: {
    height: 14,
    width: 100,
    borderRadius: Radius.sm,
  },
  headerSubtitle: {
    height: 12,
    width: 72,
    borderRadius: Radius.sm,
  },
  headerSpacer: {
    width: 72,
  },
  messagesArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubbleRowLeft: {
    justifyContent: 'flex-start',
  },
  bubbleRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    height: 44,
  },
  composeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composeInput: {
    flex: 1,
    height: 40,
    borderRadius: Radius.pill,
  },
  composeSend: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
