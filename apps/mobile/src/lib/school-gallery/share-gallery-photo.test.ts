import {
  galleryPhotoCacheFileUri,
  sanitizeGalleryPhotoFileName,
} from '@/lib/school-gallery/share-gallery-photo';

describe('sanitizeGalleryPhotoFileName', () => {
  it('replaces path separators and unsafe characters', () => {
    expect(sanitizeGalleryPhotoFileName('../evil/name.jpg')).toBe('_evil_name.jpg');
    expect(sanitizeGalleryPhotoFileName('  picnic (1).jpg  ')).toBe('picnic (1).jpg');
  });

  it('falls back when the name is empty after sanitization', () => {
    expect(sanitizeGalleryPhotoFileName('   ')).toBe('photo');
  });
});

describe('galleryPhotoCacheFileUri', () => {
  it('includes photo id and sanitized file name', () => {
    const uri = galleryPhotoCacheFileUri('photo-abc', 'class trip.jpg');
    expect(uri).toContain('gallery-photo-abc-class trip.jpg');
  });
});
