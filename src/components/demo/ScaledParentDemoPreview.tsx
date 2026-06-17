"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import {
  LazyAthenaParentDashboardDemo,
  prefetchAthenaParentDemo,
} from "@/components/demo/athena/lazyAthenaDemos";
import {
  LazyWonderHereParentDashboardDemo,
  prefetchWonderHereParentDemo,
} from "@/components/demo/wonderhere/lazyWonderHereDemos";
import type { DemoWalkthroughParentTab } from "@/data/school-demos/walkthrough-placeholder";

const DESIGN_WIDTH = 1440;

export default function ScaledParentDemoPreview({
  demoSlug = "athena-microacademy",
  initialParentTab = "enrollment",
}: {
  demoSlug?: string;
  initialParentTab?: DemoWalkthroughParentTab;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.81);
  const isWonderHere = demoSlug === "wonderhere-lakeland";

  useEffect(() => {
    if (isWonderHere) prefetchWonderHereParentDemo();
    else prefetchAthenaParentDemo();
  }, [isWonderHere]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const DemoComponent = isWonderHere
    ? LazyWonderHereParentDashboardDemo
    : LazyAthenaParentDashboardDemo;

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
          <DemoComponent
            initialTab={initialParentTab}
            disableTour
            hideNav={false}
          />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
