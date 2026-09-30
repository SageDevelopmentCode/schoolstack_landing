import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BulletinFeedItem } from '@/components/bulletin/bulletin-feed-item';
import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { BulletinPost } from '@/lib/school-bulletin/types';

type ParentHomeSchoolUpdatesCardProps = {
  bulletinEnabled: boolean;
  bulletinPosts: BulletinPost[];
  messagesEnabled: boolean;
  onOpenMessages: () => void;
  onOpenBulletinPost: (postId: string) => void;
};

export function ParentHomeSchoolUpdatesCard({
  bulletinEnabled,
  bulletinPosts,
  messagesEnabled,
  onOpenMessages,
  onOpenBulletinPost,
}: ParentHomeSchoolUpdatesCardProps) {
  const theme = useParentTheme();
  const messagesOnly = !bulletinEnabled && messagesEnabled;
  const previewPosts = bulletinPosts.slice(0, 3);

  return (
    <StoryCard style={styles.card}>
      <StorySectionKicker>School updates</StorySectionKicker>
      <Text style={[styles.title, { color: theme.ink }]}>
        {bulletinEnabled ? 'From your school' : 'Messages'}
      </Text>

      {bulletinEnabled ? (
        <View style={styles.feed}>
          {previewPosts.length === 0 ? (
            <Text style={[styles.muted, { color: theme.muted }]}>
              No bulletin posts right now.
            </Text>
          ) : (
            previewPosts.map((post) => (
              <BulletinFeedItem
                key={post.id}
                post={post}
                onOpenDetail={() => onOpenBulletinPost(post.id)}
              />
            ))
          )}
        </View>
      ) : null}

      {messagesEnabled ? (
        <View style={[styles.messagesBlock, bulletinEnabled && styles.messagesDivider]}>
          {messagesOnly ? (
            <View style={styles.promoRow}>
              <View style={[styles.promoIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="chatbubble-outline" size={18} color="#0284C7" />
              </View>
              <View style={styles.promoCopy}>
                <Text style={[styles.promoTitle, { color: theme.ink }]}>
                  Messages from teachers and staff
                </Text>
                <Text style={[styles.promoSubtitle, { color: theme.muted }]}>
                  Check your inbox for school communications.
                </Text>
              </View>
            </View>
          ) : null}
          <StoryTextLink label="Open messages" onPress={onOpenMessages} />
        </View>
      ) : !bulletinEnabled ? (
        <Text style={[styles.muted, { color: theme.muted }]}>
          School announcements and updates will appear here when available.
        </Text>
      ) : null}
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 17,
    fontWeight: '600',
  },
  feed: {
    gap: Spacing.two,
  },
  muted: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  messagesBlock: {
    gap: Spacing.two,
  },
  messagesDivider: {
    marginTop: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7ECE7',
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  promoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoCopy: {
    flex: 1,
    gap: 2,
  },
  promoTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  promoSubtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
});
