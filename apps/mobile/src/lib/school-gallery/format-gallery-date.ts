export function formatGalleryDateLabel(photoDate: string): string {
  const parsed = new Date(`${photoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return photoDate;
  return parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
