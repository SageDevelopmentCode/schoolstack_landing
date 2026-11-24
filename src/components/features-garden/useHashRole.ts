"use client";

import { useSyncExternalStore } from "react";
import type { FeatureRole } from "@/lib/marketing/features/types";

const ROLES: FeatureRole[] = ["admin", "family", "staff"];

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/** The role named in the URL hash (`#family` or `#for-family`), or null. Null on the server. */
export function useHashRole(): FeatureRole | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      const id = window.location.hash.replace(/^#(for-)?/, "");
      return ROLES.find((r) => r === id) ?? null;
    },
    () => null,
  );
}
