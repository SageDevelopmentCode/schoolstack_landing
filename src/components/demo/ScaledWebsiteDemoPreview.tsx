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
import {
  LazyMicahMissionWebsiteDashboardDemo,
  prefetchMicahMissionWebsiteDemo,
} from "@/components/demo/micahmission/lazyMicahMissionDemos";
import {
  LazyHomeworkHubWebsiteDashboardDemo,
  prefetchHomeworkHubWebsiteDemo,
} from "@/components/demo/homeworkhub/lazyHomeworkHubDemos";
import {
  LazyAscendMicroschoolWebsiteDashboardDemo,
  prefetchAscendMicroschoolWebsiteDemo,
} from "@/components/demo/ascendmicroschool/lazyAscendMicroschoolDemos";
import {
  LazyRootedMeadowsWebsiteDashboardDemo,
  prefetchRootedMeadowsWebsiteDemo,
} from "@/components/demo/rootedmeadows/lazyRootedMeadowsDemos";
import {
  LazyPrestigeHomeschoolAcademyWebsiteDashboardDemo,
  prefetchPrestigeHomeschoolAcademyWebsiteDemo,
} from "@/components/demo/prestigehomeschoolacademy/lazyPrestigeHomeschoolAcademyDemos";

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
  const isMicahMissionSchool = demoSlug === "micahs-mission-school";
  const isHomeworkHub = demoSlug === "homework-hub";
  const isAscendMicroSchool = demoSlug === "ascend-micro-school";
  const isRootedMeadows = demoSlug === "rooted-meadows";
  const isPrestigeHomeschoolAcademy = demoSlug === "prestige-homeschool-academy";

  useEffect(() => {
    if (isPrestigeHomeschoolAcademy) prefetchPrestigeHomeschoolAcademyWebsiteDemo();
    else if (isRootedMeadows) prefetchRootedMeadowsWebsiteDemo();
    else if (isAscendMicroSchool) prefetchAscendMicroschoolWebsiteDemo();
    else if (isHomeworkHub) prefetchHomeworkHubWebsiteDemo();
    else if (isMicahMissionSchool) prefetchMicahMissionWebsiteDemo();
    else if (isHiltonHorizons) prefetchHiltonHorizonWebsiteDemo();
    else if (isZoeLearningHouse) prefetchZoeLearningHouseWebsiteDemo();
    else if (isMonarchHills) prefetchMonarchHillsWebsiteDemo();
    else if (isWonderHere) prefetchWonderHereWebsiteDemo();
    else prefetchAthenaWebsiteDemo();
  }, [isPrestigeHomeschoolAcademy, isRootedMeadows, isAscendMicroSchool, isHomeworkHub, isMicahMissionSchool, isHiltonHorizons, isZoeLearningHouse, isMonarchHills, isWonderHere]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const DemoComponent = isPrestigeHomeschoolAcademy
    ? LazyPrestigeHomeschoolAcademyWebsiteDashboardDemo
    : isRootedMeadows
    ? LazyRootedMeadowsWebsiteDashboardDemo
    : isAscendMicroSchool
    ? LazyAscendMicroschoolWebsiteDashboardDemo
    : isHomeworkHub
    ? LazyHomeworkHubWebsiteDashboardDemo
    : isMicahMissionSchool
    ? LazyMicahMissionWebsiteDashboardDemo
    : isHiltonHorizons
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
