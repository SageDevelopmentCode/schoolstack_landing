import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  Garden,
  GardenFonts,
  PORTAL_EASE,
} from '@/components/parent/garden/tokens';
import type { IntroDayMoment } from '@/constants/intro-day';
import { calmEnter, calmExit, calmLayout, MOTION } from '@/lib/motion/portal-motion';

/** Scale and opacity by depth: the newest note on top, older ones settle back. */
const DEPTH_SCALE = [1, 0.95, 0.9];
const DEPTH_OPACITY = [1, 0.62, 0.36];

type NotificationStackProps = {
  moments: IntroDayMoment[];
  activeIndex: number;
  depth: number;
  reduceMotion: boolean;
};

/** The last `depth` moments of the day as sample notifications, newest on top. */
export function NotificationStack({
  moments,
  activeIndex,
  depth,
  reduceMotion,
}: NotificationStackProps) {
  const count = moments.length;
  const visible = Array.from(
    { length: Math.min(depth, count) },
    (_, offset) => {
      const index = (activeIndex - offset + count) % count;
      return { moment: moments[index], position: offset };
    },
  );

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility='no-hide-descendants'
      pointerEvents='none'
      style={styles.stack}
    >
      {visible.map(({ moment, position }) => (
        <Animated.View
          key={moment.id}
          entering={reduceMotion ? undefined : calmEnter()}
          exiting={reduceMotion ? undefined : calmExit(MOTION.base)}
          layout={reduceMotion ? undefined : calmLayout}
        >
          <StickerCard
            moment={moment}
            position={position}
            reduceMotion={reduceMotion}
          />
        </Animated.View>
      ))}
    </View>
  );
}

function StickerCard({
  moment,
  position,
  reduceMotion,
}: {
  moment: IntroDayMoment;
  position: number;
  reduceMotion: boolean;
}) {
  const scale = useSharedValue(DEPTH_SCALE[position] ?? 0.9);
  const opacity = useSharedValue(DEPTH_OPACITY[position] ?? 0.4);

  useEffect(() => {
    const config = { duration: reduceMotion ? 0 : 360, easing: PORTAL_EASE };
    scale.value = withTiming(DEPTH_SCALE[position] ?? 0.9, config);
    opacity.value = withTiming(DEPTH_OPACITY[position] ?? 0.4, config);
  }, [opacity, position, reduceMotion, scale]);

  // The card face stays opaque so nothing behind it shows through; only its
  // content dims as it settles back in the stack.
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.card, position === 0 && styles.cardTop, cardStyle]}
    >
      <Animated.View style={[styles.content, contentStyle]}>
        <View style={[styles.iconTile, { backgroundColor: moment.tint }]}>
          <Ionicons
            name={moment.sticker.icon}
            size={19}
            color={moment.sticker.color}
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            {moment.sticker.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {moment.sticker.subtitle}
          </Text>
        </View>
        {position === 0 ? <Text style={styles.now}>now</Text> : null}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10,
  },
  card: {
    minHeight: 62,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: Garden.notebook,
    borderWidth: 1,
    borderColor: Garden.ink10,
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTop: {
    backgroundColor: Garden.white,
    borderColor: Garden.ink15,
    shadowOpacity: 0.16,
    elevation: 6,
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 19,
    color: Garden.ink,
  },
  subtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 17,
    color: Garden.soft,
  },
  now: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 12,
    color: Garden.soft,
  },
});
