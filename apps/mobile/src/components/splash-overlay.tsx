import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Brand } from '@/constants/theme';

export function SplashOverlay() {
  const [visible, setVisible] = useState(true);
  const opacity = useSharedValue(1);

  useEffect(() => {
    SplashScreen.hideAsync().then(() => {
      opacity.value = withTiming(0, { duration: 450 }, (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
        }
      });
    });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, animatedStyle]}>
      <Image
        style={styles.logo}
        source={require('@/assets/images/logo.webp')}
        contentFit="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Brand.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  logo: {
    width: 80,
    height: 80,
  },
});
