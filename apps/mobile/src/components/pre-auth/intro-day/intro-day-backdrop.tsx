import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PORTAL_EASE } from '@/components/parent/garden/tokens';

/** Full-screen colour wash that crossfades to each moment's pastel. Decorative. */
export function IntroDayBackdrop({ color, reduceMotion }: { color: string; reduceMotion: boolean }) {
  const background = useSharedValue(color);

  useEffect(() => {
    background.value = withTiming(color, {
      duration: reduceMotion ? 0 : 600,
      easing: PORTAL_EASE,
    });
  }, [background, color, reduceMotion]);

  const animated = useAnimatedStyle(() => ({ backgroundColor: background.value }));

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, animated]}
    />
  );
}
