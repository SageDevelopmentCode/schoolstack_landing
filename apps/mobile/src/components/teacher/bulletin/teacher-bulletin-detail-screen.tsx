import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BulletinAttachmentList,
} from '@/components/bulletin/bulletin-attachment-list';
import {
  BulletinAttachmentViewerModal,
  type BulletinAttachmentViewerState,
} from '@/components/bulletin/bulletin-attachment-viewer-modal';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { canPreviewBulletinAttachment } from '@/lib/school-bulletin/attachment-preview';
import { formatBulletinDetailDate } from '@/lib/school-bulletin/bulletin-format';
import type { BulletinAttachment } from '@/lib/school-bulletin/types';

type TeacherBulletinDetailScreenProps = {
  postId: string;
};

function buildViewerState(
  attachments: BulletinAttachment[],
  attachment: BulletinAttachment,
): BulletinAttachmentViewerState {
  const previewable = attachments.filter(
    (item) => item.downloadUrl && canPreviewBulletinAttachment(item.mimeType),
  );
  const index = previewable.findIndex((item) => item.id === attachment.id);
  return {
    attachments: previewable,
    index: index >= 0 ? index : 0,
  };
}

export function TeacherBulletinDetailScreen({ postId }: TeacherBulletinDetailScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { data } = useTeacherHome();
  const [viewerState, setViewerState] = useState<BulletinAttachmentViewerState | null>(null);

  const post = useMemo(
    () => data?.summary.bulletinPosts.find((item) => item.id === postId) ?? null,
    [data?.summary.bulletinPosts, postId],
  );

  const dateLabel = post ? formatBulletinDetailDate(post.publishedAt, post.createdAt) : '';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Story.paper }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.line }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
          <Text style={[styles.backLabel, { color: theme.primary }]}>Back</Text>
        </Pressable>

        {post ? (
          <View style={styles.hero}>
            <View style={[styles.iconTile, { backgroundColor: theme.infoBg }]}>
              <Ionicons name="megaphone-outline" size={18} color={theme.info} />
            </View>
            <View style={styles.heroCopy}>
              <StorySectionKicker style={styles.kicker}>School bulletin</StorySectionKicker>
              <StoryDisplayHeading size="section">{post.title}</StoryDisplayHeading>
              {dateLabel ? (
                <Text style={[styles.date, { color: theme.muted }]}>{dateLabel}</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <StoryDisplayHeading size="section">Announcement not found</StoryDisplayHeading>
        )}
      </View>

      {post ? (
        <ScrollView contentContainerStyle={styles.content}>
          {post.body.trim() ? (
            <Text style={[styles.body, { color: theme.ink }]}>{post.body}</Text>
          ) : null}

          {post.attachments.length > 0 ? (
            <View style={post.body.trim() ? styles.attachmentsSection : undefined}>
              <Text style={[styles.attachmentsLabel, { color: theme.muted }]}>Attachments</Text>
              <BulletinAttachmentList
                attachments={post.attachments}
                onOpenAttachment={(attachment) => {
                  setViewerState(buildViewerState(post.attachments, attachment));
                }}
              />
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.notFound}>
          <Text style={[styles.notFoundCopy, { color: theme.muted }]}>
            This announcement may have been removed or is no longer available.
          </Text>
        </View>
      )}

      <BulletinAttachmentViewerModal
        viewerState={viewerState}
        visible={Boolean(viewerState)}
        onClose={() => setViewerState(null)}
        onChangeIndex={(index) => {
          if (!viewerState) return;
          setViewerState({ ...viewerState, index });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    borderBottomWidth: 1,
    gap: Spacing.three,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
  },
  backLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  kicker: {
    marginBottom: 0,
  },
  date: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 24,
  },
  attachmentsSection: {
    gap: Spacing.three,
  },
  attachmentsLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  notFound: {
    flex: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
  },
  notFoundCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
