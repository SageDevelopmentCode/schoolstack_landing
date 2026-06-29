"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import RootedMeadowsMobileAppShowcase from "@/components/demo/rootedmeadows/mobile/RootedMeadowsMobileAppShowcase";
import { MOBILE_DESIGN_HEIGHT } from "@/components/demo/rootedmeadows/mobile/MobilePhoneFrame";

const SHOWCASE_HEIGHT = MOBILE_DESIGN_HEIGHT + 160;

export default function ScaledMobileAppPreview({
  demoSlug = "rooted-meadows",
}: {
  demoSlug?: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [scale, setScale] = useState(0.7);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => {
      setContainerWidth(el.offsetWidth);
      const heightScale = el.offsetHeight / SHOWCASE_HEIGHT;
      setScale(Math.min(heightScale, 1));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (demoSlug !== "rooted-meadows") {
    return (
      <DemoPreviewFrame variant="mobile">
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          Mobile preview is not available for this school yet.
        </div>
      </DemoPreviewFrame>
    );
  }

  return (
    <DemoPreviewFrame variant="mobile">
      <div ref={outerRef} className="relative h-full overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: containerWidth,
            height: SHOWCASE_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <RootedMeadowsMobileAppShowcase />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
