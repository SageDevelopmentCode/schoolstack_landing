import {
  chunkGalleryUploadByByteBudget,
  MAX_GALLERY_UPLOAD_REQUEST_BYTES,
} from '@/lib/school-gallery/gallery-upload-chunks';

describe('chunkGalleryUploadByByteBudget', () => {
  it('keeps a small batch in one request', () => {
    const chunks = chunkGalleryUploadByByteBudget([
      { item: 'a', sizeBytes: 500_000 },
      { item: 'b', sizeBytes: 500_000 },
    ]);

    expect(chunks).toEqual([['a', 'b']]);
  });

  it('splits when combined size exceeds the byte budget', () => {
    const half = Math.floor(MAX_GALLERY_UPLOAD_REQUEST_BYTES / 2) + 1;
    const chunks = chunkGalleryUploadByByteBudget([
      { item: 'a', sizeBytes: half },
      { item: 'b', sizeBytes: half },
    ]);

    expect(chunks).toEqual([['a'], ['b']]);
  });
});
