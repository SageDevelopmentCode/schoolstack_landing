import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Garden, GardenFonts, PORTAL_EASE } from '@/components/parent/garden/tokens';
import { GTape } from '@/components/parent/garden/ui';
import { Brand } from '@/constants/theme';

/**
 * MudKitchen splash in Calm Garden. Shown before any school is known, so the
 * accent is MudKitchen clay (`Brand.clay`), not the school accent.
 *
 * The logo matches the native splash (`app.json` › expo-splash-screen: cream,
 * logo.png at 140pt, centred) and sits at the exact screen centre, so nothing
 * jumps when the native splash hides. The paper card, tape, wordmark and
 * loader appear around it.
 */
const LOGO_SIZE = 140;
const CARD_PADDING = 20;
const CARD_SIZE = LOGO_SIZE + CARD_PADDING * 2;
const CARD_OFFSET = 5;
const DOT_TINTS = [Garden.butter, Garden.mint, Garden.sky] as const;

type BrandedSplashContentProps = {
  variant?: 'inline' | 'overlay';
  showActivityIndicator?: boolean;
};

export function BrandedSplashContent({
  variant = 'inline',
  showActivityIndicator = false,
}: BrandedSplashContentProps) {
  const rootStyle = variant === 'overlay' ? styles.rootOverlay : styles.rootInline;

  return (
    <View style={rootStyle}>
      <StatusBar style="dark" />

      <View style={styles.centre} pointerEvents="none">
        <Animated.View
          entering={FadeIn.duration(320).easing(PORTAL_EASE)}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.frame}>
          <View style={styles.cardUnderlay} />
          <View style={styles.card} />
          <GTape color={Garden.butter} rotate={-3} />
        </Animated.View>
        <Image
          style={styles.logo}
          source={require('@/assets/images/logo.png')}
          contentFit="contain"
          accessibilityIgnoresInvertColors
          accessible={false}
        />
      </View>

      <View style={styles.below}>
        <Animated.View entering={FadeInDown.delay(60).duration(320).easing(PORTAL_EASE)}>
          <Text accessibilityRole="header" accessibilityLabel="MudKitchen" style={styles.wordmark}>
            Mud<Text style={styles.wordmarkAccent}>Kitchen</Text>
          </Text>
        </Animated.View>
        {showActivityIndicator ? <GardenLoader /> : <View style={styles.loaderSpacer} />}
      </View>
    </View>
  );
}

function GardenLoader() {
  return (
    <Animated.View
      entering={FadeIn.delay(160).duration(320).easing(PORTAL_EASE)}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={styles.loader}>
      {DOT_TINTS.map((tint, index) => (
        <LoaderDot key={tint} tint={tint} index={index} />
      ))}
    </Animated.View>
  );
}

function LoaderDot({ tint, index }: { tint: string; index: number }) {
  const reduceMotion = useReducedMotion();
  const lift = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      lift.value = 0;
      return;
    }
    lift.value = withDelay(
      index * 140,
      withRepeat(
        withSequence(
          withTiming(-7, { duration: 280, easing: PORTAL_EASE }),
          withTiming(0, { duration: 280, easing: PORTAL_EASE }),
          withTiming(0, { duration: 260 }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(lift);
  }, [index, lift, reduceMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }] }));

  return <Animated.View style={[styles.dot, { backgroundColor: tint }, style]} />;
}

const styles = StyleSheet.create({
  rootInline: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Garden.cream,
  },
  rootOverlay: {
    flex: 1,
    width: '100%',
    backgroundColor: Garden.cream,
  },
  centre: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    position: 'absolute',
    width: CARD_SIZE,
    height: CARD_SIZE,
    transform: [{ rotate: '-2deg' }],
  },
  // A real ink underlay so the hard offset shadow looks the same on Android.
  cardUnderlay: {
    position: 'absolute',
    top: CARD_OFFSET,
    left: CARD_OFFSET,
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 30,
    backgroundColor: Garden.ink,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Garden.ink,
    backgroundColor: Garden.paper,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  below: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: CARD_SIZE / 2 + CARD_OFFSET + 28,
    alignItems: 'center',
    gap: 18,
  },
  wordmark: {
    fontFamily: GardenFonts.display,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: Garden.ink,
  },
  wordmarkAccent: {
    color: Brand.clay,
  },
  loader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 24,
  },
  loaderSpacer: {
    height: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Garden.ink,
  },
});
