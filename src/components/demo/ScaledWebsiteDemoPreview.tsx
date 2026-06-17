"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import {
  LazyAthenaWebsiteDashboardDemo,
  prefetchAthenaWebsiteDemo,
} from "@/components/demo/athena/lazyAthenaDemos";
import {
  LazyWonderHereWebsiteDashboardDemo,
  prefetchWonderHereWebsiteDemo,
} from "@/components/demo/wonderhere/lazyWonderHereDemos";
import {
  LazyMonarchHillsWebsiteDashboardDemo,
  prefetchMonarchHillsWebsiteDemo,
} from "@/components/demo/monarchhills/lazyMonarchHillsDemos";
import {
  LazyHiltonHorizonWebsiteDashboardDemo,
  prefetchHiltonHorizonWebsiteDemo,
} from "@/components/demo/hiltonhorizon/lazyHiltonHorizonDemos";
import {
  LazyZoeLearningHouseWebsiteDashboardDemo,
  prefetchZoeLearningHouseWebsiteDemo,
} from "@/components/demo/zoelearninghouse/lazyZoeLearningHouseDemos";

const DESIGN_WIDTH = 1440;

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
  const [scale, setScale] = useState(0.81);
  const isHiltonHorizons = demoSlug === "hilton-horizons-academy";
  const isZoeLearningHouse = demoSlug === "zoe-learning-house";
  const isMonarchHills = demoSlug === "monarch-hills-education";
  const isWonderHere = demoSlug === "wonderhere-lakeland";

  useEffect(() => {
    if (isHiltonHorizons) prefetchHiltonHorizonWebsiteDemo();
    else if (isZoeLearningHouse) prefetchZoeLearningHouseWebsiteDemo();
    else if (isMonarchHills) prefetchMonarchHillsWebsiteDemo();
    else if (isWonderHere) prefetchWonderHereWebsiteDemo();
    else prefetchAthenaWebsiteDemo();
  }, [isHiltonHorizons, isZoeLearningHouse, isMonarchHills, isWonderHere]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const DemoComponent = isHiltonHorizons
    ? LazyHiltonHorizonWebsiteDashboardDemo
    : isZoeLearningHouse
    ? LazyZoeLearningHouseWebsiteDashboardDemo
    : isMonarchHills
      ? LazyMonarchHillsWebsiteDashboardDemo
      : isWonderHere
        ? LazyWonderHereWebsiteDashboardDemo
        : LazyAthenaWebsiteDashboardDemo;

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
          <DemoComponent
            scrollRequest={scrollRequest}
            onDiscoveryCallClick={onDiscoveryCallClick}
          />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
