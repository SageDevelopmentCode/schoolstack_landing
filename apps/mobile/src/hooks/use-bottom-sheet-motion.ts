import { useCallback, useEffect, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export const SHEET_SLIDE_OFFSET = 500;
const OPEN_DURATION_MS = 280;
const CLOSE_DURATION_MS = 220;
const DISMISS_THRESHOLD = 100;
const DISMISS_VELOCITY = 600;
const BACKDROP_FADE_DISTANCE = 300;

type UseBottomSheetMotionOptions = {
  visible: boolean;
  onClose: () => void;
  enableDragToDismiss?: boolean;
};

export function useBottomSheetMotion({
  visible,
  onClose,
  enableDragToDismiss = true,
}: UseBottomSheetMotionOptions) {
  const [modalVisible, setModalVisible] = useState(false);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(SHEET_SLIDE_OFFSET);
  const scrollOffset = useSharedValue(0);

  const finishDismiss = useCallback(() => {
    setModalVisible(false);
    onClose();
  }, [onClose]);

  const animateClose = useCallback(
    (afterClose?: () => void) => {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      sheetTranslateY.value = withTiming(
        SHEET_SLIDE_OFFSET,
        { duration: CLOSE_DURATION_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(setModalVisible)(false);
            if (afterClose) {
              runOnJS(afterClose)();
            }
          }
        },
      );
    },
    [backdropOpacity, sheetTranslateY],
  );

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      scrollOffset.value = 0;
      backdropOpacity.value = 0;
      sheetTranslateY.value = SHEET_SLIDE_OFFSET;
      backdropOpacity.value = withTiming(1, { duration: 250 });
      sheetTranslateY.value = withTiming(0, {
        duration: OPEN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (!visible && modalVisible) {
      animateClose();
    }
  }, [visible, modalVisible, backdropOpacity, sheetTranslateY, animateClose, scrollOffset]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const handlePanGesture = Gesture.Pan()
    .enabled(enableDragToDismiss)
    .activeOffsetY(10)
    .onUpdate((event) => {
      const nextY = Math.max(0, event.translationY);
      sheetTranslateY.value = nextY;
      backdropOpacity.value = Math.max(0, 1 - nextY / BACKDROP_FADE_DISTANCE);
    })
    .onEnd((event) => {
      const shouldDismiss =
        event.translationY > DISMISS_THRESHOLD || event.velocityY > DISMISS_VELOCITY;

      if (shouldDismiss) {
        backdropOpacity.value = withTiming(0, { duration: 200 });
        sheetTranslateY.value = withTiming(
          SHEET_SLIDE_OFFSET,
          { duration: CLOSE_DURATION_MS, easing: Easing.in(Easing.cubic) },
          (finished) => {
            if (finished) {
              runOnJS(finishDismiss)();
            }
          },
        );
        return;
      }

      sheetTranslateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      backdropOpacity.value = withTiming(1, { duration: 200 });
    });

  const contentPanGesture = Gesture.Pan()
    .enabled(enableDragToDismiss)
    .activeOffsetY(10)
    .onUpdate((event) => {
      if (scrollOffset.value > 0) {
        return;
      }
      const nextY = Math.max(0, event.translationY);
      sheetTranslateY.value = nextY;
      backdropOpacity.value = Math.max(0, 1 - nextY / BACKDROP_FADE_DISTANCE);
    })
    .onEnd((event) => {
      if (scrollOffset.value > 0) {
        return;
      }

      const shouldDismiss =
        event.translationY > DISMISS_THRESHOLD || event.velocityY > DISMISS_VELOCITY;

      if (shouldDismiss) {
        backdropOpacity.value = withTiming(0, { duration: 200 });
        sheetTranslateY.value = withTiming(
          SHEET_SLIDE_OFFSET,
          { duration: CLOSE_DURATION_MS, easing: Easing.in(Easing.cubic) },
          (finished) => {
            if (finished) {
              runOnJS(finishDismiss)();
            }
          },
        );
        return;
      }

      sheetTranslateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      backdropOpacity.value = withTiming(1, { duration: 200 });
    });

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  return {
    modalVisible,
    backdropAnimatedStyle,
    sheetAnimatedStyle,
    scrollHandler,
    handlePanGesture,
    contentPanGesture,
  };
}
