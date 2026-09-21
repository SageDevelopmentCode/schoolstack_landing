import { StyleSheet, Text, type TextProps } from 'react-native';

import { Story, StoryFonts } from '@/constants/story-theme';

type StoryDisplayHeadingProps = TextProps & {
  size?: 'display' | 'section' | 'header';
};

export function StoryDisplayHeading({
  children,
  size = 'display',
  style,
  ...rest
}: StoryDisplayHeadingProps) {
  return (
    <Text style={[SIZE_STYLES[size], style]} {...rest}>
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
  header: {
    fontFamily: StoryFonts.display,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.6,
    color: Story.ink,
  },
});

const SIZE_STYLES = {
  display: styles.display,
  section: styles.section,
  header: styles.header,
} as const;
