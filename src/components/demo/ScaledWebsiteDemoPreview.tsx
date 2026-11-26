"use client";

import { useEffect } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import DemoScaledCanvas from "@/components/demo/shared/DemoScaledCanvas";
import {
  LazySchoolWebsiteDashboardDemo,
  prefetchSchoolWebsiteDemo,
} from "@/components/demo/shared/lazySchoolWebsiteDemo";

interface Props {
  demoSlug?: string;
  scrollRequest?: { target: "top" | "form"; nonce: number } | null;
  onDiscoveryCallClick?: () => void;
}

export default function ScaledWebsiteDemoPreview({
  demoSlug = "athena-microacademy",
  scrollRequest,
  onDiscoveryCallClick,
}: Props) {
  useEffect(() => {
    void prefetchSchoolWebsiteDemo(demoSlug);
  }, [demoSlug]);

  return (
    <DemoPreviewFrame variant="website">
      <DemoScaledCanvas>
        <LazySchoolWebsiteDashboardDemo
          demoSlug={demoSlug}
          scrollRequest={scrollRequest}
          onDiscoveryCallClick={onDiscoveryCallClick}
          fallback={
            <div className="h-full animate-pulse bg-[var(--sf-cream)]" aria-hidden="true" />
          }
        />
      </DemoScaledCanvas>
    </DemoPreviewFrame>
  );
}
