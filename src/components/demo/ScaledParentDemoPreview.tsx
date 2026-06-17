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
import {
  LazyMonarchHillsParentDashboardDemo,
  prefetchMonarchHillsParentDemo,
} from "@/components/demo/monarchhills/lazyMonarchHillsDemos";
import {
  LazyHiltonHorizonParentDashboardDemo,
  prefetchHiltonHorizonParentDemo,
} from "@/components/demo/hiltonhorizon/lazyHiltonHorizonDemos";
import {
  LazyZoeLearningHouseParentDashboardDemo,
  prefetchZoeLearningHouseParentDemo,
} from "@/components/demo/zoelearninghouse/lazyZoeLearningHouseDemos";
import {
  LazyMicahMissionParentDashboardDemo,
  prefetchMicahMissionParentDemo,
} from "@/components/demo/micahmission/lazyMicahMissionDemos";
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
  const isHiltonHorizons = demoSlug === "hilton-horizons-academy";
  const isZoeLearningHouse = demoSlug === "zoe-learning-house";
  const isMonarchHills = demoSlug === "monarch-hills-education";
  const isWonderHere = demoSlug === "wonderhere-lakeland";
  const isMicahMissionSchool = demoSlug === "micahs-mission-school";

  useEffect(() => {
    if (isMicahMissionSchool) prefetchMicahMissionParentDemo();
    else if (isHiltonHorizons) prefetchHiltonHorizonParentDemo();
    else if (isZoeLearningHouse) prefetchZoeLearningHouseParentDemo();
    else if (isMonarchHills) prefetchMonarchHillsParentDemo();
    else if (isWonderHere) prefetchWonderHereParentDemo();
    else prefetchAthenaParentDemo();
  }, [isMicahMissionSchool, isHiltonHorizons, isZoeLearningHouse, isMonarchHills, isWonderHere]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const DemoComponent = isMicahMissionSchool
    ? LazyMicahMissionParentDashboardDemo
    : isHiltonHorizons
    ? LazyHiltonHorizonParentDashboardDemo
    : isZoeLearningHouse
    ? LazyZoeLearningHouseParentDashboardDemo
    : isMonarchHills
      ? LazyMonarchHillsParentDashboardDemo
      : isWonderHere
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
