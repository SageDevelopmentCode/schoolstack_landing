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

/**
 * Records the reload time, then reloads. Call only after `canReloadForChunkError()`.
 * Returns true when the reload started, false when it did not (the caller should show and
 * report the error instead).
 */
export function reloadForChunkError(): boolean {
  try {
    window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(Date.now()));
    window.location.reload();
    return true;
  } catch {
    // Storage full or blocked: we could not record the reload, so skip it rather than risk a loop.
    return false;
  }
}

/**
 * Reloads the page once for a chunk load failure. Returns true when a reload was started,
 * false when the caller should report the error instead.
 */
export function reloadOnceForChunkError(): boolean {
  return canReloadForChunkError() && reloadForChunkError();
}

/** The parts of an `<input>`, `<textarea>` or `<select>` that tell us whether it holds work. */
export type EditedFieldLike = {
  isConnected: boolean;
  type?: string;
  value?: string;
  checked?: boolean;
};

/**
 * True when a field the visitor edited is still on the page and still holds something:
 * typed text, a picked option, a ticked box. Form state lives only in React, so a reload
 * would throw it away. Fields removed from the page (form submitted, visitor navigated on)
 * and fields cleared back to blank do not count.
 */
export function hasUnsavedFieldValues(fields: Iterable<EditedFieldLike>): boolean {
  for (const field of fields) {
    if (!field.isConnected) continue;
    const type = field.type?.toLowerCase();
    if (type === "hidden") continue;
    if (type === "checkbox" || type === "radio") return true;
    if ((field.value ?? "").trim() !== "") return true;
  }
  return false;
}
