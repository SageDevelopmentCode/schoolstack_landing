"use client";

import { createContext, useContext } from "react";
import type { ParentHomeContentData } from "@/lib/parent-portal/load-parent-home-content-data";
import type { ResolvedParentFeatureAnnouncement } from "@/lib/parent-portal/parent-feature-announcements";
import type { BulletinPost } from "@/lib/school-bulletin/types";

export type ParentHomeHydration = {
  contentData?: ParentHomeContentData | null;
  bulletinPosts?: BulletinPost[];
  featureAnnouncements?: ResolvedParentFeatureAnnouncement[];
};

type ParentHomePageContextValue = {
  hydrateHomeContent: (data: ParentHomeHydration) => void;
};

export const ParentHomePageContext = createContext<ParentHomePageContextValue | null>(null);

export function useParentHomePageContext() {
  const context = useContext(ParentHomePageContext);
  if (!context) {
    throw new Error("useParentHomePageContext must be used within ParentHomePageShell");
  }
  return context;
}
