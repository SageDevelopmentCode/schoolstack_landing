import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { haptic } from '@/lib/haptics';

export type GSegmentedItem<Id extends string> = {
  id: Id;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: number;
};

const PILL_SPRING = { damping: 22, stiffness: 380 } as const;

/** Segmented tab bar with an accent pill that glides to the active tab. */
export function GSegmented<Id extends string>({
  items,
  activeId,
  onChange,
  style,
  compact = false,
}: {
  items: GSegmentedItem<Id>[];
  activeId: Id;
  onChange: (id: Id) => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const accent = useGardenAccent();
  const reduceMotion = useReducedMotion();
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const x = useSharedValue(0);
  const width = useSharedValue(0);

  useEffect(() => {
    const layout = layouts[activeId];
    if (!layout) return;
    if (reduceMotion || width.value === 0) {
      x.value = layout.x;
      width.value = layout.width;
    } else {
      x.value = withSpring(layout.x, PILL_SPRING);
      width.value = withSpring(layout.width, PILL_SPRING);
    }
  }, [activeId, layouts, reduceMotion, width, x]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: width.value,
    opacity: width.value > 0 ? 1 : 0,
  }));

  return (
    <View accessibilityRole="tablist" style={[styles.bar, style]}>
      <Animated.View style={[styles.pill, { backgroundColor: accent.clay }, pillStyle]} />
      {items.map((item) => {
        const active = item.id === activeId;
        const color = active ? Garden.white : Garden.ink;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityLabel={
              item.badge ? `${item.label}, ${item.badge} need attention` : item.label
            }
            accessibilityState={{ selected: active }}
            onLayout={(event) => {
              const { x: itemX, width: itemWidth } = event.nativeEvent.layout;
              setLayouts((prev) => {
                const current = prev[item.id];
                if (current && current.x === itemX && current.width === itemWidth) return prev;
                return { ...prev, [item.id]: { x: itemX, width: itemWidth } };
              });
            }}
            onPress={() => {
              if (active) return;
              haptic.select();
              onChange(item.id);
            }}
            style={[styles.item, compact && styles.itemCompact]}>
            {item.icon ? <Ionicons name={item.icon} size={15} color={color} /> : null}
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {item.label}
            </Text>
            {item.badge ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: active ? Garden.white : accent.clay },
                ]}>
                <Text style={[styles.badgeText, { color: active ? accent.clayDeep : Garden.white }]}>
                  {item.badge}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  pill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    borderRadius: 999,
  },
  item: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  itemCompact: {
    flex: 0,
    minHeight: 36,
    paddingHorizontal: 14,
  },
  label: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
  },
});
