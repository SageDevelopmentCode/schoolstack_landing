import { useEffect, useRef, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { isMobileE2e } from '@/lib/e2e';
import { TAB_ENTER_DURATION } from '@/lib/motion/portal-motion';

type AnimatedTabContentProps = {
  transitionKey: string | null;
  children: ReactNode;
};

export function AnimatedTabContent({ transitionKey, children }: AnimatedTabContentProps) {
  const opacity = useSharedValue(1);
  const previousKeyRef = useRef(transitionKey);

  useEffect(() => {
    if (isMobileE2e || !transitionKey) {
      opacity.value = 1;
      previousKeyRef.current = transitionKey;
      return;
    }

    if (previousKeyRef.current !== transitionKey) {
      opacity.value = 0;
      opacity.value = withTiming(1, { duration: TAB_ENTER_DURATION });
      previousKeyRef.current = transitionKey;
    }
  }, [opacity, transitionKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (isMobileE2e) {
    return children;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
