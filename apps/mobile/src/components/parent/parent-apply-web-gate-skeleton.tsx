import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Story, StoryRadius } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

function SkeletonBlock({
  style,
  backgroundColor,
}: {
  style: ViewStyle;
  backgroundColor: string;
}) {
  return <View style={[style, { backgroundColor, opacity: 0.55 }]} />;
}

export function ParentApplyWebGateSkeleton() {
  const blockColor = Story.line;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: Story.paper }]}>
      <SkeletonBlock style={styles.kicker} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.title} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.line} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.card} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.button} backgroundColor={blockColor} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.six,
    gap: Spacing.three,
  },
  kicker: {
    height: 12,
    width: 120,
    borderRadius: StoryRadius.cardCompact,
  },
  title: {
    height: 32,
    width: '85%',
    borderRadius: StoryRadius.cardCompact,
  },
  line: {
    height: 14,
    width: '100%',
    borderRadius: StoryRadius.cardCompact,
  },
  card: {
    height: 160,
    borderRadius: StoryRadius.card,
    marginTop: Spacing.two,
  },
  button: {
    height: 48,
    borderRadius: StoryRadius.button,
    marginTop: Spacing.two,
  },
});
