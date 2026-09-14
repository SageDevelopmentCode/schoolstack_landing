import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImageCarousel } from '@/components/image-carousel';
import { IntroSlideCopy } from '@/components/intro-slide-copy';
import { MudKitchenLogo } from '@/components/mudkitchen-logo';
import { StoryButton } from '@/components/story/story-button';
import { INTRO_SLIDE_INTERVAL_MS, INTRO_SLIDES } from '@/constants/intro-slides';
import { Story } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { isMobileE2e } from '@/lib/e2e';

const logoEntering = isMobileE2e ? undefined : FadeInDown.duration(500);
const copyEntering = isMobileE2e ? undefined : FadeInUp.duration(500).delay(120);
const ctaEntering = isMobileE2e ? undefined : FadeInUp.duration(500).delay(240);

export default function IntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, portalType, isLoading } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  if (isMobileE2e) {
    return <Redirect href="/login" />;
  }

  if (isLoading) {
    return null;
  }

  if (user && portalType) {
    return <Redirect href="/portal" />;
  }

  if (user) {
    return <Redirect href="/portal" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.background}>
        <ImageCarousel
          slides={INTRO_SLIDES}
          activeIndex={activeIndex}
          onIndexChange={handleIndexChange}
          autoAdvanceMs={isMobileE2e ? undefined : INTRO_SLIDE_INTERVAL_MS}
          variant="fullscreen"
          scrim="story"
        />
      </View>

      <View
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + Spacing.three,
            paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
          },
        ]}
        pointerEvents="box-none">
        <Animated.View entering={logoEntering}>
          <MudKitchenLogo variant="dark" size="md" style={styles.logo} />
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View entering={copyEntering}>
          <IntroSlideCopy activeIndex={activeIndex} variant="overlay" />
        </Animated.View>

        <Animated.View entering={ctaEntering} style={styles.ctaDock}>
          <StoryButton
            testID="intro-login-cta"
            accessibilityLabel="Log in to continue"
            label="Log in to continue"
            trailingIcon={<Ionicons name="chevron-forward" size={20} color={Story.white} />}
            onPress={() => router.push('/login')}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  background: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  logo: {
    alignSelf: 'flex-start',
  },
  spacer: {
    flex: 1,
  },
  ctaDock: {
    marginTop: Spacing.four,
  },
});
