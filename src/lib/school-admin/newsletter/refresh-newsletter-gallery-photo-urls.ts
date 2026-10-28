import type { NewsletterPhoto } from "./newsletter-types";

const MAX_GALLERY_PAGES = 20;
const PAGE_LIMIT = 100;

type GalleryListResponse = {
  photos?: { id: string; imageUrl?: string }[];
  hasMore?: boolean;
  nextOffset?: number;
};

export async function refreshNewsletterGalleryPhotoUrls(
  slug: string,
  photos: NewsletterPhoto[],
): Promise<NewsletterPhoto[]> {
  const ids = new Set(
    photos.filter((p) => p.galleryPhotoId).map((p) => p.galleryPhotoId as string),
  );
  if (ids.size === 0) return photos;

  const urlById = new Map<string, string>();
  let offset = 0;
  let pages = 0;

  while (pages < MAX_GALLERY_PAGES && urlById.size < ids.size) {
    const response = await fetch(
      `/api/school/${slug}/gallery?limit=${PAGE_LIMIT}&offset=${offset}`,
    );
    if (!response.ok) break;
    const body = (await response.json()) as GalleryListResponse;
    for (const photo of body.photos ?? []) {
      if (photo.imageUrl) {
        urlById.set(photo.id, photo.imageUrl);
      }
    }
    if (!body.hasMore) break;
    offset = body.nextOffset ?? offset + PAGE_LIMIT;
    pages += 1;
  }

  if (urlById.size === 0) return photos;

  return photos.map((p) => {
    if (!p.galleryPhotoId) return p;
    const fresh = urlById.get(p.galleryPhotoId);
    return fresh ? { ...p, src: fresh } : p;
  });
}
