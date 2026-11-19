import { useCallback, useRef } from 'react';

/** A second process termination within this window of a silent reload is a crash loop. */
export const WEBVIEW_TERMINATION_CRASH_LOOP_WINDOW_MS = 30_000;

/**
 * Decides what to do when a WebView's web content process goes away
 * (`onContentProcessDidTerminate` on iOS, `onRenderProcessGone` on Android).
 *
 * iOS kills a backgrounded app's web content process routinely, and Apple's
 * documented recovery is to reload. So `shouldReloadAfterTermination()` returns
 * true (reload silently, don't report) unless the previous silent reload was
 * less than 30s ago, which means the page is crash-looping and should be
 * reported and replaced by an error state.
 */
export function useWebViewTerminationRecovery() {
  const lastReloadAtRef = useRef<number | null>(null);

  const shouldReloadAfterTermination = useCallback(() => {
    const now = Date.now();
    const lastReloadAt = lastReloadAtRef.current;
    if (lastReloadAt !== null && now - lastReloadAt <= WEBVIEW_TERMINATION_CRASH_LOOP_WINDOW_MS) {
      return false;
    }
    lastReloadAtRef.current = now;
    return true;
  }, []);

  /** Call on a fresh load or Try again so a new document starts with a clean slate. */
  const resetTerminationRecovery = useCallback(() => {
    lastReloadAtRef.current = null;
  }, []);

  return { shouldReloadAfterTermination, resetTerminationRecovery };
}
