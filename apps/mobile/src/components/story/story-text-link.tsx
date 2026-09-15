import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { Story, StoryFonts } from '@/constants/story-theme';

type StoryTextLinkProps = PressableProps & {
  label: string;
  variant?: 'muted' | 'primary' | 'light';
};

export function StoryTextLink({
  label,
  variant = 'primary',
  style,
  disabled,
  ...rest
}: StoryTextLinkProps) {
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
      <Text
        style={[
          styles.text,
          variant === 'muted' ? styles.muted : variant === 'light' ? styles.light : styles.primary,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    paddingVertical: 8,
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
