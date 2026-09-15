import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

const SUBTITLE =
  'Choose where family emails go for applications, billing, messages, and other parent portal updates. This can differ from the email you use to sign in. School admin alerts are not affected.';

export function ParentNotificationSettingsStoryHeader() {
  const theme = useParentTheme();

  return (
    <View testID="parent-notification-settings-story-header" style={styles.container}>
      <StorySectionKicker>Account & preferences</StorySectionKicker>
      <StoryDisplayHeading size="section">Notification settings</StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{SUBTITLE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
