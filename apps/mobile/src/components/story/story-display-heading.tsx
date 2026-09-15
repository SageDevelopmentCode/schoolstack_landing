import { StyleSheet, Text, type TextProps } from 'react-native';

import { Story, StoryFonts } from '@/constants/story-theme';

type StoryDisplayHeadingProps = TextProps & {
  size?: 'display' | 'section';
};

export function StoryDisplayHeading({
  children,
  size = 'display',
  style,
  ...rest
}: StoryDisplayHeadingProps) {
  return (
    <Text
      style={[size === 'display' ? styles.display : styles.section, style]}
      {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: StoryFonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: -1.2,
    color: Story.ink,
  },
  section: {
    fontFamily: StoryFonts.display,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    letterSpacing: -0.72,
    color: Story.ink,
  },
});
