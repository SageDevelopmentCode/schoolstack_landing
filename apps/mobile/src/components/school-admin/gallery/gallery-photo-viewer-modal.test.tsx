import { act } from 'react';
import TestRenderer from 'react-test-renderer';
import { FlatList } from 'react-native';

import { GalleryPhotoViewerModal } from '@/components/school-admin/gallery/gallery-photo-viewer-modal';
import type { GalleryPhoto } from '@/lib/school-gallery/types';

jest.mock('@/lib/use-mobile-error-reporter', () => ({
  useMobileErrorReporter: () => ({
    reportError: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

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
    imageUrl: `https://example.com/${id}.jpg`,
  };
}

describe('GalleryPhotoViewerModal', () => {
  it('renders at a non-zero index without using initialScrollIndex', () => {
    const photos = Array.from({ length: 6 }, (_, index) => samplePhoto(`photo-${index}`));

    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <GalleryPhotoViewerModal
          organizationId="org-1"
          visible
          hasMore={false}
          viewerState={{ photos, index: 5 }}
          onClose={() => {}}
          onChangeIndex={() => {}}
        />,
      );
    });

    const list = tree.root.findByType(FlatList);
    expect(list.props.initialScrollIndex).toBeUndefined();
    expect(typeof list.props.onScrollToIndexFailed).toBe('function');
    act(() => {
      tree.unmount();
    });
  });
});
