import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GalleryPhotoGrid } from '@/components/school-admin/gallery/gallery-photo-grid';
import { GalleryPhotoGridSkeleton } from '@/components/school-admin/gallery/gallery-photo-grid-skeleton';
import {
  GalleryPhotoViewerModal,
  type GalleryPhotoViewerState,
} from '@/components/school-admin/gallery/gallery-photo-viewer-modal';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { formatGalleryDateLabel } from '@/lib/school-gallery/format-gallery-date';
import { groupGalleryPhotosByDate } from '@/lib/school-gallery/group-gallery-photos';
import { useGalleryPhotosFeed } from '@/lib/school-gallery/use-gallery-photos-feed';
import type { GalleryPhoto, GalleryPhotosPage } from '@/lib/school-gallery/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type GalleryPhotosReadonlyScreenProps = {
  organizationId: string;
  testId?: string;
  emptyTitle: string;
  emptyCopy: string;
  listPage: (offset: number) => Promise<GalleryPhotosPage>;
  errorOperationPrefix: string;
  listPrefix?: ReactNode;
  showUploaderOnTiles?: boolean;
};

/** Parent portal photos — avoids upload/image-picker modules in the route chunk. */
export function GalleryPhotosReadonlyScreen({
  organizationId,
  testId = 'photos-screen',
  emptyTitle,
  emptyCopy,
  listPage,
  errorOperationPrefix,
  listPrefix,
  showUploaderOnTiles = false,
}: GalleryPhotosReadonlyScreenProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter();

  const listPageStable = useCallback((offset: number) => listPage(offset), [listPage]);

  const onGalleryLoadError = useCallback(
    (error: unknown, phase: 'initial' | 'load_more') => {
      const operation =
        phase === 'initial'
          ? `${errorOperationPrefix}_list`
          : `${errorOperationPrefix}_load_more`;
      reportError(operation, error);
    },
    [errorOperationPrefix, reportError],
  );

  const {
    photos,
    loading,
    loadingMore,
    initialError,
    loadMoreError,
    hasMore,
    loadMore,
    reload,
  } = useGalleryPhotosFeed({
    listPage: listPageStable,
    onLoadError: onGalleryLoadError,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [viewerSession, setViewerSession] = useState<{ photoId: string } | null>(null);

  const groups = useMemo(() => groupGalleryPhotosByDate(photos), [photos]);

  const viewerPayload = useMemo((): GalleryPhotoViewerState | null => {
    if (!viewerSession) return null;
    const index = photos.findIndex((entry) => entry.id === viewerSession.photoId);
    if (index < 0) return null;
    return { photos, index };
  }, [viewerSession, photos]);

  useEffect(() => {
    if (!viewerSession) return;
    if (!photos.some((entry) => entry.id === viewerSession.photoId)) {
      setViewerSession(null);
    }
  }, [photos, viewerSession]);

  const loadingMoreRef = useRef(loadingMore);
  const hasMoreRef = useRef(hasMore);
  const loadMoreErrorRef = useRef(loadMoreError);

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadMoreErrorRef.current = loadMoreError;
  }, [loadMoreError]);

  useFocusEffect(
    useCallback(() => {
      return () => {};
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    void reload().finally(() => setRefreshing(false));
  };

  const openPhoto = (photo: GalleryPhoto) => {
    if (photos.some((entry) => entry.id === photo.id)) {
      setViewerSession({ photoId: photo.id });
    }
  };

  const handleEndReached = useCallback(() => {
    if (loadingMoreRef.current) return;
    if (!hasMoreRef.current) return;
    if (loadMoreErrorRef.current) return;
    void loadMore();
  }, [loadMore]);

  if (loading && photos.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: Story.paper }]} testID={testId}>
        {listPrefix ? <View style={styles.listPrefix}>{listPrefix}</View> : null}
        <View style={styles.readOnlySkeleton}>
          <GalleryPhotoGridSkeleton tileCount={12} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]} testID={testId}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.scrollContent}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const distanceFromBottom =
            contentSize.height - layoutMeasurement.height - contentOffset.y;
          if (distanceFromBottom < 240) {
            handleEndReached();
          }
        }}
        scrollEventThrottle={200}>
        {listPrefix ? <View style={styles.listPrefix}>{listPrefix}</View> : null}
        {initialError ? (
          <View style={styles.headerBlock}>
            <StoryErrorBanner message={initialError} />
          </View>
        ) : null}

        {groups.length === 0 && !initialError ? (
          <View style={styles.emptyStateWrap}>
            <StoryCard compact style={styles.emptyCard}>
              <Text style={[styles.emptyTitle, { color: theme.ink }]}>{emptyTitle}</Text>
              <Text style={[styles.emptyCopy, { color: theme.muted }]}>{emptyCopy}</Text>
            </StoryCard>
          </View>
        ) : (
          <View style={styles.groups}>
            {groups.map((group) => (
              <View key={group.photoDate} style={styles.groupSection}>
                <Text style={[styles.groupTitle, { color: theme.muted }]}>
                  {formatGalleryDateLabel(group.photoDate)}
                </Text>
                <GalleryPhotoGrid
                  photos={group.photos}
                  selectionMode={false}
                  selectedIds={new Set()}
                  showUploaderOnTiles={showUploaderOnTiles}
                  onPressPhoto={openPhoto}
                  onLongPressPhoto={openPhoto}
                />
              </View>
            ))}
          </View>
        )}

        {loadingMore ? <GalleryPhotoGridSkeleton tileCount={3} /> : null}
        {loadMoreError ? (
          <View style={[styles.footerError, styles.footerErrorInset]}>
            <StoryErrorBanner message={loadMoreError} />
            <StoryButton label="Try again" variant="outline" onPress={() => void loadMore()} />
          </View>
        ) : null}
      </ScrollView>

      <GalleryPhotoViewerModal
        organizationId={organizationId}
        visible={viewerPayload != null}
        viewerState={viewerPayload}
        hasMore={hasMore}
        onClose={() => setViewerSession(null)}
        onChangeIndex={(index) => {
          const active = photos[index];
          if (active) setViewerSession({ photoId: active.id });
        }}
        onRequestMore={loadMore}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  listPrefix: {
    marginBottom: Spacing.one,
  },
  readOnlySkeleton: {
    paddingTop: Spacing.two,
  },
  headerBlock: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  emptyStateWrap: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
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
  groups: {
    gap: Spacing.five,
  },
  groupSection: {
    gap: Spacing.three,
  },
  groupTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  footerErrorInset: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  footerError: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
});
