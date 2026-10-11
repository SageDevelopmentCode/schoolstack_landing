import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import type { MoreMenuTab, MoreMenuTabId } from '@/lib/more-menu-tab-ids';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type StoryMoreMenuSectionTabsProps = {
  tabs: MoreMenuTab[];
  activeId: MoreMenuTabId;
  onChange: (id: MoreMenuTabId) => void;
};

export function StoryMoreMenuSectionTabs({
  tabs,
  activeId,
  onChange,
}: StoryMoreMenuSectionTabsProps) {
  const theme = useParentTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: theme.line }]}>
      {tabs.map((tab) => {
        const selected = tab.id === activeId;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [
              styles.tab,
              selected && { backgroundColor: theme.paper },
              pressed && styles.pressed,
            ]}>
            <Ionicons
              name={tab.icon}
              size={16}
              color={selected ? theme.primary : theme.muted}
            />
            <Text
              style={[
                styles.label,
                { color: selected ? theme.ink : theme.muted },
                selected && styles.labelSelected,
              ]}
              numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: Radius.pill,
    padding: 3,
    gap: 2,
    marginBottom: Spacing.three,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: Radius.pill,
    minHeight: 44,
    gap: 2,
  },
  label: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelSelected: {
    fontFamily: StoryFonts.bodySemiBold,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
  },
});
