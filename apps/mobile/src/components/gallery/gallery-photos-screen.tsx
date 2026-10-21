import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GalleryEditDateModal } from '@/components/school-admin/gallery/gallery-edit-date-modal';
import { GalleryPhotoGrid } from '@/components/school-admin/gallery/gallery-photo-grid';
import { GalleryPhotoGridSkeleton } from '@/components/school-admin/gallery/gallery-photo-grid-skeleton';
import {
  GalleryPhotoViewerModal,
  type GalleryPhotoViewerState,
} from '@/components/school-admin/gallery/gallery-photo-viewer-modal';
import { GalleryUploadSheet } from '@/components/school-admin/gallery/gallery-upload-sheet';
import { PhotosListSkeleton } from '@/components/school-admin/gallery/photos-list-skeleton';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { formatGalleryApiError } from '@/lib/school-gallery/gallery-api';
import type { PreparedGalleryUploadFile } from '@/lib/school-gallery/gallery-api';
import { formatGalleryDateLabel } from '@/lib/school-gallery/format-gallery-date';
import { groupGalleryPhotosByDate } from '@/lib/school-gallery/group-gallery-photos';
import { useGalleryPhotosFeed } from '@/lib/school-gallery/use-gallery-photos-feed';
import type { GalleryPhoto, GalleryPhotosPage } from '@/lib/school-gallery/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type GalleryPhotosScreenBaseProps = {
  organizationId: string;
  testId?: string;
  emptyTitle: string;
  emptyCopy: string;
  enableBulkDelete: boolean;
  listPage: (offset: number) => Promise<GalleryPhotosPage>;
  errorOperationPrefix: string;
};

export type GalleryPhotosScreenProps =
  | (GalleryPhotosScreenBaseProps & { readOnly: true })
  | (GalleryPhotosScreenBaseProps & {
      readOnly?: false;
      uploadBatch: (
        photoDate: string,
        files: PreparedGalleryUploadFile[],
      ) => Promise<GalleryPhoto[]>;
      patchDate: (photoId: string, photoDate: string) => Promise<GalleryPhoto>;
      deletePhotoById: (photoId: string) => Promise<void>;
      canManagePhoto: (photo: GalleryPhoto) => boolean;
      uploadOperation: string;
      uploadSurface: 'school_admin' | 'teacher_portal';
    });

