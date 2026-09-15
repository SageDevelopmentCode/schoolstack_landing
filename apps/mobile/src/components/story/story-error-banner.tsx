import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { Story, StoryRadius, StoryFonts } from '@/constants/story-theme';

type StoryErrorBannerProps = ViewProps & {
  message: string;
};

export function StoryErrorBanner({ message, style, ...rest }: StoryErrorBannerProps) {
  return (
    <View style={[styles.banner, style]} {...rest}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderColor: `${Story.alert}33`,
    backgroundColor: Story.alertBg,
    borderRadius: StoryRadius.input,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  text: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: Story.alert,
  },
});
