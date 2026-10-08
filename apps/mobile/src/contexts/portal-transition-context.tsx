import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { BrandedSplashContent } from '@/components/branded-splash-content';
import { isMobileE2e } from '@/lib/e2e';

const MIN_VISIBLE_MS = 400;
const MAX_VISIBLE_MS = 2500;
const FADE_MS = 450;

type PortalTransitionContextValue = {
  beginPortalTransition: () => void;
  completePortalTransition: () => void;
};

const PortalTransitionContext = createContext<PortalTransitionContextValue | null>(null);

export function PortalTransitionProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const opacity = useSharedValue(0);
  const beganAtRef = useRef<number | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissingRef = useRef(false);

  const clearMaxTimer = useCallback(() => {
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    clearMaxTimer();
    opacity.value = withTiming(0, { duration: FADE_MS }, (finished) => {
      if (finished) {
        runOnJS(setMounted)(false);
        runOnJS(() => {
          dismissingRef.current = false;
          beganAtRef.current = null;
        })();
      }
    });
  }, [clearMaxTimer, opacity]);

  const beginPortalTransition = useCallback(() => {
    if (isMobileE2e) return;

    clearMaxTimer();
    dismissingRef.current = false;
    beganAtRef.current = Date.now();
    setMounted(true);
    opacity.value = withTiming(1, { duration: FADE_MS });

    maxTimerRef.current = setTimeout(() => {
      dismiss();
    }, MAX_VISIBLE_MS);
  }, [clearMaxTimer, dismiss, opacity]);

  const completePortalTransition = useCallback(() => {
    if (isMobileE2e || !mounted || beganAtRef.current === null) return;

    const elapsed = Date.now() - beganAtRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    clearMaxTimer();
    setTimeout(() => {
      dismiss();
    }, remaining);
  }, [clearMaxTimer, dismiss, mounted]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const value = useMemo(
    () => ({ beginPortalTransition, completePortalTransition }),
    [beginPortalTransition, completePortalTransition],
  );

  return (
    <PortalTransitionContext.Provider value={value}>
      {children}
      {mounted ? (
        <Animated.View
          style={[styles.overlay, animatedStyle]}
          pointerEvents="auto"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          <BrandedSplashContent />
        </Animated.View>
      ) : null}
    </PortalTransitionContext.Provider>
  );
}

export function usePortalTransition(): PortalTransitionContextValue {
  const ctx = useContext(PortalTransitionContext);
  if (!ctx) {
    throw new Error('usePortalTransition must be used within PortalTransitionProvider');
  }
  return ctx;
}

export function useCompletePortalTransitionOnMount(): void {
  const { completePortalTransition } = usePortalTransition();

  useEffect(() => {
    requestAnimationFrame(() => {
      completePortalTransition();
    });
  }, [completePortalTransition]);
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
});
