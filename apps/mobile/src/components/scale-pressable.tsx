import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PRESS_IN, PRESS_OUT, PRESSED_SCALE } from '@/lib/motion/portal-motion';
import { isMobileE2e } from '@/lib/e2e';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ScalePressableProps = PressableProps & {
  pressedScale?: number;
  style?: StyleProp<ViewStyle>;
};

export function ScalePressable({
  pressedScale = PRESSED_SCALE,
  style,
  disabled,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: ScalePressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (isMobileE2e) {
    return (
      <Pressable
        {...rest}
        disabled={disabled}
        style={({ pressed }) => [
          style,
          { opacity: disabled ? 0.5 : pressed ? 0.92 : 1 },
        ]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}>
        {children}
      </Pressable>
    );
  }

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      style={[style, animatedStyle, disabled && { opacity: 0.5 }]}
      onPressIn={(event) => {
        if (!disabled) {
          scale.value = withTiming(pressedScale, PRESS_IN);
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, PRESS_OUT);
        onPressOut?.(event);
      }}>
      {children}
    </AnimatedPressable>
  );
}
