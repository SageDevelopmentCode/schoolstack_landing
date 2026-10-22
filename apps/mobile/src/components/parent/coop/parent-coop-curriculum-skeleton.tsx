import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { ParentCoopCurriculumStoryHeader } from '@/components/parent/coop/parent-coop-curriculum-story-header';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryRadius } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

function SkeletonBlock({
  style,
  backgroundColor,
}: {
  style: ViewStyle;
  backgroundColor: string;
}) {
  return <View style={[style, { backgroundColor, opacity: 0.55 }]} />;
}

export function ParentCoopCurriculumSkeleton() {
  const blockColor = Story.line;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Story.paper }}
      contentContainerStyle={styles.content}>
      <ParentCoopCurriculumStoryHeader />
      <View style={styles.pillRow}>
        {[0, 1, 2].map((index) => (
          <SkeletonBlock
            key={index}
            style={{ width: 96, height: 32, borderRadius: Radius.pill }}
            backgroundColor={blockColor}
          />
        ))}
      </View>
      <SkeletonBlock
        style={{ height: 360, borderRadius: StoryRadius.card }}
        backgroundColor={blockColor}
      />
      <SkeletonBlock
        style={{ height: 48, borderRadius: StoryRadius.cardCompact }}
        backgroundColor={blockColor}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
