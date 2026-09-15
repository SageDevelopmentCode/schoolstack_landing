import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Story, StoryRadius, StoryFonts } from '@/constants/story-theme';
import { isMobileE2e } from '@/lib/e2e';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type StoryButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'soft' | 'outline';
  trailingIcon?: ReactNode;
};

function getButtonColors(variant: StoryButtonProps['variant']) {
  switch (variant) {
    case 'soft':
      return {
        backgroundColor: Story.primarySoft,
        labelColor: Story.primary,
        borderColor: 'transparent',
      };
    case 'outline':
      return {
        backgroundColor: Story.white,
        labelColor: Story.primary,
        borderColor: Story.line,
      };
    case 'primary':
    default:
      return {
        backgroundColor: Story.primary,
        labelColor: Story.white,
        borderColor: 'transparent',
      };
  }
}

export function StoryButton({
  label,
  variant = 'primary',
  trailingIcon,
  style,
  disabled,
  onPressIn,
  onPressOut,
  testID,
  accessibilityLabel,
  ...rest
}: StoryButtonProps) {
  const { backgroundColor, labelColor, borderColor } = getButtonColors(variant);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn: StoryButtonProps['onPressIn'] = (event) => {
    if (!disabled) {
      scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
    }
    onPressIn?.(event);
  };

  const handlePressOut: StoryButtonProps['onPressOut'] = (event) => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    onPressOut?.(event);
  };

  const content = (
    <View
      style={[
        styles.fill,
        {
          backgroundColor,
          borderColor,
          borderWidth: borderColor === 'transparent' ? 0 : 1,
        },
      ]}>
      <View style={styles.contentRow}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {trailingIcon}
      </View>
    </View>
  );

  if (isMobileE2e) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        disabled={disabled}
        testID={testID}
        style={({ pressed }) => [
          styles.outer,
          { opacity: disabled ? 0.5 : pressed ? 0.95 : 1 },
          typeof style === 'function' ? style({ pressed, hovered: false }) : style,
        ]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        {...rest}>
        {content}
      </Pressable>
    );
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }: { pressed: boolean }) => [
        styles.outer,
        animatedStyle,
        { opacity: disabled ? 0.5 : 1 },
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      testID={testID}
      {...rest}>
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
  },
  fill: {
    minHeight: 52,
    width: '100%',
    borderRadius: StoryRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
});