export function GalleryPhotosScreen(props: GalleryPhotosScreenProps) {
  const readOnly = props.readOnly === true;
  const {
    organizationId,
    testId = 'photos-screen',
    emptyTitle,
    emptyCopy,
    enableBulkDelete,
    listPage,
    errorOperationPrefix,
  } = props;
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter();

  const listPageStable = useCallback((offset: number) => listPage(offset), [listPage]);

  const {
    photos,
    loading,
    loadingMore,
    initialError,
    loadMoreError,
    hasMore,
    loadMore,
    prependPhotos,
    replacePhoto,
    removePhoto,
    reload,
  } = useGalleryPhotosFeed({
    listPage: listPageStable,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [viewerState, setViewerState] = useState<GalleryPhotoViewerState | null>(null);
  const [editPhoto, setEditPhoto] = useState<GalleryPhoto | null>(null);
  const [editDateValue, setEditDateValue] = useState('');
  const [savingDate, setSavingDate] = useState(false);

  const groups = useMemo(() => groupGalleryPhotosByDate(photos), [photos]);
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
      return () => {
        setSelectionMode(false);
        setSelectedIds(new Set());
      };
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    void reload().finally(() => setRefreshing(false));
  };

  const openPhoto = (photo: GalleryPhoto) => {
    if (selectionMode) {
      setSelectedIds((current) => {
        const next = new Set(current);
        if (next.has(photo.id)) next.delete(photo.id);
        else next.add(photo.id);
        return next;
      });
      return;
    }

    const index = photos.findIndex((entry) => entry.id === photo.id);
    if (index >= 0) {
      setViewerState({ photos, index });
    }
  };

  const showPhotoActions = (photo: GalleryPhoto) => {
    if (readOnly || selectionMode) return;

    const actions: {
      text: string;
      onPress?: () => void;
      style?: 'destructive' | 'cancel';
    }[] = [
      {
        text: 'View',
        onPress: () => openPhoto(photo),
      },
    ];

    if (!readOnly && props.canManagePhoto(photo)) {
      actions.push(
        {
          text: 'Edit date',
          onPress: () => {
            setEditPhoto(photo);
            setEditDateValue(photo.photoDate);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void confirmDeletePhoto(photo),
        },
      );
    }

    actions.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(photo.fileName, undefined, actions);
  };

  const confirmDeletePhoto = (photo: GalleryPhoto) => {
    Alert.alert('Delete photo?', `Delete "${photo.fileName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              if (props.readOnly === true) return;
              await props.deletePhotoById(photo.id);
              removePhoto(photo.id);
              setViewerState((current) => {
                if (!current) return null;
                const nextPhotos = current.photos.filter((entry) => entry.id !== photo.id);
                if (nextPhotos.length === 0) return null;
                const nextIndex = Math.min(current.index, nextPhotos.length - 1);
                return { photos: nextPhotos, index: nextIndex };
              });
            } catch (error) {
              reportError(`${errorOperationPrefix}_delete`, error);
              Alert.alert(
                'Could not delete',
                formatGalleryApiError(error, 'Could not delete photo.'),
              );
            }
          })();
        },
      },
    ]);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    Alert.alert('Delete selected?', `Delete ${selectedIds.size} selected photo(s)?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              if (props.readOnly === true) return;
              for (const id of selectedIds) {
                await props.deletePhotoById(id);
                removePhoto(id);
              }
              setSelectedIds(new Set());
              setSelectionMode(false);
              setViewerState(null);
            } catch (error) {
              reportError(`${errorOperationPrefix}_bulk_delete`, error);
              Alert.alert(
                'Could not delete',
                formatGalleryApiError(error, 'Could not delete photos.'),
              );
            }
          })();
        },
      },
    ]);
  };

  const handleSaveDate = async () => {
    if (!editPhoto) return;
    const nextDate = editDateValue.trim();
    if (!nextDate || nextDate === editPhoto.photoDate) {
      setEditPhoto(null);
      return;
    }

    if (props.readOnly === true) return;

    setSavingDate(true);
    try {
      const updated = await props.patchDate(editPhoto.id, nextDate);
      replacePhoto(updated);
      setEditPhoto(null);
    } catch (error) {
      reportError(`${errorOperationPrefix}_edit_date`, error);
      Alert.alert(
        'Could not update',
        formatGalleryApiError(error, 'Could not update photo date.'),
      );
    } finally {
      setSavingDate(false);
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
        {readOnly ? (
          <View style={styles.readOnlySkeleton}>
            <GalleryPhotoGridSkeleton tileCount={12} />
          </View>
        ) : (
          <PhotosListSkeleton />
        )}
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
        {!readOnly || initialError ? (
          <Animated.View entering={FadeInDown.duration(350)} style={styles.headerBlock}>
            {!readOnly ? (
              <View style={styles.actionsRow}>
                {enableBulkDelete ? (
                  selectionMode ? (
                    <>
                      <StoryButton
                        label="Cancel"
                        variant="outline"
                        onPress={() => {
                          setSelectionMode(false);
                          setSelectedIds(new Set());
                        }}
                      />
                      <StoryButton
                        label="Delete selected"
                        variant="outline"
                        onPress={handleDeleteSelected}
                        disabled={selectedIds.size === 0}
                      />
                    </>
                  ) : (
                    <StoryButton
                      label="Select"
                      variant="outline"
                      onPress={() => setSelectionMode(true)}
                      disabled={photos.length === 0}
                    />
                  )
                ) : null}
                <StoryButton label="Upload photos" onPress={() => setUploadOpen(true)} />
              </View>
            ) : null}
            {initialError ? <StoryErrorBanner message={initialError} /> : null}
          </Animated.View>
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
                  selectionMode={enableBulkDelete && selectionMode}
                  selectedIds={selectedIds}
                  onPressPhoto={openPhoto}
                  onLongPressPhoto={readOnly ? openPhoto : showPhotoActions}
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

      {!readOnly ? (
        <GalleryUploadSheet
          visible={uploadOpen}
          onClose={() => setUploadOpen(false)}
          organizationId={organizationId}
          uploadBatch={props.uploadBatch}
          uploadOperation={props.uploadOperation}
          uploadSurface={props.uploadSurface}
          onUploaded={prependPhotos}
        />
      ) : null}

      <GalleryPhotoViewerModal
        visible={viewerState != null}
        viewerState={viewerState}
        hasMore={hasMore}
        onClose={() => setViewerState(null)}
        onChangeIndex={(index) => {
          setViewerState((current) => (current ? { ...current, index } : current));
        }}
        onRequestMore={loadMore}
      />

      {!readOnly ? (
        <GalleryEditDateModal
          visible={editPhoto != null}
          value={editDateValue}
          onChange={setEditDateValue}
          onClose={() => setEditPhoto(null)}
          onSave={() => void handleSaveDate()}
          saving={savingDate}
        />
      ) : null}
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
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: Spacing.two,
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
