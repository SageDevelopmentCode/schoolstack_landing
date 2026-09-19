import { buildBulletinImageViewerState } from '@/lib/school-bulletin/attachment-preview';
import type { BulletinAttachment } from '@/lib/school-bulletin/types';

function makeAttachment(
  overrides: Partial<BulletinAttachment> & Pick<BulletinAttachment, 'id' | 'mimeType'>,
): BulletinAttachment {
  return {
    fileName: `${overrides.id}.file`,
    storagePath: `path/${overrides.id}`,
    sizeBytes: 1024,
    downloadUrl: 'https://example.com/file',
    ...overrides,
  };
}

describe('buildBulletinImageViewerState', () => {
  const pdf = makeAttachment({ id: 'pdf', mimeType: 'application/pdf' });
  const imageA = makeAttachment({ id: 'image-a', mimeType: 'image/jpeg' });
  const imageB = makeAttachment({ id: 'image-b', mimeType: 'image/png' });

  it('returns index 0 for the first image when a PDF precedes it', () => {
    const state = buildBulletinImageViewerState([pdf, imageA, imageB], imageA);

    expect(state.attachments).toEqual([imageA, imageB]);
    expect(state.index).toBe(0);
  });

  it('returns the correct index when a PDF is between images', () => {
    const state = buildBulletinImageViewerState([imageA, pdf, imageB], imageB);

    expect(state.attachments).toEqual([imageA, imageB]);
    expect(state.index).toBe(1);
  });

  it('falls back to index 0 when the attachment is not an image', () => {
    const state = buildBulletinImageViewerState([pdf], pdf);

    expect(state.attachments).toEqual([]);
    expect(state.index).toBe(0);
  });
});
