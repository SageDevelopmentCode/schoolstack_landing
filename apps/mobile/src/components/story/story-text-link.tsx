import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { Story, StoryFonts } from '@/constants/story-theme';

type StoryTextLinkProps = PressableProps & {
  label: string;
  variant?: 'muted' | 'primary' | 'light';
  icon?: keyof typeof Ionicons.glyphMap;
};

function iconColorForVariant(variant: StoryTextLinkProps['variant']): string {
  if (variant === 'muted') return Story.muted;
  if (variant === 'light') return '#D6EFD8';
  return Story.primary;
}

export function StoryTextLink({
  label,
  variant = 'primary',
  icon,
  style,
  disabled,
  ...rest
}: StoryTextLinkProps) {
  const textColorStyle =
    variant === 'muted' ? styles.muted : variant === 'light' ? styles.light : styles.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.link,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      {...rest}>
      {icon ? (
        <View style={styles.labelRow}>
          <Ionicons name={icon} size={16} color={iconColorForVariant(variant)} />
          <Text style={[styles.text, textColorStyle]}>{label}</Text>
        </View>
      ) : (
        <Text style={[styles.text, textColorStyle]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    paddingVertical: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  muted: {
    color: Story.muted,
  },
  primary: {
    color: Story.primary,
  },
  light: {
    color: '#D6EFD8',
  },
});
