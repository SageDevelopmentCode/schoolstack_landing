import {
  postGalleryFormDataChunks,
  type GalleryBlobUploadPart,
} from '@/lib/school-gallery/gallery-chunked-upload';
import { GalleryUploadPartialFailureError } from '@/lib/school-gallery/gallery-upload-partial-error';
import { MAX_GALLERY_UPLOAD_REQUEST_BYTES } from '@/lib/school-gallery/gallery-upload-chunks';
import type { GalleryPhoto } from '@/lib/school-gallery/types';

function makePart(id: string, sizeBytes: number): GalleryBlobUploadPart {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type: 'image/jpeg' });
  return {
    uri: `file://${id}`,
    name: `${id}.jpg`,
    type: 'image/jpeg',
    blob,
    sizeBytes,
  };
}

function galleryPhoto(id: string): GalleryPhoto {
  return {
    id,
    organizationId: 'org-1',
    photoDate: '2026-01-01',
    storagePath: `${id}/photo.jpg`,
    fileName: `${id}.jpg`,
    mimeType: 'image/jpeg',
    sizeBytes: 100,
    uploadBatchId: null,
    uploadedBy: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('postGalleryFormDataChunks', () => {
  it('throws partial failure when a later chunk fails', async () => {
    const half = Math.floor(MAX_GALLERY_UPLOAD_REQUEST_BYTES / 2) + 1;
    const parts = [makePart('a', half), makePart('b', half)];
    let callCount = 0;

    await expect(
      postGalleryFormDataChunks({
        path: '/api/school/demo/gallery',
        photoDate: '2026-01-01',
        parts,
        postFormData: async () => {
          callCount += 1;
          if (callCount === 1) {
            return { photos: [galleryPhoto('photo-a')] };
          }
          throw new Error('network');
        },
      }),
    ).rejects.toMatchObject({
      name: 'GalleryUploadPartialFailureError',
      uploadedPhotos: [expect.objectContaining({ id: 'photo-a' })],
      remainingFiles: [expect.objectContaining({ uri: 'file://b' })],
    });
  });

  it('rethrows on first chunk failure without partial error', async () => {
    const half = Math.floor(MAX_GALLERY_UPLOAD_REQUEST_BYTES / 2) + 1;
    const parts = [makePart('a', half), makePart('b', half)];

    try {
      await postGalleryFormDataChunks({
        path: '/api/school/demo/gallery',
        photoDate: '2026-01-01',
        parts,
        postFormData: async () => {
          throw new Error('network');
        },
      });
      throw new Error('expected upload to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('network');
      expect(error).not.toBeInstanceOf(GalleryUploadPartialFailureError);
    }
  });
});
