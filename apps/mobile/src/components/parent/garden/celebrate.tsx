import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Garden, useGardenAccent } from '@/components/parent/garden/tokens';
import { haptic } from '@/lib/haptics';
import { isMobileE2e } from '@/lib/e2e';

/** Keys that already celebrated this app session (web uses sessionStorage). */
const celebratedKeys = new Set<string>();

const PIECE_COUNT = 28;

type Piece = {
  x: number;
  drift: number;
  delay: number;
  rotate: number;
  size: number;
  color: string;
  round: boolean;
};

function ConfettiPiece({ piece, height }: { piece: Piece; height: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }),
    );
  }, [piece.delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value < 0.75 ? 1 : 1 - (progress.value - 0.75) / 0.25,
    transform: [
      { translateX: piece.x + piece.drift * progress.value },
      { translateY: -24 + height * 0.7 * progress.value },
      { rotate: `${piece.rotate * progress.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: piece.size,
          height: piece.round ? piece.size : piece.size * 0.45,
          borderRadius: piece.round ? piece.size / 2 : 1.5,
          backgroundColor: piece.color,
        },
        style,
      ]}
    />
  );
}

/**
 * One confetti burst + success haptic for a REAL success moment (e.g. all caught up).
 * Fires once per app session per `celebrationKey`; skipped under reduced motion and E2E.
 */
export function GCelebrate({ active, celebrationKey }: { active: boolean; celebrationKey: string }) {
  const accent = useGardenAccent();
  const reduceMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const [burst, setBurst] = useState<{ id: number; pieces: Piece[] } | null>(null);

  useEffect(() => {
    if (!active || celebratedKeys.has(celebrationKey)) return;
    celebratedKeys.add(celebrationKey);
    haptic.success();
    if (reduceMotion || isMobileE2e) return;
    const colors = [accent.clay, Garden.butter, Garden.mint, Garden.sky, Garden.lav];
    setBurst({
      id: Date.now(),
      pieces: Array.from({ length: PIECE_COUNT }, (_, i) => ({
        x: Math.random() * width,
        drift: (Math.random() - 0.5) * 120,
        delay: Math.random() * 260,
        rotate: (Math.random() - 0.5) * 720,
        size: 7 + Math.random() * 6,
        color: colors[i % colors.length],
        round: i % 3 === 0,
      })),
    });
  }, [accent.clay, active, celebrationKey, reduceMotion, width]);

  const burstId = burst?.id;
  useEffect(() => {
    if (burstId == null) return;
    const timer = setTimeout(() => setBurst(null), 2200);
    return () => clearTimeout(timer);
  }, [burstId]);

  if (!burst) return null;

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}>
      {burst.pieces.map((piece, index) => (
        <ConfettiPiece key={`${burst.id}-${index}`} piece={piece} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 1,
    borderColor: 'rgba(43,36,29,0.35)',
  },
});
