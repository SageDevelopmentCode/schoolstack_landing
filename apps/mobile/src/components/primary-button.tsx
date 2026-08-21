import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Brand, Fonts, Radius } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PrimaryButtonProps = PressableProps & {
  label: string;
  variant?: 'clay' | 'accent' | 'surface';
  appearance?: 'marketing' | 'native';
  trailingIcon?: boolean;
};

function getButtonColors(variant: PrimaryButtonProps['variant']) {
  switch (variant) {
    case 'surface':
      return { backgroundColor: Brand.white, labelColor: Brand.accent };
    case 'accent':
      return { backgroundColor: Brand.accent, labelColor: Brand.white };
    case 'clay':
    default:
      return { backgroundColor: Brand.clay, labelColor: Brand.white };
  }
}

function ButtonLabel({
  label,
  labelColor,
  isNative,
  trailingIcon,
  hideFromAccessibility,
}: {
  label: string;
  labelColor: string;
  isNative: boolean;
  trailingIcon: boolean;
  hideFromAccessibility?: boolean;
}) {
  const textStyle = [
    isNative ? styles.labelNative : styles.labelMarketing,
    { color: labelColor },
  ];
  const a11yProps = hideFromAccessibility ? { accessible: false as const } : {};

  if (trailingIcon) {
    return (
      <View style={styles.contentRow} {...a11yProps}>
        <Text style={textStyle} {...a11yProps}>
          {label}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={labelColor} />
      </View>
    );
  }

  return (
    <Text style={textStyle} {...a11yProps}>
      {label}
    </Text>
  );
}

export function PrimaryButton({
  label,
  variant = 'clay',
  appearance = 'marketing',
  trailingIcon = false,
  style,
  disabled,
  onPressIn,
  onPressOut,
  testID,
  accessibilityLabel,
  ...rest
}: PrimaryButtonProps) {
  const { backgroundColor, labelColor } = getButtonColors(variant);
  const isNative = appearance === 'native';
  const isSurface = variant === 'surface';
  const isClay = variant === 'clay';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn: PrimaryButtonProps['onPressIn'] = (event) => {
    if (!disabled && isNative) {
      scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
    }
    onPressIn?.(event);
  };

  const handlePressOut: PrimaryButtonProps['onPressOut'] = (event) => {
    if (isNative) {
      scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    }
    onPressOut?.(event);
  };

  if (isNative) {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessible
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }: { pressed: boolean }) => [
          styles.buttonNativeOuter,
          animatedStyle,
          { opacity: disabled ? 0.5 : 1 },
          typeof style === 'function' ? style({ pressed, hovered: false }) : style,
        ]}
        {...rest}>
        <View
          testID={testID}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          collapsable={false}
          style={[
            styles.fill,
            { backgroundColor },
            (isSurface || isClay) && styles.fillElevated,
          ]}>
          <ButtonLabel
            label={label}
            labelColor={labelColor}
            isNative={isNative}
            trailingIcon={trailingIcon}
            hideFromAccessibility
          />
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.buttonMarketing,
        {
          backgroundColor,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      testID={testID}
      {...rest}>
      <ButtonLabel
        label={label}
        labelColor={labelColor}
        isNative={isNative}
        trailingIcon={trailingIcon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonMarketing: {
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    shadowColor: Brand.clay,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonNativeOuter: {
    width: '100%',
  },
  fill: {
    minHeight: 54,
    width: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  fillElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  labelMarketing: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  labelNative: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  },
});
