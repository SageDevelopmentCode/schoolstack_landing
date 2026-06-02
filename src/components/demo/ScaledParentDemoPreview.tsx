"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import {
  LazyAthenaParentDashboardDemo,
  prefetchAthenaParentDemo,
} from "@/components/demo/athena/lazyAthenaDemos";
import type { DemoWalkthroughParentTab } from "@/data/school-demos/walkthrough-placeholder";

const DESIGN_WIDTH = 1440;

export default function ScaledParentDemoPreview({
  initialParentTab = "enrollment",
}: {
  initialParentTab?: DemoWalkthroughParentTab;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.81);

  useEffect(() => {
    prefetchAthenaParentDemo();
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
    <DemoPreviewFrame variant="parent">
      <div ref={outerRef} className="relative h-full overflow-hidden">
        <div
          className="h-full"
          style={{
            width: DESIGN_WIDTH,
            height: scale > 0 ? `${100 / scale}%` : "100%",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <LazyAthenaParentDashboardDemo
            initialTab={initialParentTab}
            disableTour
            hideNav={false}
          />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
