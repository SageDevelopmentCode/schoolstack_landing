import type { NewsletterEdition } from "./newsletter-types";

function normalizeHttpUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return null;
  }
}

/** True when two image src values point at the same asset (ignore signed-URL query churn). */
export function newsletterImageUrlsEquivalent(
  a: string | undefined,
  b: string | undefined,
): boolean {
  const left = a?.trim() ?? "";
  const right = b?.trim() ?? "";
  if (left === right) return true;
  if (!left || !right) return false;
  if (left.startsWith("data:") || right.startsWith("data:")) {
    return left === right;
  }
  const normA = normalizeHttpUrl(left);
  const normB = normalizeHttpUrl(right);
  if (normA && normB) return normA === normB;
  return false;
}

export function newsletterEditionGalleryMediaChanged(
  before: NewsletterEdition,
  after: NewsletterEdition,
): boolean {
  if (!newsletterImageUrlsEquivalent(before.coverImage, after.coverImage)) {
    return true;
  }
  if (before.photos.length !== after.photos.length) return true;
  for (let i = 0; i < before.photos.length; i += 1) {
    const prev = before.photos[i];
    const next = after.photos[i];
    if (prev.galleryPhotoId || next.galleryPhotoId) {
      if (!newsletterImageUrlsEquivalent(prev.src, next.src)) return true;
    }
  }
  return false;
}
