import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

export type DetailTab = {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconActive?: keyof typeof Ionicons.glyphMap;
};

type DetailTabBarProps = {
  tabs: DetailTab[];
  activeTabId: string;
  onChange: (tabId: string) => void;
};

export function DetailTabBar({ tabs, activeTabId, onChange }: DetailTabBarProps) {
  const theme = useAdminTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(tab.id)}
              style={[styles.tab, { borderBottomColor: active ? theme.accent : 'transparent' }]}>
              <ThemedText
                type="smallBold"
                style={{ color: active ? theme.accent : theme.textTertiary }}>
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.four,
  },
  tab: {
    paddingVertical: Spacing.three,
    borderBottomWidth: 2,
  },
});
