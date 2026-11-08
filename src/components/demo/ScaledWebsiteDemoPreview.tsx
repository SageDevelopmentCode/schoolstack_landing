"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import {
  LazySchoolWebsiteDashboardDemo,
  prefetchSchoolWebsiteDemo,
} from "@/components/demo/shared/lazySchoolWebsiteDemo";

/**
 * Narrow frames render the phone layout near 1:1 instead of shrinking the
 * desktop site into unreadable text; wider frames scale a tablet or desktop canvas.
 */
function designWidthFor(frameWidth: number) {
  if (frameWidth < 640) return Math.max(375, frameWidth);
  if (frameWidth < 1100) return 1024;
  return 1440;
}

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
  const outerRef = useRef<HTMLDivElement>(null);
  const [designWidth, setDesignWidth] = useState(1440);
  const [scale, setScale] = useState(0.81);

  useEffect(() => {
    void prefetchSchoolWebsiteDemo(demoSlug);
  }, [demoSlug]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => {
      const width = designWidthFor(el.offsetWidth);
      setDesignWidth(width);
      setScale(el.offsetWidth / width);
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <DemoPreviewFrame variant="website">
      <div ref={outerRef} className="relative h-full overflow-hidden">
        <div
          style={{
            width: designWidth,
            height: scale > 0 ? `${100 / scale}%` : "100%",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <LazySchoolWebsiteDashboardDemo
            demoSlug={demoSlug}
            scrollRequest={scrollRequest}
            onDiscoveryCallClick={onDiscoveryCallClick}
          />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
