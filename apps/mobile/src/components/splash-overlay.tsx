import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { isMobileE2e } from '@/lib/e2e';

const SPLASH_FALLBACK_MS = 2000;
const LOGO_SIZE = 128;

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
      <LinearGradient
        colors={[Brand.surface, Brand.bg, Brand.claySoft]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.pedestal}>
          <Image
            style={styles.logo}
            source={require('@/assets/images/logo.png')}
            contentFit="contain"
          />
        </View>
        <ThemedText type="logo" style={styles.wordmark}>
          MudKitchen
        </ThemedText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    gap: 20,
  },
  pedestal: {
    width: LOGO_SIZE + 32,
    height: LOGO_SIZE + 32,
    borderRadius: (LOGO_SIZE + 32) / 2,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  wordmark: {
    fontSize: 28,
  },
});
