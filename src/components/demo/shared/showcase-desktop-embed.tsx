"use client";

import { createContext, useContext, type ReactNode } from "react";

const ShowcaseDesktopEmbedContext = createContext(false);

export function ShowcaseDesktopEmbedProvider({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  return (
    <ShowcaseDesktopEmbedContext.Provider value={enabled}>
      {children}
    </ShowcaseDesktopEmbedContext.Provider>
  );
}

export function useShowcaseDesktopEmbed(): boolean {
  return useContext(ShowcaseDesktopEmbedContext);
}
