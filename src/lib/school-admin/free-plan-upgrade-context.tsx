"use client";

import { createContext, useContext } from "react";

/**
 * Opens the free-plan unlock popup with a feature label (the same label a
 * locked sidebar row sends). Null outside a free school's admin shell.
 */
const FreePlanUpgradeContext = createContext<((label: string) => void) | null>(null);

export const FreePlanUpgradeProvider = FreePlanUpgradeContext.Provider;

export function useFreePlanUpgrade(): ((label: string) => void) | null {
  return useContext(FreePlanUpgradeContext);
}
