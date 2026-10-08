import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { BrandedSplashContent } from '@/components/branded-splash-content';
import { useAuth } from '@/contexts/auth-context';
import { isMobileE2e } from '@/lib/e2e';

const SPLASH_FALLBACK_MS = 2000;

export function SplashOverlay() {
  const { isLoading } = useAuth();
  const [visible, setVisible] = useState(!isMobileE2e);
  const opacity = useSharedValue(isMobileE2e ? 0 : 1);

  useEffect(() => {
    if (isMobileE2e) {
      void SplashScreen.hideAsync();
      setVisible(false);
      return;
    }

    let dismissed = false;

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;

      void SplashScreen.hideAsync().then(() => {
        opacity.value = withTiming(0, { duration: 450 }, (finished) => {
          if (finished) {
            runOnJS(setVisible)(false);
          }
        });
      });
    };

    const fallbackTimer = setTimeout(dismiss, SPLASH_FALLBACK_MS);

    if (!isLoading) {
      dismiss();
    }

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [isLoading, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, animatedStyle]}>
      <BrandedSplashContent />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
});
