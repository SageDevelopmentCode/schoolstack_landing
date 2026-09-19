import { StyleSheet, Text, View } from 'react-native';

import { BulletinFeedItem } from '@/components/bulletin/bulletin-feed-item';
import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { BulletinPost } from '@/lib/school-bulletin/types';

type HomeBulletinSheetProps = {
  visible: boolean;
  posts: BulletinPost[];
  onClose: () => void;
  onOpenPost: (postId: string) => void;
};

export function HomeBulletinSheet({
  visible,
  posts,
  onClose,
  onOpenPost,
}: HomeBulletinSheetProps) {
  const theme = useParentTheme();

  return (
    <StoryBottomSheet visible={visible} onClose={onClose} accessibilityLabel="School bulletin">
      <View style={styles.content}>
        <View style={styles.list}>
          <StoryDisplayHeading size="section">School bulletin</StoryDisplayHeading>
          {posts.length === 0 ? (
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              No bulletin posts right now.
            </Text>
          ) : (
            posts.map((post) => (
              <BulletinFeedItem
                key={post.id}
                post={post}
                onOpenDetail={() => onOpenPost(post.id)}
              />
            ))
          )}
        </View>
      </View>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
  },
  list: {
    gap: Spacing.three,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
