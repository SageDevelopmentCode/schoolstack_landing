import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { BulletinPost } from '@/lib/school-bulletin/types';

type TeacherHomeBulletinSheetProps = {
  visible: boolean;
  posts: BulletinPost[];
  onClose: () => void;
};

function formatPublishedDate(value?: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TeacherHomeBulletinSheet({
  visible,
  posts,
  onClose,
}: TeacherHomeBulletinSheetProps) {
  const theme = useParentTheme();
  const [selectedPost, setSelectedPost] = useState<BulletinPost | null>(null);

  const handleClose = () => {
    setSelectedPost(null);
    onClose();
  };

  return (
    <StoryBottomSheet visible={visible} onClose={handleClose} accessibilityLabel="School bulletin">
      <ScrollView contentContainerStyle={styles.content}>
        {selectedPost ? (
          <View style={styles.detail}>
            <Pressable onPress={() => setSelectedPost(null)} style={styles.backRow}>
              <Text style={[styles.backLabel, { color: theme.primary }]}>← All posts</Text>
            </Pressable>
            <StorySectionKicker>{formatPublishedDate(selectedPost.publishedAt)}</StorySectionKicker>
            <StoryDisplayHeading size="section">{selectedPost.title}</StoryDisplayHeading>
            <Text style={[styles.body, { color: theme.ink }]}>{selectedPost.body}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            <StoryDisplayHeading size="section">School bulletin</StoryDisplayHeading>
            {posts.length === 0 ? (
              <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                No bulletin posts right now.
              </Text>
            ) : (
              posts.map((post) => (
                <Pressable
                  key={post.id}
                  onPress={() => setSelectedPost(post)}
                  style={[styles.postRow, { borderColor: theme.line }]}>
                  <Text style={[styles.postTitle, { color: theme.ink }]}>{post.title}</Text>
                  <Text style={[styles.postMeta, { color: theme.muted }]}>
                    {formatPublishedDate(post.publishedAt)}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Spacing.six,
  },
  list: {
    gap: Spacing.three,
  },
  detail: {
    gap: Spacing.three,
  },
  backRow: {
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
  },
  postRow: {
    borderTopWidth: 1,
    paddingVertical: Spacing.three,
    gap: 4,
  },
  postTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  postMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 24,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
