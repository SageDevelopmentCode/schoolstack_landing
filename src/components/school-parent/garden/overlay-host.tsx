"use client";

import { createContext, useContext, type ReactNode } from "react";

/*
 * Where Garden overlays portal to. Unset (the portals) they go to
 * `document.body`. Scaled marketing demos (blog embeds) set an in-canvas node
 * so drawers and dialogs stay inside the transformed frame, and focus moves
 * without scrolling the host page.
 */
const GardenOverlayHostContext = createContext<HTMLElement | null>(null);

export function GardenOverlayHostProvider({
  container,
  children,
}: {
  container: HTMLElement | null;
  children: ReactNode;
}) {
  return <GardenOverlayHostContext.Provider value={container}>{children}</GardenOverlayHostContext.Provider>;
}

/** The in-canvas overlay node, or `null` for `document.body`. */
export function useGardenOverlayHost(): HTMLElement | null {
  return useContext(GardenOverlayHostContext);
}
