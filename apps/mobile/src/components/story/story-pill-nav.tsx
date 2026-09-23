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

type StoryPillNavSize = 'compact' | 'comfortable';

type StoryPillNavProps = {
  items: StoryPillNavItem[];
  activeKey: string;
  onChange: (key: string) => void;
  accessibilityLabel?: string;
  fullWidth?: boolean;
  size?: StoryPillNavSize;
};

const TRACK_COLOR = '#EAF2EB';
const INACTIVE_COLOR = '#728079';

const SIZE_STYLES: Record<
  StoryPillNavSize,
  {
    trackPadding: number;
    pillPaddingHorizontal: number;
    pillPaddingVertical: number;
    iconSize: number;
    labelFontSize: number;
    fullWidthLabelFontSize: number;
    fullWidthPaddingVertical: number;
  }
> = {
  compact: {
    trackPadding: 4,
    pillPaddingHorizontal: 12,
    pillPaddingVertical: 8,
    iconSize: 12,
    labelFontSize: 11,
    fullWidthLabelFontSize: 13,
    fullWidthPaddingVertical: 11,
  },
  comfortable: {
    trackPadding: 5,
    pillPaddingHorizontal: 14,
    pillPaddingVertical: 11,
    iconSize: 15,
    labelFontSize: 13,
    fullWidthLabelFontSize: 14,
    fullWidthPaddingVertical: 12,
  },
};

export function StoryPillNav({
  items,
  activeKey,
  onChange,
  accessibilityLabel = 'Sections',
  fullWidth = false,
  size = 'compact',
}: StoryPillNavProps) {
  const theme = useParentTheme();
  const metrics = SIZE_STYLES[size];

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
          {
            paddingHorizontal: fullWidth ? 8 : metrics.pillPaddingHorizontal,
            paddingVertical: fullWidth ? metrics.fullWidthPaddingVertical : metrics.pillPaddingVertical,
          },
          active && styles.pillActive,
          active && { shadowColor: '#dbe2dc' },
          pressed && !item.disabled && { opacity: 0.85 },
          item.disabled && { opacity: 0.7 },
        ]}>
        {item.icon ? (
          <Ionicons
            name={item.icon}
            size={fullWidth ? metrics.iconSize : metrics.iconSize}
            color={active ? theme.primary : INACTIVE_COLOR}
          />
        ) : null}
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            fullWidth ? styles.pillLabelFullWidth : styles.pillLabel,
            {
              color: active ? theme.primary : INACTIVE_COLOR,
              fontSize: fullWidth ? metrics.fullWidthLabelFontSize : metrics.labelFontSize,
            },
          ]}>
          {item.label}
        </Text>
        {item.suffix ? <View style={styles.suffix}>{item.suffix}</View> : null}
      </Pressable>
    );
  });

  const trackStyle = [
    styles.track,
    { padding: metrics.trackPadding },
    fullWidth && styles.trackFullWidth,
  ];

  if (fullWidth) {
    return (
      <View
        style={styles.fullWidthWrapper}
        accessibilityRole="tablist"
        accessibilityLabel={accessibilityLabel}>
        <View style={trackStyle}>{pills}</View>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={trackStyle}>
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
  },
  trackFullWidth: {
    width: '100%',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
  },
  pillFullWidth: {
    flex: 1,
    justifyContent: 'center',
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
    fontWeight: '700',
  },
  pillLabelFullWidth: {
    fontFamily: StoryFonts.bodySemiBold,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
  suffix: {
    marginLeft: 2,
  },
});
