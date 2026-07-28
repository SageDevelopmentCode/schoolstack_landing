export function scheduleOnIdle(callback: () => void, timeoutMs = 2000): void {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: timeoutMs });
    return;
  }

  globalThis.setTimeout(callback, 1);
}
