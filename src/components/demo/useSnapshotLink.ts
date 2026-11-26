"use client";

import { useSyncExternalStore } from "react";

const SNAPSHOT_PATH = /^\/snapshot\/[a-z0-9-]+\/[A-Za-z0-9_-]+$/;

function storageKey(slug: string) {
  return `mk-snapshot:${slug}`;
}

/**
 * The snapshot page remembers itself on this device so the school's demo can
 * link back to it. The token never goes into the public demo page.
 */
export function rememberSnapshotPath(slug: string, path: string) {
  try {
    window.localStorage.setItem(storageKey(slug), path);
  } catch {
    // Storage blocked: the demo just won't show the button.
  }
}

const noSubscribe = () => () => {};

/** This school's snapshot path if it was opened on this device, else null (always null on the server). */
export function useSnapshotLink(slug: string): string | null {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      try {
        const stored = window.localStorage.getItem(storageKey(slug));
        return stored && SNAPSHOT_PATH.test(stored) ? stored : null;
      } catch {
        return null;
      }
    },
    () => null,
  );
}
