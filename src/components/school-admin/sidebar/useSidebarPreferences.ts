"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mk-admin-sidebar-expanded";

function readStored(): boolean | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "1") return true;
    if (value === "0") return false;
  } catch {
    // Storage blocked (private mode, previews): fall back to the default.
  }
  return null;
}

function writeStored(expanded: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, expanded ? "1" : "0");
  } catch {
    // Ignore storage failures; the toggle still works for this visit.
  }
}

/**
 * Sidebar expanded/collapsed, remembered per browser. Read after mount so the
 * server render and first client render match. Preview embeds ignore the
 * stored value and keep `initialExpanded`.
 */
export function useSidebarExpanded(initialExpanded: boolean, remember: boolean) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [ready, setReady] = useState(!remember);

  useEffect(() => {
    if (!remember) return;
    let timer = 0;
    queueMicrotask(() => {
      const stored = readStored();
      if (stored != null) setExpanded(stored);
      // Turn the width animation on only after the stored width has painted,
      // so a collapsed sidebar doesn't visibly shrink on every page load.
      timer = window.setTimeout(() => setReady(true), 60);
    });
    return () => window.clearTimeout(timer);
  }, [remember]);

  const set = useCallback(
    (next: boolean | ((current: boolean) => boolean)) => {
      setExpanded((current) => {
        const value = typeof next === "function" ? next(current) : next;
        if (remember) writeStored(value);
        return value;
      });
    },
    [remember],
  );

  return { expanded, setExpanded: set, ready };
}
