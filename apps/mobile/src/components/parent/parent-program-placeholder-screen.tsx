import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts, Story } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type ParentProgramPlaceholderScreenProps = {
  title: string;
  programLabel?: string;
};

export function ParentProgramPlaceholderScreen({
  title,
  programLabel,
}: ParentProgramPlaceholderScreenProps) {
  const theme = useParentTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Story.paper }]} edges={['top']}>
      <View style={styles.content}>
        {programLabel ? (
          <ThemedText type="smallBold" style={[styles.kicker, { color: theme.primary }]}>
            {programLabel}
          </ThemedText>
        ) : null}
        <ThemedText type="title" style={{ color: theme.ink }}>
          {title}
        </ThemedText>
        <ThemedText type="default" style={[styles.body, { color: theme.muted }]}>
          This program portal screen is coming soon on the MudKitchen mobile app.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: StoryCardPadding,
    paddingTop: Spacing.four,
    gap: Spacing.two,
  },
  kicker: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
    borderRadius: Radius.md,
  },
});
