import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type TransactionsStoryHeaderProps = {
  totalCount: number;
};

export function TransactionsStoryHeader({ totalCount }: TransactionsStoryHeaderProps) {
  const theme = useParentTheme();
  const subtitle =
    totalCount === 1
      ? '1 payment recorded across application, enrollment, and tuition fees.'
      : `${totalCount} payments recorded across application, enrollment, and tuition fees.`;

  return (
    <View style={styles.container}>
      <StorySectionKicker style={styles.kicker}>Finances workspace</StorySectionKicker>
      <StoryDisplayHeading size="display">Transactions</StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
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
