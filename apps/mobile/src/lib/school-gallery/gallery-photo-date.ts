const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function todayGalleryPhotoDate(): string {
  return dateToGalleryPhotoDate(new Date());
}

export function galleryPhotoDateToDate(iso: string): Date | null {
  const trimmed = iso.trim();
  if (!ISO_DATE_PATTERN.test(trimmed)) {
    return null;
  }
  const parsed = new Date(`${trimmed}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export function dateToGalleryPhotoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
