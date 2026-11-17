import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { isMobileE2e } from '@/lib/e2e';

type MudKitchenLogoProps = {
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

/** Resting tilt of the pot, as on the web navbar's hover. */
const REST_TILT = -6;

/**
 * The MudKitchen wordmark in Garden: the pot and "MudKitchen" in Bricolage on a
 * paper pill, like the web Garden navbar once it floats. The pot gives one small
 * wiggle when the badge appears.
 */
export function MudKitchenLogo({ size = 'md', style }: MudKitchenLogoProps) {
  const reduceMotion = useReducedMotion();
  const isMd = size === 'md';
  const iconSize = isMd ? 30 : 24;
  const tilt = useSharedValue(REST_TILT);

  useEffect(() => {
    if (reduceMotion || isMobileE2e) return;
    tilt.value = withDelay(
      350,
      withSequence(
        withTiming(6, { duration: 160 }),
        withTiming(-10, { duration: 180 }),
        withSpring(REST_TILT, { stiffness: 260, damping: 9 }),
      ),
    );
  }, [reduceMotion, tilt]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tilt.value}deg` }],
  }));

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="MudKitchen"
      style={[styles.pill, isMd ? styles.pillMd : styles.pillSm, style]}>
      <Animated.View style={iconStyle}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={{ width: iconSize, height: iconSize }}
          contentFit="contain"
        />
      </Animated.View>
      <Text style={[styles.wordmark, isMd ? styles.wordmarkMd : styles.wordmarkSm]}>
        MudKitchen
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Garden.ink10,
    backgroundColor: 'rgba(255, 250, 244, 0.92)',
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 11,
    elevation: 3,
  },
  pillMd: {
    gap: 8,
    paddingVertical: 7,
    paddingLeft: 10,
    paddingRight: 16,
  },
  pillSm: {
    gap: 6,
    paddingVertical: 5,
    paddingLeft: 8,
    paddingRight: 13,
  },
  wordmark: {
    fontFamily: GardenFonts.display,
    color: Garden.ink,
    letterSpacing: -0.6,
  },
  wordmarkMd: {
    fontSize: 18,
    lineHeight: 22,
  },
  wordmarkSm: {
    fontSize: 15,
    lineHeight: 19,
  },
});
