import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { Story, StoryCardPadding, StoryRadius } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

function CardSkeleton({ backgroundColor }: { backgroundColor: string }) {
  return (
    <View style={[styles.card, { borderColor: Story.line, backgroundColor: Story.white }]}>
      <SkeletonPulse style={styles.titleBar} backgroundColor={backgroundColor} />
      <SkeletonPulse style={styles.line} backgroundColor={backgroundColor} />
      <SkeletonPulse style={styles.lineShort} backgroundColor={backgroundColor} />
    </View>
  );
}

export function ParentNotificationSettingsSkeleton() {
  const blockColor = Story.line;

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <SkeletonPulse style={styles.backBar} backgroundColor={blockColor} />
        <SkeletonPulse style={styles.kickerBar} backgroundColor={blockColor} />
        <SkeletonPulse style={styles.titleBar} backgroundColor={blockColor} />
        <SkeletonPulse style={styles.subtitleLine} backgroundColor={blockColor} />
        <SkeletonPulse style={styles.subtitleLineShort} backgroundColor={blockColor} />
      </View>
      <CardSkeleton backgroundColor={blockColor} />
      <CardSkeleton backgroundColor={blockColor} />
      <View style={[styles.card, styles.editorCard, { borderColor: Story.line, backgroundColor: Story.white }]}>
        <SkeletonPulse style={styles.titleBar} backgroundColor={blockColor} />
        <SkeletonPulse style={styles.line} backgroundColor={blockColor} />
        <SkeletonPulse style={styles.emailRow} backgroundColor={blockColor} />
        <SkeletonPulse style={styles.buttonBar} backgroundColor={blockColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  headerBlock: {
    gap: Spacing.two,
  },
  backBar: {
    height: 20,
    width: 72,
    borderRadius: StoryRadius.input,
  },
  kickerBar: {
    height: 12,
    width: '48%',
    borderRadius: StoryRadius.input,
  },
  titleBar: {
    height: 28,
    width: '72%',
    borderRadius: StoryRadius.input,
  },
  subtitleLine: {
    height: 14,
    width: '100%',
    borderRadius: StoryRadius.input,
  },
  subtitleLineShort: {
    height: 14,
    width: '88%',
    borderRadius: StoryRadius.input,
  },
  card: {
    borderWidth: 1,
    borderRadius: StoryRadius.cardCompact,
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  editorCard: {
    borderRadius: StoryRadius.card,
    padding: StoryCardPadding + 4,
  },
  line: {
    height: 14,
    width: '90%',
    borderRadius: StoryRadius.input,
  },
  lineShort: {
    height: 14,
    width: '60%',
    borderRadius: StoryRadius.input,
  },
  emailRow: {
    height: 48,
    width: '100%',
    borderRadius: StoryRadius.input,
  },
  buttonBar: {
    height: 52,
    width: '100%',
    borderRadius: StoryRadius.button,
  },
});
