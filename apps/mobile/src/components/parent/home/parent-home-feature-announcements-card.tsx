import { StyleSheet, Text, View } from 'react-native';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ResolvedParentFeatureAnnouncement } from '@/lib/parent/parent-portal-api';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

function formatAnnouncementDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type ParentHomeFeatureAnnouncementsCardProps = {
  announcements: ResolvedParentFeatureAnnouncement[];
  onPressAnnouncement: (announcement: ResolvedParentFeatureAnnouncement) => void;
};

export function ParentHomeFeatureAnnouncementsCard({
  announcements,
  onPressAnnouncement,
}: ParentHomeFeatureAnnouncementsCardProps) {
  const theme = useParentTheme();

  if (announcements.length === 0) {
    return null;
  }

  return (
    <StoryCard style={styles.card}>
      <StorySectionKicker>What&apos;s new</StorySectionKicker>
      <Text style={[styles.heading, { color: theme.ink }]}>New features for you</Text>
      <View style={styles.list}>
        {announcements.map((announcement) => (
          <View key={announcement.id} style={styles.item}>
            <Text style={[styles.date, { color: theme.muted }]}>
              {formatAnnouncementDate(announcement.publishedAt)}
            </Text>
            <Text style={[styles.title, { color: theme.ink }]}>{announcement.title}</Text>
            <Text style={[styles.description, { color: theme.muted }]}>
              {announcement.description}
            </Text>
            <StoryButton
              label={announcement.ctaLabel}
              previewSafe
              variant="outline"
              onPress={() => onPressAnnouncement(announcement)}
              style={styles.cta}
            />
          </View>
        ))}
      </View>
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  heading: {
    fontFamily: StoryFonts.display,
    fontSize: 19,
    fontWeight: '600',
  },
  list: {
    gap: Spacing.three,
  },
  item: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E9EFEA',
    backgroundColor: '#FFFDF8',
    padding: Spacing.three,
    gap: Spacing.one,
  },
  date: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
});
