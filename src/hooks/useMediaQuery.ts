"use client";

import { useSyncExternalStore } from "react";

type UseMediaQueryOptions = {
  /** Value during SSR / before hydration. Default false. */
  serverSnapshot?: boolean;
};

function subscribe(query: string, callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches;
}

export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {},
): boolean {
  const { serverSnapshot = false } = options;

  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => getSnapshot(query),
    () => serverSnapshot,
  );
}
