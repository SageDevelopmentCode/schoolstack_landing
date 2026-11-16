import { Ionicons } from '@expo/vector-icons';
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
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { haptic } from '@/lib/haptics';

/**
 * Garden toasts for the parent portal on mobile — mirrors web `parentToast`
 * (title = what happened, description = what it means / what to do next).
 */

export type GardenToastKind = 'success' | 'error' | 'info' | 'warning';

export type GardenToastOptions = {
  description?: string;
  action?: { label: string; onPress: () => void };
  /** A toast with the same id replaces the existing one. */
  id?: string;
  durationMs?: number;
};

type ToastEntry = GardenToastOptions & {
  key: string;
  kind: GardenToastKind;
  title: string;
};

export type GardenToastApi = {
  success: (title: string, options?: GardenToastOptions) => void;
  error: (title: string, options?: GardenToastOptions) => void;
  info: (title: string, options?: GardenToastOptions) => void;
  warning: (title: string, options?: GardenToastOptions) => void;
  dismiss: (id: string) => void;
};

const TONES: Record<
  GardenToastKind,
  { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  success: { bg: Garden.mint, fg: Garden.forestDeep, icon: 'checkmark-circle' },
  info: { bg: Garden.sky, fg: '#1D3F61', icon: 'information-circle' },
  warning: { bg: '#FFF3C4', fg: '#4D3900', icon: 'alert-circle' },
  error: { bg: '#F9E5DA', fg: '#7C2D12', icon: 'close-circle' },
};

const MAX_VISIBLE = 2;

const noop = () => {};
const NOOP_API: GardenToastApi = {
  success: noop,
  error: noop,
  info: noop,
  warning: noop,
  dismiss: noop,
};

const GardenToastContext = createContext<GardenToastApi | null>(null);

/** Toasts inside the Garden provider; a safe no-op outside it. */
export function useGardenToast(): GardenToastApi {
  return useContext(GardenToastContext) ?? NOOP_API;
}

function ToastCard({ toast, onDismiss }: { toast: ToastEntry; onDismiss: (key: string) => void }) {
  const accent = useGardenAccent();
  const tone = TONES[toast.kind];
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 40 || event.velocityY > 600) {
        runOnJS(onDismiss)(toast.key);
      } else {
        translateY.value = withSpring(0);
      }
    });

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: 1 - Math.min(0.6, translateY.value / 120),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        entering={FadeInDown.duration(260)}
        exiting={FadeOutDown.duration(180)}
        layout={LinearTransition.duration(200)}
        accessibilityLiveRegion="polite"
        style={[styles.card, { backgroundColor: tone.bg }, dragStyle]}>
        <Ionicons name={tone.icon} size={20} color={tone.fg} style={styles.icon} />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: tone.fg }]}>{toast.title}</Text>
          {toast.description ? (
            <Text style={[styles.description, { color: tone.fg }]}>{toast.description}</Text>
          ) : null}
          {toast.action ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={toast.action.label}
              hitSlop={8}
              onPress={() => {
                haptic.tap();
                toast.action?.onPress();
                onDismiss(toast.key);
              }}
              style={({ pressed }) => [
                styles.action,
                { backgroundColor: accent.clay },
                pressed && styles.actionPressed,
              ]}>
              <Text style={styles.actionText}>{toast.action.label}</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          hitSlop={10}
          onPress={() => onDismiss(toast.key)}
          style={styles.close}>
          <Ionicons name="close" size={13} color={Garden.ink} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export function GardenToastProvider({
  children,
  bottomOffset = 12,
}: {
  children: ReactNode;
  bottomOffset?: number;
}) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismissKey = useCallback((key: string) => {
    const timer = timers.current.get(key);
    if (timer) clearTimeout(timer);
    timers.current.delete(key);
    setToasts((prev) => prev.filter((toast) => toast.key !== key));
  }, []);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  const show = useCallback(
    (kind: GardenToastKind, title: string, options: GardenToastOptions = {}) => {
      const key = options.id ?? `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const entry: ToastEntry = { ...options, key, kind, title };

      const existing = timers.current.get(key);
      if (existing) clearTimeout(existing);

      setToasts((prev) => {
        const withoutSame = prev.filter((toast) => toast.key !== key);
        const next = [...withoutSame, entry];
        return next.slice(-MAX_VISIBLE);
      });

      const duration = options.durationMs ?? (kind === 'error' ? 7000 : options.action ? 5000 : 3200);
      timers.current.set(
        key,
        setTimeout(() => dismissKey(key), duration),
      );

      if (kind === 'error') haptic.error();
      else if (kind === 'success') haptic.success();
      else if (kind === 'warning') haptic.warning();

      AccessibilityInfo.announceForAccessibility(
        options.description ? `${title}. ${options.description}` : title,
      );
    },
    [dismissKey],
  );

  const api = useMemo<GardenToastApi>(
    () => ({
      success: (title, options) => show('success', title, options),
      error: (title, options) => show('error', title, options),
      info: (title, options) => show('info', title, options),
      warning: (title, options) => show('warning', title, options),
      dismiss: (id) => dismissKey(id),
    }),
    [dismissKey, show],
  );

  return (
    <GardenToastContext.Provider value={api}>
      {children}
      <View pointerEvents="box-none" style={[styles.stack, { bottom: bottomOffset }]}>
        {toasts.map((toast) => (
          <ToastCard key={toast.key} toast={toast} onDismiss={dismissKey} />
        ))}
      </View>
    </GardenToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  stack: {
    position: 'absolute',
    left: 12,
    right: 12,
    gap: 8,
    zIndex: 50,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(43,36,29,0.14)',
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 40,
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  icon: {
    marginTop: 1,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    lineHeight: 19,
  },
  description: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.82,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: 8,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    justifyContent: 'center',
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  actionPressed: {
    transform: [{ translateY: 1 }],
  },
  actionText: {
    color: Garden.white,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12.5,
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(43,36,29,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
