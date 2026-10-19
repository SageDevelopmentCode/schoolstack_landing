import type { GalleryPhoto } from "./types";

export function canManageGalleryPhoto(input: {
  isOrgAdmin: boolean;
  userId: string | null | undefined;
  photo: Pick<GalleryPhoto, "uploadedBy">;
}): boolean {
  if (input.isOrgAdmin) {
    return true;
  }

  if (!input.userId || !input.photo.uploadedBy) {
    return false;
  }

  return input.photo.uploadedBy === input.userId;
}
