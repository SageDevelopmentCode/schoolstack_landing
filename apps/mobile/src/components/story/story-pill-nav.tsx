import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';

export type StoryPillNavItem = {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  suffix?: ReactNode;
  disabled?: boolean;
  testID?: string;
};

type StoryPillNavProps = {
  items: StoryPillNavItem[];
  activeKey: string;
  onChange: (key: string) => void;
  accessibilityLabel?: string;
  fullWidth?: boolean;
};

const TRACK_COLOR = '#EAF2EB';
const INACTIVE_COLOR = '#728079';

export function StoryPillNav({
  items,
  activeKey,
  onChange,
  accessibilityLabel = 'Sections',
  fullWidth = false,
}: StoryPillNavProps) {
  const theme = useParentTheme();

  const pills = items.map((item) => {
    const active = item.key === activeKey;
    return (
      <Pressable
        key={item.key}
        onPress={() => onChange(item.key)}
        disabled={item.disabled}
        accessibilityRole="tab"
        accessibilityState={{ selected: active, disabled: item.disabled }}
        testID={item.testID}
        style={({ pressed }) => [
          styles.pill,
          fullWidth && styles.pillFullWidth,
          active && styles.pillActive,
          active && { shadowColor: '#dbe2dc' },
          pressed && !item.disabled && { opacity: 0.85 },
          item.disabled && { opacity: 0.7 },
        ]}>
        {item.icon ? (
          <Ionicons
            name={item.icon}
            size={fullWidth ? 14 : 12}
            color={active ? theme.primary : INACTIVE_COLOR}
          />
        ) : null}
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            fullWidth ? styles.pillLabelFullWidth : styles.pillLabel,
            { color: active ? theme.primary : INACTIVE_COLOR },
          ]}>
          {item.label}
        </Text>
        {item.suffix ? <View style={styles.suffix}>{item.suffix}</View> : null}
      </Pressable>
    );
  });

  if (fullWidth) {
    return (
      <View
        style={styles.fullWidthWrapper}
        accessibilityRole="tablist"
        accessibilityLabel={accessibilityLabel}>
        <View style={[styles.track, styles.trackFullWidth]}>{pills}</View>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={styles.track}>
      {pills}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fullWidthWrapper: {
    alignSelf: 'stretch',
    width: '100%',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TRACK_COLOR,
    borderRadius: 12,
    padding: 4,
  },
  trackFullWidth: {
    width: '100%',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillFullWidth: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 11,
  },
  pillActive: {
    backgroundColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  pillLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
  },
  pillLabelFullWidth: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
  suffix: {
    marginLeft: 2,
  },
});
