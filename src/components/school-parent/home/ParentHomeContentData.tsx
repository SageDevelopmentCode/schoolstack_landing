"use client";

import { useLayoutEffect } from "react";
import type { ParentHomeContentData } from "@/lib/parent-portal/load-parent-home-content-data";
import type { ResolvedParentFeatureAnnouncement } from "@/lib/parent-portal/parent-feature-announcements";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import { useParentHomePageContext } from "./parent-home-page-context";

type ParentHomeContentDataProps = {
  contentData?: ParentHomeContentData | null;
  bulletinPosts?: BulletinPost[];
  featureAnnouncements?: ResolvedParentFeatureAnnouncement[];
};

export default function ParentHomeContentData({
  contentData,
  bulletinPosts,
  featureAnnouncements,
}: ParentHomeContentDataProps) {
  const { hydrateHomeContent } = useParentHomePageContext();

  useLayoutEffect(() => {
    hydrateHomeContent({
      contentData,
      bulletinPosts,
      featureAnnouncements,
    });
  }, [bulletinPosts, contentData, featureAnnouncements, hydrateHomeContent]);

  return null;
}
