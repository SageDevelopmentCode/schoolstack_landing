import {
  dateToGalleryPhotoDate,
  galleryPhotoDateToDate,
  todayGalleryPhotoDate,
} from '@/lib/school-gallery/gallery-photo-date';

describe('gallery-photo-date', () => {
  it('round-trips a valid ISO date through Date', () => {
    const iso = '2026-11-02';
    const date = galleryPhotoDateToDate(iso);
    expect(date).not.toBeNull();
    expect(dateToGalleryPhotoDate(date!)).toBe(iso);
  });

  it('returns null for invalid ISO strings', () => {
    expect(galleryPhotoDateToDate('11/02/2026')).toBeNull();
    expect(galleryPhotoDateToDate('2026-13-40')).toBeNull();
    expect(galleryPhotoDateToDate('')).toBeNull();
  });

  it('todayGalleryPhotoDate returns YYYY-MM-DD', () => {
    expect(todayGalleryPhotoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
