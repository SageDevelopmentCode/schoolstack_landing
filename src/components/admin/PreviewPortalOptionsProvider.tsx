"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";

const PreviewPortalOptionsContext = createContext<SchoolPortalOption[]>([]);

type PreviewPortalOptionsProviderProps = {
  options: SchoolPortalOption[];
  children: ReactNode;
};

export function PreviewPortalOptionsProvider({
  options,
  children,
}: PreviewPortalOptionsProviderProps) {
  return (
    <PreviewPortalOptionsContext.Provider value={options}>
      {children}
    </PreviewPortalOptionsContext.Provider>
  );
}

export function usePreviewPortalOptions(): SchoolPortalOption[] {
  return useContext(PreviewPortalOptionsContext);
}
