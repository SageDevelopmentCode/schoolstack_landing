import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImageCarousel } from '@/components/image-carousel';
import { IntroSlideCopy } from '@/components/intro-slide-copy';
import { MudKitchenLogo } from '@/components/mudkitchen-logo';
import { PrimaryButton } from '@/components/primary-button';
import { INTRO_SLIDE_INTERVAL_MS, INTRO_SLIDES } from '@/constants/intro-slides';
import { Spacing } from '@/constants/theme';
import { isMobileE2e } from '@/lib/e2e';

const logoEntering = isMobileE2e ? undefined : FadeInDown.duration(500);
const copyEntering = isMobileE2e ? undefined : FadeInUp.duration(500).delay(120);
const ctaEntering = isMobileE2e ? undefined : FadeInUp.duration(500).delay(240);

export default function IntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  if (isMobileE2e) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ImageCarousel
        slides={INTRO_SLIDES}
        activeIndex={activeIndex}
        onIndexChange={handleIndexChange}
        autoAdvanceMs={isMobileE2e ? undefined : INTRO_SLIDE_INTERVAL_MS}
      />

      <View style={[styles.overlay, { paddingTop: insets.top + 12 }]}>
        <Animated.View entering={logoEntering}>
          <MudKitchenLogo variant="dark" size="sm" style={styles.logo} />
        </Animated.View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.bottomScrim}
          pointerEvents="none"
        />

        <View
          style={[
            styles.bottomStack,
            {
              paddingBottom: insets.bottom + Spacing.three,
              paddingHorizontal: Spacing.four,
            },
          ]}>
          <Animated.View entering={copyEntering} style={styles.copyArea}>
            <IntroSlideCopy activeIndex={activeIndex} />
          </Animated.View>

          <Animated.View entering={ctaEntering} style={styles.ctaDock}>
            <PrimaryButton
              testID="intro-login-cta"
              accessibilityLabel="Log in to continue"
              appearance="native"
              variant="clay"
              trailingIcon
              label="Log in to continue"
              onPress={() => router.push('/login')}
              style={styles.ctaButton}
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  logo: {
    marginLeft: Spacing.four,
  },
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
    zIndex: 0,
  },
  bottomStack: {
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  copyArea: {
    gap: Spacing.two,
  },
  ctaDock: {
    marginTop: Spacing.four,
    paddingTop: Spacing.three,
  },
  ctaButton: {
    width: '100%',
  },
});
