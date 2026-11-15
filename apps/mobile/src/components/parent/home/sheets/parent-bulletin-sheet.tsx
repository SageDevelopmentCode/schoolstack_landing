import { StyleSheet, Text, View } from 'react-native';

import { BulletinAttachmentPreviewGrid } from '@/components/bulletin/bulletin-attachment-preview-grid';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GIcon, GPressable, GTape } from '@/components/parent/garden/ui';
import { bulletinBodyExcerpt, formatBulletinListDate } from '@/lib/school-bulletin/bulletin-format';
import type { BulletinPost } from '@/lib/school-bulletin/types';

type ParentBulletinSheetProps = {
  visible: boolean;
  posts: BulletinPost[];
  onClose: () => void;
  onOpenPost: (postId: string) => void;
};

function BulletinPostCard({
  post,
  latest,
  onOpen,
}: {
  post: BulletinPost;
  latest: boolean;
  onOpen: () => void;
}) {
  const excerpt = bulletinBodyExcerpt(post.body, 160);
  const dateLabel = formatBulletinListDate(post.publishedAt, post.createdAt);
  const canOpenDetail = Boolean(post.body.trim() || post.attachments.length > 0);
  const accent = useGardenAccent();

  return (
    <GPressable
      accessibilityLabel={`${post.title}${dateLabel ? `, ${dateLabel}` : ''}. Open post`}
      pressedScale={0.98}
      onPress={onOpen}
      style={[styles.card, latest && styles.cardLatest]}>
      {latest ? <GTape /> : null}
      <View style={styles.cardTop}>
        <GIcon name="megaphone-outline" size="sm" />
        {latest ? <GChip label="Latest" tone="warning" style={styles.latestChip} /> : null}
        {dateLabel ? <GChip label={dateLabel} tone="neutral" style={styles.date} /> : null}
      </View>
      <Text style={styles.title}>{post.title}</Text>
      {excerpt ? (
        <Text style={styles.excerpt} numberOfLines={3}>
          {excerpt}
        </Text>
      ) : null}
      {post.attachments.length > 0 ? (
        <BulletinAttachmentPreviewGrid attachments={post.attachments} onOpen={onOpen} />
      ) : null}
      {canOpenDetail ? (
        // Visual only: the whole card is the button (no nested pressables).
        <Text style={[styles.readMore, { color: accent.clayDeep }]}>Read more →</Text>
      ) : null}
    </GPressable>
  );
}

/** Parent Home: the school bulletin as a Garden card feed. */
export function ParentBulletinSheet({ visible, posts, onClose, onOpenPost }: ParentBulletinSheetProps) {
  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      kicker="From school"
      title="School bulletin"
      subtitle={posts.length > 0 ? `${posts.length} post${posts.length === 1 ? '' : 's'}` : undefined}
      accessibilityLabel="Close school bulletin">
      {posts.length === 0 ? (
        <View style={styles.empty}>
          <GIcon name="megaphone-outline" size="lg" />
          <Text style={styles.emptyCopy}>No bulletin posts right now.</Text>
        </View>
      ) : (
        posts.map((post, index) => (
          <BulletinPostCard
            key={post.id}
            post={post}
            latest={index === 0}
            onOpen={() => onOpenPost(post.id)}
          />
        ))
      )}
    </GSheet>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Garden.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    padding: 16,
    gap: 10,
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 0,
  },
  cardLatest: {
    backgroundColor: Garden.butter,
    borderColor: 'transparent',
    paddingTop: 20,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    marginLeft: 'auto',
  },
  latestChip: {
    backgroundColor: Garden.white,
  },
  title: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    lineHeight: 21,
    color: Garden.ink,
  },
  excerpt: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.ink65,
  },
  readMore: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: Garden.paper,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
  },
  emptyCopy: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 15,
    color: Garden.soft,
    textAlign: 'center',
  },
});
