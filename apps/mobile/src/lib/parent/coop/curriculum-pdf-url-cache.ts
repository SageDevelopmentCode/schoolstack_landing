import type { ParentCoopCurriculumPdfUrl } from '@/lib/parent/parent-portal-api';

/** Reuse a signed URL until this long before it expires. */
const EXPIRY_MARGIN_MS = 60_000;

type Entry = { payload: ParentCoopCurriculumPdfUrl; expiresAt: number };

/**
 * Session cache of curriculum signed URLs. Switching back to a guide (or
 * reopening the screen) reuses the same URL, so the WebView's HTTP cache can
 * serve the PDF ranges it already fetched instead of starting over.
 */
const cache = new Map<string, Entry>();

function keyFor(programId: string, curriculumId: string): string {
  return `${programId}:${curriculumId}`;
}

export function getCachedCurriculumPdfUrl(
  programId: string,
  curriculumId: string,
  now: number = Date.now(),
): ParentCoopCurriculumPdfUrl | null {
  const entry = cache.get(keyFor(programId, curriculumId));
  if (!entry) return null;
  if (entry.expiresAt - EXPIRY_MARGIN_MS <= now) {
    cache.delete(keyFor(programId, curriculumId));
    return null;
  }
  return entry.payload;
}

export function setCachedCurriculumPdfUrl(
  programId: string,
  curriculumId: string,
  payload: ParentCoopCurriculumPdfUrl,
  now: number = Date.now(),
): void {
  const ttlMs = Math.max(0, (payload.expiresInSeconds ?? 0) * 1000);
  if (ttlMs <= EXPIRY_MARGIN_MS) return;
  cache.set(keyFor(programId, curriculumId), { payload, expiresAt: now + ttlMs });
}

export function clearCurriculumPdfUrlCache(): void {
  cache.clear();
}
