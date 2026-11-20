import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GPressable } from '@/components/parent/garden/ui';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { haptic } from '@/lib/haptics';
import { isMobileE2e } from '@/lib/e2e';
import { CALM_EASE, calmFadeIn, GLIDE, MOTION } from '@/lib/motion/portal-motion';

type IoniconName = keyof typeof Ionicons.glyphMap;

/** Height of the tab row (the part of the bar above the home-indicator area). */
const TAB_ROW_HEIGHT = 58;
const TAB_ROW_PADDING = 5;
const TOP_RULE = 1.5;

/**
 * Height the bar takes above the layout's safe-area edge (top rule + tab row).
 * Screens pad their content by this, so content ends exactly at the bar's top rule.
 * Every portal's `*_FLOATING_TAB_BAR_HEIGHT` points here. The bar also fills the
 * home-indicator area below that edge.
 */
export const GARDEN_TAB_BAR_HEIGHT = TAB_ROW_HEIGHT + 2;

export type GardenTabBarTab<Id extends string> = {
  id: Id;
  /** Full label. Read by VoiceOver / TalkBack and matched by Maestro. */
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
  /** Unread count, shown as a badge on the icon. */
  badge?: number;
  /** A tab that toggles a sheet (More). Shows a "close" chevron while the sheet is open. */
  sheetToggle?: boolean;
  testID?: string;
};

type GardenTabBarProps<Id extends string> = {
  tabs: GardenTabBarTab<Id>[];
  activeId: Id;
  onChange: (id: Id) => void;
  /** When true, omit absolute positioning (the layout supplies the bottom chrome stack). */
  embedded?: boolean;
  /** True while the sheet behind a `sheetToggle` tab (More) is open. */
  sheetOpen?: boolean;
  /** Optional row inside the bar, above the tabs (the parent co-op program chip). */
  header?: ReactNode;
};

/**
 * Show the short form of slash labels on the bar ("Billing / tuition" → "Billing").
 * The full label is kept as the accessibility label.
 */
export function gardenTabDisplayLabel(label: string): string {
  const [head] = label.split(' / ');
  return head?.trim() || label;
}

/**
 * Garden tab bar shared by every mobile portal. Attached to the bottom of the screen:
 * a paper bar with a hairline top rule that fills the home-indicator area, and an
 * accent pill that glides to the active tab.
 */
export function GardenTabBar<Id extends string>({
  tabs,
  activeId,
  onChange,
  embedded = false,
  sheetOpen = false,
  header,
}: GardenTabBarProps<Id>) {
  const accent = useGardenAccent();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);

  useEffect(() => {
    const layout = layouts[activeId];
    if (!layout) return;
    if (reduceMotion || isMobileE2e || pillWidth.value === 0) {
      pillX.value = layout.x;
      pillWidth.value = layout.width;
      return;
    }
    pillX.value = withTiming(layout.x, GLIDE);
    pillWidth.value = withTiming(layout.width, GLIDE);
  }, [activeId, layouts, pillWidth, pillX, reduceMotion]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillWidth.value,
    opacity: pillWidth.value > 0 ? 1 : 0,
  }));

  const activeExists = tabs.some((tab) => tab.id === activeId);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.bar,
        // Portal layouts are SafeAreaViews that already pad the bottom inset; reach past it
        // so the bar fills the home-indicator area instead of leaving a band below it.
        embedded ? styles.barEmbedded : { bottom: -insets.bottom },
        { paddingBottom: insets.bottom },
      ]}>
      {header}
      <View accessibilityRole="tablist" style={styles.row}>
        {activeExists ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.pill, { backgroundColor: accent.clay }, pillStyle]}
          />
        ) : null}
        {tabs.map((tab) => (
          <GardenTabItem
            key={tab.id}
            tab={tab}
            active={tab.id === activeId}
            sheetOpen={Boolean(tab.sheetToggle && sheetOpen)}
            onLayout={(x, width) =>
              setLayouts((prev) => {
                const current = prev[tab.id];
                if (current && current.x === x && current.width === width) return prev;
                return { ...prev, [tab.id]: { x, width } };
              })
            }
            onPress={() => {
              const active = tab.id === activeId;
              if (!active || tab.sheetToggle) haptic.select();
              else haptic.tap();
              onChange(tab.id);
            }}
          />
        ))}
      </View>
    </View>
  );
}

function GardenTabItem<Id extends string>({
  tab,
  active,
  sheetOpen,
  onPress,
  onLayout,
}: {
  tab: GardenTabBarTab<Id>;
  active: boolean;
  sheetOpen: boolean;
  onPress: () => void;
  onLayout: (x: number, width: number) => void;
}) {
  const accent = useGardenAccent();
  const color = active ? Garden.white : Garden.ink60;
  const badge = tab.badge ?? 0;
  const iconName: IoniconName = sheetOpen ? 'chevron-down' : active ? tab.iconActive : tab.icon;

  return (
    <GPressable
      testID={tab.testID}
      haptic="none"
      pressedScale={0.92}
      hitSlop={2}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityValue={badge > 0 ? { text: `${badge} unread` } : undefined}
      accessibilityHint={
        tab.sheetToggle ? (sheetOpen ? 'Closes the more menu' : 'Opens the more menu') : undefined
      }
      accessibilityState={{ selected: active }}
      onLayout={(event) => {
        const { x, width } = event.nativeEvent.layout;
        onLayout(x, width);
      }}
      onPress={onPress}
      style={styles.tab}>
      <View style={styles.iconWrap}>
        <Animated.View
          key={iconName}
          entering={calmFadeIn({ duration: MOTION.fast })}
          style={styles.iconInner}>
          <Ionicons name={iconName} size={21} color={color} />
        </Animated.View>
        {badge > 0 ? (
          <TabBadge
            count={badge}
            background={active ? Garden.white : accent.clay}
            foreground={active ? accent.clayDeep : Garden.white}
            ring={active ? accent.clay : Garden.paper}
          />
        ) : null}
      </View>
      <Text
        style={[styles.label, active ? styles.labelActive : null, { color: active ? Garden.white : Garden.soft }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        maxFontSizeMultiplier={1.2}
        importantForAccessibility="no">
        {gardenTabDisplayLabel(tab.label)}
      </Text>
    </GPressable>
  );
}

function TabBadge({
  count,
  background,
  foreground,
  ring,
}: {
  count: number;
  background: string;
  foreground: string;
  ring: string;
}) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const previous = useRef(count);

  useEffect(() => {
    const grew = count > previous.current;
    previous.current = count;
    if (!grew || reduceMotion || isMobileE2e) return;
    scale.value = withSequence(
      withTiming(1.1, { duration: 120, easing: CALM_EASE }),
      withTiming(1, { duration: 180, easing: CALM_EASE }),
    );
  }, [count, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.badge, { backgroundColor: background, borderColor: ring }, style]}>
      <Text style={[styles.badgeText, { color: foreground }]}>{count > 9 ? '9+' : String(count)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: Garden.paper,
    borderTopWidth: TOP_RULE,
    borderTopColor: Garden.ink12,
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  barEmbedded: {
    position: 'relative',
  },
  row: {
    height: TAB_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 8,
    paddingVertical: TAB_ROW_PADDING,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  pill: {
    position: 'absolute',
    top: TAB_ROW_PADDING,
    bottom: TAB_ROW_PADDING,
    left: 0,
    borderRadius: 16,
  },
  tab: {
    flex: 1,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 2,
    borderRadius: 16,
  },
  iconWrap: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  labelActive: {
    fontFamily: GardenFonts.bodyExtra,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -9,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 10,
    lineHeight: 12,
  },
});
