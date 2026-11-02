/** Run after the first paint so badge fetches do not compete with the initial render. */
export function scheduleAfterFirstPaint(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(() => callback(), { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(callback, 200);
  return () => window.clearTimeout(id);
}
