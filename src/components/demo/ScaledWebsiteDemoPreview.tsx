"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import {
  LazyAthenaWebsiteDashboardDemo,
  prefetchAthenaWebsiteDemo,
} from "@/components/demo/athena/lazyAthenaDemos";

const DESIGN_WIDTH = 1440;

interface Props {
  scrollRequest?: { target: "top" | "form"; nonce: number } | null;
  onDiscoveryCallClick?: () => void;
}

export default function ScaledWebsiteDemoPreview({
  scrollRequest,
  onDiscoveryCallClick,
}: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.81);

  useEffect(() => {
    prefetchAthenaWebsiteDemo();
  }, []);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
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
            width: DESIGN_WIDTH,
            height: scale > 0 ? `${100 / scale}%` : "100%",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <LazyAthenaWebsiteDashboardDemo
            scrollRequest={scrollRequest}
            onDiscoveryCallClick={onDiscoveryCallClick}
          />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
