import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { Story } from '@/constants/story-theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';

const BUBBLE_LAYOUT = [
  { align: 'left' as const, width: '62%' },
  { align: 'right' as const, width: '48%' },
  { align: 'left' as const, width: '72%' },
  { align: 'right' as const, width: '55%' },
  { align: 'left' as const, width: '50%' },
];

export function AdminMessageThreadSkeleton() {
  const theme = useParentTheme();
  const blockColor = Story.line;

  return (
    <View style={[styles.container, { backgroundColor: theme.paper }]}>
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.line, backgroundColor: theme.paper },
        ]}>
        <SkeletonPulse style={styles.backBar} backgroundColor={blockColor} />
        <View style={styles.headerCenter}>
          <SkeletonPulse style={styles.headerAvatar} backgroundColor={blockColor} />
          <View style={styles.headerText}>
            <SkeletonPulse style={styles.headerTitle} backgroundColor={blockColor} />
            <SkeletonPulse style={styles.headerSubtitle} backgroundColor={blockColor} />
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
            <SkeletonPulse style={styles.storyAvatar} backgroundColor={blockColor} />
            <SkeletonPulse
              style={{
                height: 44,
                width: bubble.width as `${number}%`,
                borderRadius: Radius.lg,
              }}
              backgroundColor={blockColor}
            />
          </View>
        ))}
      </View>

      <View style={[styles.composeBar, { backgroundColor: theme.paper }]}>
        <SkeletonPulse style={styles.composeInput} backgroundColor={blockColor} />
        <SkeletonPulse style={styles.composeSend} backgroundColor={blockColor} />
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
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
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
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  bubbleRowLeft: {
    justifyContent: 'flex-start',
  },
  bubbleRowRight: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },
  storyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  composeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
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
