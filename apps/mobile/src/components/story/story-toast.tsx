import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Story, StoryFonts, StoryRadius } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type StoryToastVariant = 'success';

export type StoryToastOptions = {
  message: string;
  variant?: StoryToastVariant;
  durationMs?: number;
};

type StoryToastContextValue = {
  show: (options: StoryToastOptions) => void;
};

const StoryToastContext = createContext<StoryToastContextValue | null>(null);

let imperativeShow: ((options: StoryToastOptions) => void) | null = null;

export function showStoryToast(options: StoryToastOptions): void {
  if (imperativeShow) {
    imperativeShow(options);
    return;
  }
  if (__DEV__) {
    console.warn('[StoryToast] showStoryToast called before StoryToastProvider mounted');
  }
}

export function StoryToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<StoryToastOptions | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [opacity]);

  const show = useCallback(
    (options: StoryToastOptions) => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      setToast({ variant: 'success', ...options });
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      hideTimer.current = setTimeout(
        () => {
          hideTimer.current = null;
          hide();
        },
        options.durationMs ?? 2500,
      );
    },
    [hide, opacity],
  );

  useEffect(() => {
    imperativeShow = show;
    return () => {
      imperativeShow = null;
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [show]);

  return (
    <StoryToastContext.Provider value={{ show }}>
      {children}
      <Modal visible={toast != null} transparent animationType="none" statusBarTranslucent>
        <View pointerEvents="box-none" style={styles.modalRoot}>
          {toast ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.toastWrap,
                {
                  bottom: insets.bottom + Spacing.four,
                  opacity,
                  transform: [
                    {
                      translateY: opacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                },
              ]}>
              <View style={styles.toast}>
                <Text style={styles.toastText}>{toast.message}</Text>
              </View>
            </Animated.View>
          ) : null}
        </View>
      </Modal>
    </StoryToastContext.Provider>
  );
}

export function useStoryToast(): StoryToastContextValue {
  const ctx = useContext(StoryToastContext);
  if (!ctx) {
    throw new Error('useStoryToast must be used within StoryToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  toastWrap: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    alignItems: 'center',
    zIndex: 9999,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  toast: {
    maxWidth: 420,
    width: '100%',
    backgroundColor: Story.primary,
    borderRadius: StoryRadius.button,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  toastText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: Story.white,
    textAlign: 'center',
  },
});
