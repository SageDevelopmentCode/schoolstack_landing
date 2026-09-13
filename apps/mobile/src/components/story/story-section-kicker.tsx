import { StyleSheet, Text, type TextProps } from 'react-native';

import { Story, StoryFonts } from '@/constants/story-theme';

type StorySectionKickerProps = TextProps & {
  light?: boolean;
};

export function StorySectionKicker({
  children,
  light = false,
  style,
  ...rest
}: StorySectionKickerProps) {
  return (
    <Text
      style={[styles.kicker, { color: light ? Story.kickerLight : Story.kicker }, style]}
      {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.32,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
});
