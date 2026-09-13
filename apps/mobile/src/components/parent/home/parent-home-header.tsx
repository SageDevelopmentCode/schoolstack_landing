import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  familyKickerLabel,
  firstName,
  greetingParts,
  todayLabel,
} from '@/lib/parent/parent-home-utils';

type ParentHomeHeaderProps = {
  displayName: string;
};

export function ParentHomeHeader({ displayName }: ParentHomeHeaderProps) {
  const theme = useParentTheme();
  const name = firstName(displayName);
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();

  return (
    <View style={styles.container}>
      <StorySectionKicker style={styles.kicker}>{familyKickerLabel(displayName)}</StorySectionKicker>
      <StoryDisplayHeading size="display">
        {greetingPrefix}, {name}. {greetingEmoji}
      </StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Here&apos;s what your family needs for {todayLabel()}.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  kicker: {
    marginBottom: 0,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.one,
  },
});
