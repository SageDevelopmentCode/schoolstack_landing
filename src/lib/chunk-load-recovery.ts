/**
 * A ChunkLoadError means the page's HTML came from one build and asked for a JS/CSS chunk
 * the server no longer has (a deploy landed while the tab was open) or the network dropped
 * mid-load. Fresh HTML fixes it, so we reload once instead of showing a blank error page.
 */

const CHUNK_LOAD_MESSAGE_PATTERN =
  /loading chunk [\w~.-]+ failed|failed to load chunk|loading css chunk|error loading dynamically imported module|importing a module script failed|failed to fetch dynamically imported module/i;

export const CHUNK_RELOAD_STORAGE_KEY = "mk-chunk-reload-at";

/** A second chunk failure within this window means the reload did not help: stop and report. */
export const CHUNK_RELOAD_WINDOW_MS = 30_000;

export function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    if (error.name === "ChunkLoadError") return true;
    return CHUNK_LOAD_MESSAGE_PATTERN.test(error.message);
  }
  if (typeof error === "string") return CHUNK_LOAD_MESSAGE_PATTERN.test(error);
  return false;
}

/** True when a reload is allowed now: never reloaded, or the last reload was long enough ago. */
export function shouldReloadForChunkError(lastReloadAt: string | null, now: number): boolean {
  if (!lastReloadAt) return true;
  const last = Number(lastReloadAt);
  if (!Number.isFinite(last)) return true;
  return now - last > CHUNK_RELOAD_WINDOW_MS;
}

/**
 * Read-only check: may we reload for a chunk failure now? False when we already reloaded in
 * the last 30 s, or when storage is blocked (we could not tell, and must not loop).
 */
export function canReloadForChunkError(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return shouldReloadForChunkError(
      window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY),
      Date.now(),
    );
  } catch {
    return false;
  }
}

/** Records the reload time, then reloads. Call only after `canReloadForChunkError()`. */
export function reloadForChunkError(): void {
  try {
    window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(Date.now()));
    window.location.reload();
  } catch {
    // Storage blocked between check and write: skip the reload rather than risk a loop.
  }
}

/**
 * Reloads the page once for a chunk load failure. Returns true when a reload was started,
 * false when the caller should report the error instead.
 */
export function reloadOnceForChunkError(): boolean {
  if (!canReloadForChunkError()) return false;
  reloadForChunkError();
  return true;
}
