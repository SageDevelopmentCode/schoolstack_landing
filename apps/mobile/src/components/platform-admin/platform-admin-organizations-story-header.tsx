import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type PlatformAdminOrganizationsStoryHeaderProps = {
  totalCount: number;
  email?: string | null;
};

export function PlatformAdminOrganizationsStoryHeader({
  totalCount,
  email,
}: PlatformAdminOrganizationsStoryHeaderProps) {
  const theme = useParentTheme();
  const subtitle =
    totalCount === 1
      ? '1 school on MudKitchen.'
      : `${totalCount} schools on MudKitchen.`;

  return (
    <View style={styles.container}>
      <StorySectionKicker style={styles.kicker}>Platform Admin</StorySectionKicker>
      <StoryDisplayHeading size="display">Organizations</StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
      {email ? (
        <Text style={[styles.email, { color: theme.muted }]} numberOfLines={1}>
          {email}
        </Text>
      ) : null}
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
  email: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
