import { StyleSheet, View, type ViewStyle } from 'react-native';

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

export function ParentCommitteeWorkspaceSkeleton() {
  const blockColor = Story.line;

  return (
    <View style={styles.container}>
      <SkeletonBlock style={styles.titleBar} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.pillNav} backgroundColor={blockColor} />
      <SkeletonBlock
        style={{ height: 200, borderRadius: StoryRadius.card }}
        backgroundColor={blockColor}
      />
      <SkeletonBlock
        style={{ height: 120, borderRadius: StoryRadius.card }}
        backgroundColor={blockColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  titleBar: {
    height: 28,
    width: '70%',
    borderRadius: StoryRadius.cardCompact,
  },
  pillNav: {
    height: 40,
    borderRadius: StoryRadius.cardCompact,
  },
});
