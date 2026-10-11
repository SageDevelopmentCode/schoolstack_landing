import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { BrandedSplashContent } from '@/components/branded-splash-content';
import { Brand } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { isMobileE2e } from '@/lib/e2e';

const SPLASH_FALLBACK_MS = 2000;
const FADE_MS = 450;

export function SplashOverlay() {
  const { isLoading } = useAuth();
  const [visible, setVisible] = useState(!isMobileE2e);
  const opacity = useSharedValue(isMobileE2e ? 0 : 1);
  const dismissFailsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissFailsafe = () => {
    if (dismissFailsafeRef.current) {
      clearTimeout(dismissFailsafeRef.current);
      dismissFailsafeRef.current = null;
    }
  };

  const hideOverlay = () => {
    clearDismissFailsafe();
    setVisible(false);
  };

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
        clearDismissFailsafe();
        dismissFailsafeRef.current = setTimeout(() => {
          hideOverlay();
        }, FADE_MS + 100);

        opacity.value = withTiming(0, { duration: FADE_MS }, (finished) => {
          if (finished) {
            runOnJS(hideOverlay)();
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
      clearDismissFailsafe();
    };
  }, [isLoading, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (isMobileE2e) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="fullScreen"
      transparent={false}
      statusBarTranslucent
      onRequestClose={() => {}}>
      <Animated.View style={[styles.modalBody, animatedStyle]}>
        <BrandedSplashContent variant="overlay" showActivityIndicator={isLoading} />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBody: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
});
