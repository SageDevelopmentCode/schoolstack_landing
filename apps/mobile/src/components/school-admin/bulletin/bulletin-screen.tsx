import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BulletinListSkeleton } from '@/components/school-admin/bulletin/bulletin-list-skeleton';
import { BulletinMetricRow } from '@/components/school-admin/bulletin/bulletin-metric-row';
import { BulletinPostEditorSheet } from '@/components/school-admin/bulletin/bulletin-post-editor-sheet';
import { BulletinPostListItem } from '@/components/school-admin/bulletin/bulletin-post-list-item';
import { BulletinStoryHeader } from '@/components/school-admin/bulletin/bulletin-story-header';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { resolveBulletinDisplayStatus } from '@/lib/school-bulletin/bulletin-audience';
import { fetchBulletinPosts, formatBulletinApiError } from '@/lib/school-bulletin/bulletin-api';
import type { BulletinPost, ProgramOption } from '@/lib/school-bulletin/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type BulletinScreenProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
};

export function BulletinScreen({ organizationId: _organizationId, slug, schoolName }: BulletinScreenProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter();

  const [posts, setPosts] = useState<BulletinPost[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorIsNew, setEditorIsNew] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const loadPosts = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await fetchBulletinPosts(slug);
        setPosts(data.posts);
        setPrograms(data.programs);
      } catch (loadError) {
        reportError('school_admin_bulletin_load', loadError);
        setError(formatBulletinApiError(loadError, 'Could not load bulletin posts.'));
        setPosts([]);
        setPrograms([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [reportError, slug],
  );

  useFocusEffect(
    useCallback(() => {
      void loadPosts();
    }, [loadPosts]),
  );

  const metrics = useMemo(() => {
    const active = posts.filter((post) => resolveBulletinDisplayStatus(post) === 'active').length;
    const drafts = posts.filter((post) => post.status === 'draft').length;
    const scheduled = posts.filter(
      (post) => resolveBulletinDisplayStatus(post) === 'scheduled',
    ).length;
    return { active, drafts, scheduled, total: posts.length };
  }, [posts]);

  const editorPost = useMemo(() => {
    if (editorIsNew) return null;
    return posts.find((post) => post.id === selectedPostId) ?? null;
  }, [editorIsNew, posts, selectedPostId]);

  const openNewEditor = () => {
    setSelectedPostId(null);
    setEditorIsNew(true);
    setEditorOpen(true);
  };

  const openExistingEditor = (postId: string) => {
    setSelectedPostId(postId);
    setEditorIsNew(false);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditorIsNew(false);
  };

  const handleSaved = (post: BulletinPost) => {
    setPosts((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === post.id);
      if (existingIndex === -1) {
        return [post, ...current];
      }
      const next = [...current];
      next[existingIndex] = post;
      return next;
    });
    setSelectedPostId(post.id);
    setEditorIsNew(false);
  };

  const handleDeleted = () => {
    if (selectedPostId) {
      setPosts((current) => current.filter((post) => post.id !== selectedPostId));
    }
    setSelectedPostId(null);
    closeEditor();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    void loadPosts({ silent: true });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Story.paper }]} testID="bulletin-screen">
        <BulletinListSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]} testID="bulletin-screen">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.duration(350)} style={styles.headerBlock}>
            <BulletinStoryHeader schoolName={schoolName} />
            <View style={styles.actionsRow}>
              <StoryButton label="New post" onPress={openNewEditor} />
            </View>
            {error ? <StoryErrorBanner message={error} /> : null}
            <BulletinMetricRow
              activeCount={metrics.active}
              draftsCount={metrics.drafts}
              scheduledCount={metrics.scheduled}
              totalCount={metrics.total}
            />
            {posts.length === 0 && !error ? (
              <StoryCard compact style={styles.emptyCard}>
                <Text style={[styles.emptyTitle, { color: theme.ink }]}>No bulletin posts yet</Text>
                <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                  Create your first announcement for families and staff.
                </Text>
              </StoryCard>
            ) : null}
          </Animated.View>
        }
        renderItem={({ item }) => (
          <BulletinPostListItem
            post={item}
            programs={programs}
            onPress={() => openExistingEditor(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <BulletinPostEditorSheet
        visible={editorOpen}
        onClose={closeEditor}
        slug={slug}
        post={editorPost}
        programs={programs}
        isNew={editorIsNew}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  headerBlock: {
    gap: Spacing.four,
    marginBottom: Spacing.two,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  emptyCard: {
    padding: Spacing.four,
    gap: Spacing.one,
  },
  emptyTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  separator: {
    height: Spacing.two,
  },
});
