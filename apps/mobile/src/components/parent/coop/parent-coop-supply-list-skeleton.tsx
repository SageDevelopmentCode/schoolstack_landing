import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { ParentCoopSupplyListStoryHeader } from '@/components/parent/coop/parent-coop-supply-list-story-header';
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

export function ParentCoopSupplyListSkeleton() {
  const blockColor = Story.line;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Story.paper }}
      contentContainerStyle={styles.content}>
      <ParentCoopSupplyListStoryHeader search="" onSearchChange={() => {}} />
      <View style={styles.summaryRow}>
        {[0, 1, 2].map((index) => (
          <SkeletonBlock
            key={index}
            style={{ width: '30%', height: 72, borderRadius: StoryRadius.cardCompact }}
            backgroundColor={blockColor}
          />
        ))}
      </View>
      {[0, 1, 2].map((index) => (
        <SkeletonBlock
          key={index}
          style={{ height: 120, borderRadius: StoryRadius.card }}
          backgroundColor={blockColor}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    paddingTop: Spacing.four,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
