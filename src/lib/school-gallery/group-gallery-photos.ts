import type { GalleryPhoto } from "./types";

export type GalleryPhotoDateGroup = {
  photoDate: string;
  photos: GalleryPhoto[];
};

export function groupGalleryPhotosByDate(
  photos: GalleryPhoto[],
): GalleryPhotoDateGroup[] {
  const groups = new Map<string, GalleryPhoto[]>();

  for (const photo of photos) {
    const list = groups.get(photo.photoDate) ?? [];
    list.push(photo);
    groups.set(photo.photoDate, list);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([photoDate, groupPhotos]) => ({
      photoDate,
      photos: groupPhotos.sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    }));
}
