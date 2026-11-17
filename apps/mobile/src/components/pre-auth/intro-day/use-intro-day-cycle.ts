import { useIsFocused } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { haptic } from '@/lib/haptics';

type IntroDayCycleOptions = {
  count: number;
  intervalMs: number;
  resumeMs: number;
  reduceMotion: boolean;
};

/**
 * Walks through the school day on a timer. Pauses while the screen is hidden,
 * while a screen reader is on, under reduced motion, and for `resumeMs` after
 * the user picks a moment or touches the stage.
 */
export function useIntroDayCycle({ count, intervalMs, resumeMs, reduceMotion }: IntroDayCycleOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [holdToken, setHoldToken] = useState(0);
  const [screenReaderOn, setScreenReaderOn] = useState(false);
  const resumeAtRef = useRef(0);
  const isFocused = useIsFocused();

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      if (mounted) setScreenReaderOn(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReaderOn);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const autoAdvance = isFocused && !reduceMotion && !screenReaderOn && count > 1;

  useEffect(() => {
    if (!autoAdvance) return;
    const delay = Math.max(intervalMs, resumeAtRef.current - Date.now());
    const timer = setTimeout(() => {
      setActiveIndex((current) => (current + 1) % count);
    }, delay);
    return () => clearTimeout(timer);
  }, [activeIndex, autoAdvance, count, holdToken, intervalMs]);

  const hold = useCallback(() => {
    resumeAtRef.current = Date.now() + resumeMs;
    setHoldToken((token) => token + 1);
  }, [resumeMs]);

  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

  const select = useCallback(
    (index: number) => {
      const next = ((index % count) + count) % count;
      hold();
      if (next === activeRef.current) return;
      haptic.select();
      setActiveIndex(next);
    },
    [count, hold],
  );

  const step = useCallback(
    (delta: number) => select(activeRef.current + delta),
    [select],
  );

  return { activeIndex, select, step, hold };
}
