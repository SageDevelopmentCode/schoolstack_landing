"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import {
  LazyAthenaTeacherDashboardDemo,
  prefetchAthenaTeacherDemo,
} from "@/components/demo/athena/lazyAthenaDemos";
import {
  LazyWonderHereTeacherDashboardDemo,
  prefetchWonderHereTeacherDemo,
} from "@/components/demo/wonderhere/lazyWonderHereDemos";
import {
  LazyMonarchHillsTeacherDashboardDemo,
  prefetchMonarchHillsTeacherDemo,
} from "@/components/demo/monarchhills/lazyMonarchHillsDemos";
import type { DemoWalkthroughTeacherTab } from "@/data/school-demos/walkthrough-placeholder";

const DESIGN_WIDTH = 1440;

export default function ScaledTeacherDemoPreview({
  demoSlug = "athena-microacademy",
  initialTeacherTab = "attendance",
}: {
  demoSlug?: string;
  initialTeacherTab?: DemoWalkthroughTeacherTab;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.81);
  const isMonarchHills = demoSlug === "monarch-hills-education";
  const isWonderHere = demoSlug === "wonderhere-lakeland";

  useEffect(() => {
    if (isMonarchHills) prefetchMonarchHillsTeacherDemo();
    else if (isWonderHere) prefetchWonderHereTeacherDemo();
    else prefetchAthenaTeacherDemo();
  }, [isMonarchHills, isWonderHere]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const DemoComponent = isMonarchHills
    ? LazyMonarchHillsTeacherDashboardDemo
    : isWonderHere
      ? LazyWonderHereTeacherDashboardDemo
      : LazyAthenaTeacherDashboardDemo;

  return (
    <DemoPreviewFrame variant="teacher">
      <div ref={outerRef} className="relative h-full overflow-hidden">
        <div
          style={{
            width: DESIGN_WIDTH,
            height: scale > 0 ? `${100 / scale}%` : "100%",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <DemoComponent
            initialTab={initialTeacherTab}
            disableTour
            hideNav={false}
          />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
