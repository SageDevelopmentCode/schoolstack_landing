"use client";

import { useEffect } from "react";

/**
 * Runs `callback` on an interval and when the tab becomes visible again.
 * Skips interval ticks while `document.visibilityState` is not `visible`.
 */
export function useVisibilityPolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return undefined;

    const run = () => {
      if (document.visibilityState !== "visible") return;
      void callback();
    };

    const intervalId = window.setInterval(run, intervalMs);
    document.addEventListener("visibilitychange", run);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", run);
    };
  }, [callback, enabled, intervalMs]);
}
