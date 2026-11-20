import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Garden } from '@/components/parent/garden/tokens';
import { GHand } from '@/components/parent/garden/ui';
import type { IntroDayMoment } from '@/constants/intro-day';
import { CALM_EASE } from '@/lib/motion/portal-motion';

const SUN_SIZE = 24;
const STOP_SIZE = 8;

type DayTrackProps = {
  moments: IntroDayMoment[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Deep ink of the current moment's pastel: track fill, passed stops, handwriting. */
  accent: string;
  reduceMotion: boolean;
};

/**
 * A hairline day with one stop per moment. The sun glides to the active stop;
 * the handwritten time of day sits above it. One adjustable control for screen
 * readers (swipe up / down to move through the day).
 */
export function DayTrack({ moments, activeIndex, onSelect, accent, reduceMotion }: DayTrackProps) {
  const [width, setWidth] = useState(0);
  const sunX = useSharedValue(0);
  const count = moments.length;
  const active = moments[activeIndex];

  const stopX = (index: number) => (count > 1 ? (index / (count - 1)) * width : 0);

  useEffect(() => {
    if (width === 0) return;
    const target = stopX(activeIndex);
    sunX.value = reduceMotion
      ? withTiming(target, { duration: 0 })
      : withTiming(target, { duration: 360, easing: CALM_EASE });
    // stopX only depends on width/count, both covered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, width, reduceMotion]);

  const sunStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sunX.value - SUN_SIZE / 2 }],
  }));
  const fillStyle = useAnimatedStyle(() => ({ width: Math.max(0, sunX.value) }));

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="A school day in MudKitchen"
      accessibilityValue={{ text: `${active.when}: ${active.title}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'increment') {
          onSelect((activeIndex + 1) % count);
        } else if (event.nativeEvent.actionName === 'decrement') {
          onSelect((activeIndex - 1 + count) % count);
        }
      }}
      style={styles.container}>
      <View style={styles.handRow}>
        <GHand color={accent}>{active.when}</GHand>
      </View>

      <View style={styles.trackArea} onLayout={handleLayout}>
        <View style={styles.line} />
        <Animated.View style={[styles.lineFill, { backgroundColor: accent }, fillStyle]} />
        {width > 0
          ? moments.map((moment, index) => (
              <Pressable
                key={moment.id}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                hitSlop={{ top: 16, bottom: 16, left: 8, right: 8 }}
                onPress={() => onSelect(index)}
                style={[styles.stopHit, { left: stopX(index) - 14 }]}>
                <View
                  style={[
                    styles.stop,
                    index <= activeIndex ? { backgroundColor: accent, borderColor: accent } : null,
                  ]}
                />
              </Pressable>
            ))
          : null}
        {width > 0 ? (
          <Animated.View pointerEvents="none" style={[styles.sun, sunStyle]}>
            <View style={styles.sunCore} />
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  handRow: {
    minHeight: 26,
    justifyContent: 'flex-end',
  },
  trackArea: {
    height: 28,
    justifyContent: 'center',
    marginHorizontal: SUN_SIZE / 2,
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: Garden.ink15,
  },
  lineFill: {
    position: 'absolute',
    left: 0,
    height: 2,
    borderRadius: 1,
  },
  stopHit: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stop: {
    width: STOP_SIZE,
    height: STOP_SIZE,
    borderRadius: STOP_SIZE / 2,
    backgroundColor: Garden.cream,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
  },
  sun: {
    position: 'absolute',
    left: 0,
    width: SUN_SIZE,
    height: SUN_SIZE,
    borderRadius: SUN_SIZE / 2,
    backgroundColor: Garden.butter,
    borderWidth: 2,
    borderColor: Garden.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F2C94C',
  },
});
