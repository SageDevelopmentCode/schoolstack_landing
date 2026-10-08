import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { BrandedSplashContent } from '@/components/branded-splash-content';
import { Brand } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import type { PortalType } from '@/lib/auth/resolve-portal';
import { isMobileE2e } from '@/lib/e2e';

const MIN_VISIBLE_MS = 400;
const MAX_VISIBLE_MS = 2500;
const FADE_MS = 450;

type BeginPortalTransitionOptions = {
  targetPortalType: PortalType;
};

type PortalTransitionContextValue = {
  beginPortalTransition: (options: BeginPortalTransitionOptions) => void;
  tryCompletePortalTransition: (portalType: PortalType) => void;
};

const PortalTransitionContext = createContext<PortalTransitionContextValue | null>(null);

function clearDismissState(
  setMounted: (value: boolean) => void,
  dismissingRef: MutableRefObject<boolean>,
  beganAtRef: MutableRefObject<number | null>,
  targetPortalRef: MutableRefObject<PortalType | null>,
) {
  dismissingRef.current = false;
  beganAtRef.current = null;
  targetPortalRef.current = null;
  setMounted(false);
}

export function PortalTransitionProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);
  const opacity = useSharedValue(0);
  const beganAtRef = useRef<number | null>(null);
  const targetPortalRef = useRef<PortalType | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissFailsafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissingRef = useRef(false);

  const clearMaxTimer = useCallback(() => {
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  }, []);

  const clearCompleteDismissTimer = useCallback(() => {
    if (completeDismissTimerRef.current) {
      clearTimeout(completeDismissTimerRef.current);
      completeDismissTimerRef.current = null;
    }
  }, []);

  const clearDismissFailsafeTimer = useCallback(() => {
    if (dismissFailsafeTimerRef.current) {
      clearTimeout(dismissFailsafeTimerRef.current);
      dismissFailsafeTimerRef.current = null;
    }
  }, []);

  const finalizeDismiss = useCallback(() => {
    clearDismissFailsafeTimer();
    clearDismissState(setMounted, dismissingRef, beganAtRef, targetPortalRef);
    mountedRef.current = false;
  }, [clearDismissFailsafeTimer]);

  const dismiss = useCallback(() => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    clearMaxTimer();
    clearCompleteDismissTimer();
    clearDismissFailsafeTimer();

    dismissFailsafeTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        cancelAnimation(opacity);
        opacity.value = 0;
        finalizeDismiss();
      }
    }, FADE_MS + 100);

    opacity.value = withTiming(0, { duration: FADE_MS }, (finished) => {
      if (finished) {
        runOnJS(finalizeDismiss)();
      }
    });
  }, [clearCompleteDismissTimer, clearDismissFailsafeTimer, clearMaxTimer, finalizeDismiss, opacity]);

  const beginPortalTransition = useCallback(
    ({ targetPortalType }: BeginPortalTransitionOptions) => {
      if (isMobileE2e) return;

      clearMaxTimer();
      clearCompleteDismissTimer();
      clearDismissFailsafeTimer();
      cancelAnimation(opacity);
      dismissingRef.current = false;
      beganAtRef.current = Date.now();
      targetPortalRef.current = targetPortalType;
      mountedRef.current = true;
      setMounted(true);
      opacity.value = 1;
      opacity.value = withTiming(1, { duration: FADE_MS });

      maxTimerRef.current = setTimeout(() => {
        dismiss();
      }, MAX_VISIBLE_MS);
    },
    [clearCompleteDismissTimer, clearDismissFailsafeTimer, clearMaxTimer, dismiss, opacity],
  );

  const tryCompletePortalTransition = useCallback(
    (portalType: PortalType) => {
      if (isMobileE2e) return;
      if (!mountedRef.current || beganAtRef.current === null) return;
      if (targetPortalRef.current !== portalType) return;

      const elapsed = Date.now() - beganAtRef.current;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      clearMaxTimer();
      clearCompleteDismissTimer();
      completeDismissTimerRef.current = setTimeout(() => {
        dismiss();
      }, remaining);
    },
    [clearCompleteDismissTimer, clearMaxTimer, dismiss],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const value = useMemo(
    () => ({ beginPortalTransition, tryCompletePortalTransition }),
    [beginPortalTransition, tryCompletePortalTransition],
  );

  return (
    <PortalTransitionContext.Provider value={value}>
      <View style={styles.host}>{children}</View>
      <Modal
        visible={mounted}
        animationType="none"
        presentationStyle="fullScreen"
        transparent={false}
        statusBarTranslucent
        onRequestClose={() => {}}>
        <Animated.View
          style={[styles.modalBody, animatedStyle]}
          pointerEvents="auto"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          <BrandedSplashContent variant="overlay" showActivityIndicator />
        </Animated.View>
      </Modal>
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

export function useCompletePortalTransitionOnMount(expectedPortal: PortalType): void {
  const { portalType } = useAuth();
  const { tryCompletePortalTransition } = usePortalTransition();

  useEffect(() => {
    if (portalType !== expectedPortal) return;
    requestAnimationFrame(() => {
      tryCompletePortalTransition(expectedPortal);
    });
  }, [expectedPortal, portalType, tryCompletePortalTransition]);
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  modalBody: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
});
