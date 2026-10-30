import type { NewsletterEdition, NewsletterPhoto } from "./newsletter-types";

const MAX_GALLERY_PAGES = 20;
const PAGE_LIMIT = 100;

type GalleryListResponse = {
  photos?: { id: string; imageUrl?: string }[];
  hasMore?: boolean;
  nextOffset?: number;
};

async function fetchGalleryUrlMap(
  slug: string,
  ids: Set<string>,
): Promise<Map<string, string>> {
  const urlById = new Map<string, string>();
  if (ids.size === 0) return urlById;

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

  return urlById;
}

export async function refreshNewsletterGalleryPhotoUrls(
  slug: string,
  photos: NewsletterPhoto[],
): Promise<NewsletterPhoto[]> {
  const ids = new Set(
    photos.filter((p) => p.galleryPhotoId).map((p) => p.galleryPhotoId as string),
  );
  if (ids.size === 0) return photos;

  const urlById = await fetchGalleryUrlMap(slug, ids);
  if (urlById.size === 0) return photos;

  return photos.map((p) => {
    if (!p.galleryPhotoId) return p;
    const fresh = urlById.get(p.galleryPhotoId);
    return fresh ? { ...p, src: fresh } : p;
  });
}

export async function refreshNewsletterEditionGalleryUrls(
  slug: string,
  edition: NewsletterEdition,
): Promise<NewsletterEdition> {
  const ids = new Set<string>();
  if (edition.coverGalleryPhotoId) {
    ids.add(edition.coverGalleryPhotoId);
  }
  for (const photo of edition.photos) {
    if (photo.galleryPhotoId) ids.add(photo.galleryPhotoId);
  }
  if (ids.size === 0) return edition;

  const urlById = await fetchGalleryUrlMap(slug, ids);
  if (urlById.size === 0) return edition;

  const photos = edition.photos.map((p) => {
    if (!p.galleryPhotoId) return p;
    const fresh = urlById.get(p.galleryPhotoId);
    return fresh ? { ...p, src: fresh } : p;
  });

  let coverImage = edition.coverImage;
  if (edition.coverGalleryPhotoId) {
    coverImage = urlById.get(edition.coverGalleryPhotoId) ?? coverImage;
  }

  return { ...edition, photos, coverImage };
}
