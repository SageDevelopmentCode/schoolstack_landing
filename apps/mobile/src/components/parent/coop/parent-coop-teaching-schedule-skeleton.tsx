import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { ParentCoopTeachingScheduleStoryHeader } from '@/components/parent/coop/parent-coop-teaching-schedule-story-header';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryRadius } from '@/constants/story-theme';
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

export function ParentCoopTeachingScheduleSkeleton() {
  const blockColor = Story.line;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Story.paper }}
      contentContainerStyle={styles.content}>
      <ParentCoopTeachingScheduleStoryHeader />
      <View style={styles.summaryRow}>
        {[0, 1, 2, 3].map((index) => (
          <SkeletonBlock
            key={index}
            style={{
              width: '47%',
              height: 72,
              borderRadius: StoryRadius.cardCompact,
            }}
            backgroundColor={blockColor}
          />
        ))}
      </View>
      <SkeletonBlock
        style={{ height: 40, borderRadius: StoryRadius.cardCompact }}
        backgroundColor={blockColor}
      />
      {[0, 1].map((index) => (
        <SkeletonBlock
          key={index}
          style={{ height: 160, borderRadius: StoryRadius.card }}
          backgroundColor={blockColor}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
