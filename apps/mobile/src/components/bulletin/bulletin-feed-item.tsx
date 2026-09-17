import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BulletinAttachmentPreviewGrid } from '@/components/bulletin/bulletin-attachment-preview-grid';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';
import { bulletinBodyExcerpt, formatBulletinListDate } from '@/lib/school-bulletin/bulletin-format';
import type { BulletinPost } from '@/lib/school-bulletin/types';

type BulletinFeedItemProps = {
  post: BulletinPost;
  onOpenDetail: () => void;
};

export function BulletinFeedItem({ post, onOpenDetail }: BulletinFeedItemProps) {
  const theme = useParentTheme();
  const preview = bulletinBodyExcerpt(post.body);
  const dateLabel = formatBulletinListDate(post.publishedAt, post.createdAt);
  const canOpenDetail = Boolean(post.body.trim() || post.attachments.length > 0);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onOpenDetail}
      style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
      <View
        style={[
          styles.card,
          {
            borderColor: theme.line,
            backgroundColor: theme.white,
          },
        ]}>
        <View style={styles.headerRow}>
          <View style={[styles.iconTile, { backgroundColor: theme.infoBg }]}>
            <Ionicons name="megaphone-outline" size={14} color={theme.info} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.ink }]}>{post.title}</Text>
            {dateLabel ? (
              <Text style={[styles.date, { color: theme.muted }]}>{dateLabel}</Text>
            ) : null}
            {preview ? (
              <Text style={[styles.excerpt, { color: theme.muted }]} numberOfLines={3}>
                {preview}
              </Text>
            ) : null}
          </View>
        </View>

        {post.attachments.length > 0 ? (
          <View style={styles.previewGrid}>
            <BulletinAttachmentPreviewGrid attachments={post.attachments} onOpen={onOpenDetail} />
          </View>
        ) : null}

        {canOpenDetail ? (
          <Text style={[styles.readMore, { color: theme.primary }]}>Read more →</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  date: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 16,
  },
  excerpt: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  previewGrid: {
    marginTop: 2,
  },
  readMore: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
