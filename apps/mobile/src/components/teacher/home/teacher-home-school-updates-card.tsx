import { StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type TeacherHomeSchoolUpdatesCardProps = {
  messagesUnreadCount: number;
  onOpenMessages: () => void;
};

export function TeacherHomeSchoolUpdatesCard({
  messagesUnreadCount,
  onOpenMessages,
}: TeacherHomeSchoolUpdatesCardProps) {
  const theme = useParentTheme();

  const title =
    messagesUnreadCount > 0
      ? `${messagesUnreadCount} unread message${messagesUnreadCount === 1 ? '' : 's'}`
      : 'Messages from families and staff';

  const subtitle =
    messagesUnreadCount > 0
      ? 'Families are waiting on your response.'
      : 'Check your inbox for school communications.';

  return (
    <StoryCard style={styles.card}>
      <StorySectionKicker style={styles.kicker}>School updates</StorySectionKicker>
      <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
      <StoryTextLink label="Open messages" onPress={onOpenMessages} style={styles.link} />
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
  },
  kicker: {
    marginBottom: 6,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.one,
  },
  link: {
    marginTop: Spacing.two,
    paddingVertical: 0,
  },
});
