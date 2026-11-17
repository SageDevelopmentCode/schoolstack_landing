import { useObserve } from '@/lib/mobile-observe';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IntroLegalLinks } from '@/components/intro-legal-links';
import { MudKitchenLogo } from '@/components/mudkitchen-logo';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GToyButton } from '@/components/parent/garden/ui';
import { IntroDayBackdrop } from '@/components/pre-auth/intro-day/intro-day-backdrop';
import { IntroDayStage } from '@/components/pre-auth/intro-day/intro-day-stage';
import { useIntroDayCycle } from '@/components/pre-auth/intro-day/use-intro-day-cycle';
import { MudKitchenGardenThemeProvider } from '@/components/pre-auth/mudkitchen-garden-theme';
import {
  INTRO_DAY,
  INTRO_DAY_INTERVAL_MS,
  INTRO_DAY_RESUME_MS,
  INTRO_HEADLINE,
} from '@/constants/intro-day';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Brand } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { isMobileE2e } from '@/lib/e2e';

/** Below this window height the stage drops the polaroid and shows two notes. */
const COMPACT_HEIGHT = 720;

const logoEntering = isMobileE2e ? undefined : FadeInDown.duration(500);
const stageEntering = isMobileE2e ? undefined : FadeInUp.duration(600).delay(80);
const copyEntering = isMobileE2e ? undefined : FadeInUp.duration(500).delay(200);
const ctaEntering = isMobileE2e ? undefined : FadeInUp.duration(500).delay(320);

export default function IntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, portalType, isLoading } = useAuth();
  const { height } = useWindowDimensions();
  const { markInteractive } = useObserve();
  const reduceMotion = useReducedMotion();
  const day = useIntroDayCycle({
    count: INTRO_DAY.length,
    intervalMs: INTRO_DAY_INTERVAL_MS,
    resumeMs: INTRO_DAY_RESUME_MS,
    reduceMotion,
  });

  useEffect(() => {
    if (isMobileE2e || isLoading || user) return;
    markInteractive();
  }, [isLoading, isMobileE2e, markInteractive, user]);

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
    <MudKitchenGardenThemeProvider>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 12,
            paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
          },
        ]}>
        <IntroDayBackdrop color={INTRO_DAY[day.activeIndex].wash} reduceMotion={reduceMotion} />
        <StatusBar style="dark" />

        <Animated.View entering={logoEntering}>
          <MudKitchenLogo size="md" />
        </Animated.View>

        <Animated.View entering={stageEntering} style={styles.stage}>
          <IntroDayStage
            compact={height < COMPACT_HEIGHT}
            activeIndex={day.activeIndex}
            select={day.select}
            step={day.step}
            hold={day.hold}
            reduceMotion={reduceMotion}
          />
        </Animated.View>

        <Animated.View entering={copyEntering}>
          <Text accessibilityRole="header" style={styles.headline}>
            {INTRO_HEADLINE.lead}{' '}
            <Text style={styles.headlineAccent}>{INTRO_HEADLINE.accent}</Text>
          </Text>
        </Animated.View>

        <Animated.View entering={ctaEntering} style={styles.ctaDock}>
          <GToyButton
            testID="intro-login-cta"
            accessibilityLabel="Log in to continue"
            label="Log in to continue"
            size="md"
            fullWidth
            onPress={() => router.push('/login')}
          />
          <IntroLegalLinks />
        </Animated.View>
      </View>
    </MudKitchenGardenThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Garden.cream,
  },
  stage: {
    flex: 1,
    paddingVertical: 12,
  },
  headline: {
    fontFamily: GardenFonts.display,
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -1.1,
    color: Garden.ink,
  },
  headlineAccent: {
    color: Brand.clay,
  },
  ctaDock: {
    marginTop: 20,
    gap: 6,
  },
});
