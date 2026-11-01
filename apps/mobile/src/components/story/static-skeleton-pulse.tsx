import { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

type StaticSkeletonPulseProps = {
  style: ViewStyle;
  backgroundColor: string;
};

/** Pulse skeleton without react-native-reanimated (safe for lazy route chunks). */
export function StaticSkeletonPulse({ style, backgroundColor }: StaticSkeletonPulseProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [opacity]);

  return <Animated.View style={[style, { backgroundColor, opacity }]} />;
}
