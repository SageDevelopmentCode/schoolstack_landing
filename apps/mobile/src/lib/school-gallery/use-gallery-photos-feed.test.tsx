import { act, useEffect } from 'react';
import TestRenderer, { type ReactTestRenderer } from 'react-test-renderer';
import { Text } from 'react-native';

import {
  useGalleryPhotosFeed,
  type GalleryPhotosFeedLoadPhase,
} from '@/lib/school-gallery/use-gallery-photos-feed';
import type { GalleryPhoto, GalleryPhotosPage } from '@/lib/school-gallery/types';

function samplePhoto(id: string): GalleryPhoto {
  return {
    id,
    organizationId: 'org-1',
    photoDate: '2026-01-01',
    storagePath: `org-1/gallery/${id}/photo.jpg`,
    fileName: `${id}.jpg`,
    mimeType: 'image/jpeg',
    sizeBytes: 1000,
    uploadBatchId: null,
    uploadedBy: null,
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
  };
}

type FeedHandle = ReturnType<typeof useGalleryPhotosFeed>;

function FeedProbe({
  listPage,
  onLoadError,
  onReady,
}: {
  listPage: (offset: number) => Promise<GalleryPhotosPage>;
  onLoadError?: (error: unknown, phase: GalleryPhotosFeedLoadPhase) => void;
  onReady: (feed: FeedHandle) => void;
}) {
  const feed = useGalleryPhotosFeed({ listPage, onLoadError });

  useEffect(() => {
    onReady(feed);
  }, [feed, onReady]);

  return <Text testID="feed-probe">{feed.initialError ?? 'ok'}</Text>;
}

describe('useGalleryPhotosFeed', () => {
  it('reports initial load failures via onLoadError', async () => {
    const onLoadError = jest.fn();
    const listError = new Error('Gallery unavailable');

    await act(async () => {
      TestRenderer.create(
        <FeedProbe
          listPage={async () => {
            throw listError;
          }}
          onLoadError={onLoadError}
          onReady={() => {}}
        />,
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(onLoadError).toHaveBeenCalledWith(listError, 'initial');
  });

  it('reports load-more failures via onLoadError', async () => {
    const onLoadError = jest.fn();
    const loadMoreError = new Error('Pagination failed');
    let feed: FeedHandle | null = null;

    let tree: ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(
        <FeedProbe
          listPage={async (offset) => {
            if (offset === 0) {
              return {
                photos: [samplePhoto('a')],
                hasMore: true,
                nextOffset: 1,
              };
            }
            throw loadMoreError;
          }}
          onLoadError={onLoadError}
          onReady={(next) => {
            feed = next;
          }}
        />,
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await feed?.loadMore();
    });

    expect(onLoadError).toHaveBeenCalledWith(loadMoreError, 'load_more');
    act(() => {
      tree.unmount();
    });
  });
});
