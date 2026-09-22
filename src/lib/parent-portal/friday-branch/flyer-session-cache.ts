import { buildEmbeddedPdfViewerUrl } from "@/lib/admissions/enrollment-checklist-document-storage";

export type FlyerCacheEntry = {
  objectUrl: string;
  viewerUrl: string;
};

const cache = new Map<string, FlyerCacheEntry>();
let unloadListenerRegistered = false;

export function buildFlyerCacheKey(
  organizationId: string,
  classId: string,
  previewFamilyId?: string,
): string {
  return `${organizationId}:${classId}:${previewFamilyId ?? ""}`;
}

export function getCachedFlyer(cacheKey: string): FlyerCacheEntry | undefined {
  return cache.get(cacheKey);
}

export function setCachedFlyer(cacheKey: string, objectUrl: string): FlyerCacheEntry {
  const entry: FlyerCacheEntry = {
    objectUrl,
    viewerUrl: buildEmbeddedPdfViewerUrl(objectUrl),
  };
  cache.set(cacheKey, entry);
  registerUnloadCleanup();
  return entry;
}

export function isCachedFlyerObjectUrl(objectUrl: string): boolean {
  for (const entry of cache.values()) {
    if (entry.objectUrl === objectUrl) {
      return true;
    }
  }
  return false;
}

function registerUnloadCleanup(): void {
  if (unloadListenerRegistered || typeof window === "undefined") {
    return;
  }

  unloadListenerRegistered = true;
  window.addEventListener("beforeunload", () => {
    for (const entry of cache.values()) {
      URL.revokeObjectURL(entry.objectUrl);
    }
    cache.clear();
  });
}

/** Test-only helper to reset module state between tests. */
export function clearFlyerSessionCacheForTests(): void {
  for (const entry of cache.values()) {
    URL.revokeObjectURL(entry.objectUrl);
  }
  cache.clear();
  unloadListenerRegistered = false;
}
