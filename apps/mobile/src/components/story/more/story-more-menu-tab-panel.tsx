import { useEffect, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { isMobileE2e } from '@/lib/e2e';
import { TAB_PANEL_ENTER_DURATION } from '@/lib/motion/portal-motion';

type StoryMoreMenuTabPanelProps = {
  visible: boolean;
  children: ReactNode;
};

export function StoryMoreMenuTabPanel({ visible, children }: StoryMoreMenuTabPanelProps) {
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (!visible) {
      if (!isMobileE2e) {
        opacity.value = 0;
      }
      return;
    }

    if (isMobileE2e) {
      opacity.value = 1;
      return;
    }

    opacity.value = 0;
    opacity.value = withTiming(1, { duration: TAB_PANEL_ENTER_DURATION });
  }, [opacity, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.panel, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
  },
});
