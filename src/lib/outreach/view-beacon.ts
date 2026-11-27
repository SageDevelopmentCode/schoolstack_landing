"use client";

import { useEffect } from "react";

/** Link scanners and instant bounces leave before this, so they don't count as a view. */
const VIEW_DELAY_MS = 4000;

/** Automated browsers (Lighthouse performance audits, e2e tests, crawlers) never count. */
const AUTOMATED_UA = /HeadlessChrome|Lighthouse|bot|crawler|spider/i;

function isAutomatedBrowser() {
  return navigator.webdriver === true || AUTOMATED_UA.test(navigator.userAgent);
}

/**
 * Tells Julius (Discord, via `endpoint`) that a school opened one of its outreach pages.
 * Sends once per tab per `storageKey`, after a short stay. Skipped for `?preview=1` (Julius
 * checking a page), `?from=demo` (their demo's "Back to your snapshot" button, same visit)
 * and automated browsers.
 */
export function useViewBeacon({
  endpoint,
  storageKey,
  body,
}: {
  endpoint: string;
  storageKey: string;
  body: Record<string, string | undefined>;
}) {
  const payload = JSON.stringify(body);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("preview") || params.get("from") === "demo" || isAutomatedBrowser()) return;
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
    } catch {
      // Storage blocked: still send once for this page load.
    }
    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(storageKey, "1");
      } catch {
        // ignore
      }
      const sent =
        typeof navigator.sendBeacon === "function" &&
        navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
      if (!sent) {
        void fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    }, VIEW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [endpoint, storageKey, payload]);
}
