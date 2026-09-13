import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { DetailTab } from '@/components/school-admin/detail-tab-bar';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type SubmissionStoryTabBarProps = {
  tabs: DetailTab[];
  activeTabId: string;
  onChange: (tabId: string) => void;
};

export function SubmissionStoryTabBar({
  tabs,
  activeTabId,
  onChange,
}: SubmissionStoryTabBarProps) {
  const theme = useParentTheme();

  return (
    <View style={[styles.container, { backgroundColor: Story.paper, borderBottomColor: theme.line }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(tab.id)}
              style={[styles.tab, { borderBottomColor: active ? theme.primary : 'transparent' }]}>
              <Text
                style={[
                  styles.label,
                  { color: active ? theme.primary : theme.muted },
                  active && styles.labelActive,
                ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  scroll: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.four,
  },
  tab: {
    paddingVertical: Spacing.three,
    borderBottomWidth: 2,
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 18,
  },
  labelActive: {
    fontFamily: StoryFonts.bodySemiBold,
    fontWeight: '600',
  },
});
