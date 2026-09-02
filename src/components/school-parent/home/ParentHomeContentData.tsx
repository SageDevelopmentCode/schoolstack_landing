"use client";

import { useLayoutEffect } from "react";
import type { ParentHomeContentData } from "@/lib/parent-portal/load-parent-home-content-data";
import { useParentHomePageContext } from "./parent-home-page-context";

type ParentHomeContentDataProps = {
  contentData: ParentHomeContentData;
};

export default function ParentHomeContentData({
  contentData,
}: ParentHomeContentDataProps) {
  const { hydrateHomeContent } = useParentHomePageContext();

  useLayoutEffect(() => {
    hydrateHomeContent(contentData);
  }, [contentData, hydrateHomeContent]);

  return null;
}
