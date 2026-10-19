export const GALLERY_PAGE_SIZE = 48;
export const GALLERY_PAGE_SIZE_MAX = 100;

export type GalleryListPageResult = {
  hasMore: boolean;
  nextOffset: number;
};

export function parseGalleryListQuery(searchParams: URLSearchParams): {
  limit: number;
  offset: number;
} {
  const rawLimit = Number(searchParams.get("limit"));
  const rawOffset = Number(searchParams.get("offset"));

  let limit = GALLERY_PAGE_SIZE;
  if (Number.isFinite(rawLimit) && rawLimit > 0) {
    limit = Math.min(Math.floor(rawLimit), GALLERY_PAGE_SIZE_MAX);
  }

  let offset = 0;
  if (Number.isFinite(rawOffset) && rawOffset >= 0) {
    offset = Math.floor(rawOffset);
  }

  return { limit, offset };
}

export function buildGalleryPageMeta(
  offset: number,
  limit: number,
  rowCount: number,
): GalleryListPageResult {
  const hasMore = rowCount > limit;
  const nextOffset = offset + Math.min(limit, rowCount);
  return { hasMore, nextOffset };
}
