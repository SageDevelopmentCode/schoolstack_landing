import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Story, StoryRadius, StoryFonts } from '@/constants/story-theme';
import { isMobileE2e } from '@/lib/e2e';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type StoryButtonVariant = 'primary' | 'soft' | 'outline';

type StoryButtonProps = PressableProps & {
  label: string;
  variant?: StoryButtonVariant;
  trailingIcon?: ReactNode;
  /** When false, button sizes to content / flex parent instead of full row width. */
  fullWidth?: boolean;
  /** Allow presses while in read-only portal preview (e.g. retry / navigation). */
  previewSafe?: boolean;
};

type StoryIconButtonProps = PressableProps & {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accessibilityLabel: string;
  variant?: StoryButtonVariant;
  loading?: boolean;
  previewSafe?: boolean;
};

function getButtonColors(variant: StoryButtonVariant | undefined, disabled?: boolean) {
  if (disabled) {
    switch (variant) {
      case 'soft':
        return {
          backgroundColor: Story.line,
          labelColor: Story.muted,
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          backgroundColor: Story.white,
          labelColor: Story.muted,
          borderColor: Story.line,
        };
      case 'primary':
      default:
        return {
          backgroundColor: Story.line,
          labelColor: Story.muted,
          borderColor: 'transparent',
        };
    }
  }

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
  fullWidth = true,
  style,
  disabled,
  previewSafe = false,
  onPressIn,
  onPressOut,
  testID,
  accessibilityLabel,
  ...rest
}: StoryButtonProps) {
  const readOnly = usePortalReadOnly();
  const effectiveDisabled = disabled || (readOnly && !previewSafe);
  const { backgroundColor, labelColor, borderColor } = getButtonColors(variant, effectiveDisabled);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn: StoryButtonProps['onPressIn'] = (event) => {
    if (!effectiveDisabled) {
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
        fullWidth ? styles.fillFullWidth : styles.fillInline,
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
        disabled={effectiveDisabled}
        testID={testID}
        style={({ pressed }) => [
          fullWidth ? styles.outerFullWidth : styles.outerInline,
          { opacity: effectiveDisabled ? 1 : pressed ? 0.95 : 1 },
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
      disabled={effectiveDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }: { pressed: boolean }) => [
        fullWidth ? styles.outerFullWidth : styles.outerInline,
        animatedStyle,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      testID={testID}
      {...rest}>
      {content}
    </AnimatedPressable>
  );
}

export function StoryIconButton({
  icon,
  accessibilityLabel,
  variant = 'outline',
  loading = false,
  style,
  disabled,
  previewSafe = false,
  onPressIn,
  onPressOut,
  testID,
  ...rest
}: StoryIconButtonProps) {
  const readOnly = usePortalReadOnly();
  const effectiveDisabled = disabled || loading || (readOnly && !previewSafe);
  const { backgroundColor, labelColor, borderColor } = getButtonColors(variant, effectiveDisabled);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn: StoryIconButtonProps['onPressIn'] = (event) => {
    if (!effectiveDisabled) {
      scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
    }
    onPressIn?.(event);
  };

  const handlePressOut: StoryIconButtonProps['onPressOut'] = (event) => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    onPressOut?.(event);
  };

  const content = (
    <View
      style={[
        styles.iconFill,
        {
          backgroundColor,
          borderColor,
          borderWidth: borderColor === 'transparent' ? 0 : 1,
        },
      ]}>
      {loading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <Ionicons name={icon} size={22} color={labelColor} />
      )}
    </View>
  );

  if (isMobileE2e) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        disabled={effectiveDisabled}
        testID={testID}
        style={({ pressed }) => [
          styles.iconOuter,
          { opacity: effectiveDisabled ? 1 : pressed ? 0.95 : 1 },
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
      accessibilityLabel={accessibilityLabel}
      disabled={effectiveDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }: { pressed: boolean }) => [
        styles.iconOuter,
        animatedStyle,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      testID={testID}
      {...rest}>
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  outerFullWidth: {
    width: '100%',
  },
  outerInline: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    alignSelf: 'stretch',
  },
  iconOuter: {
    flexShrink: 0,
  },
  iconFill: {
    width: 52,
    height: 52,
    borderRadius: StoryRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillFullWidth: {
    minHeight: 52,
    width: '100%',
    borderRadius: StoryRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  fillInline: {
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
