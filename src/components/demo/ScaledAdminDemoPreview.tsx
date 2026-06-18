"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import {
  LazyAthenaAdminDashboardDemo,
  prefetchAthenaAdminDemo,
} from "@/components/demo/athena/lazyAthenaDemos";
import {
  LazyWonderHereAdminDashboardDemo,
  prefetchWonderHereAdminDemo,
} from "@/components/demo/wonderhere/lazyWonderHereDemos";
import {
  LazyMonarchHillsAdminDashboardDemo,
  prefetchMonarchHillsAdminDemo,
} from "@/components/demo/monarchhills/lazyMonarchHillsDemos";
import {
  LazyHiltonHorizonAdminDashboardDemo,
  prefetchHiltonHorizonAdminDemo,
} from "@/components/demo/hiltonhorizon/lazyHiltonHorizonDemos";
import {
  LazyZoeLearningHouseAdminDashboardDemo,
  prefetchZoeLearningHouseAdminDemo,
} from "@/components/demo/zoelearninghouse/lazyZoeLearningHouseDemos";
import {
  LazyMicahMissionAdminDashboardDemo,
  prefetchMicahMissionAdminDemo,
} from "@/components/demo/micahmission/lazyMicahMissionDemos";
import {
  LazyHomeworkHubAdminDashboardDemo,
  prefetchHomeworkHubAdminDemo,
} from "@/components/demo/homeworkhub/lazyHomeworkHubDemos";
import {
  LazyAscendMicroschoolAdminDashboardDemo,
  prefetchAscendMicroschoolAdminDemo,
} from "@/components/demo/ascendmicroschool/lazyAscendMicroschoolDemos";
import {
  LazyRootedMeadowsAdminDashboardDemo,
  prefetchRootedMeadowsAdminDemo,
} from "@/components/demo/rootedmeadows/lazyRootedMeadowsDemos";
import {
  LazyPrestigeHomeschoolAcademyAdminDashboardDemo,
  prefetchPrestigeHomeschoolAcademyAdminDemo,
} from "@/components/demo/prestigehomeschoolacademy/lazyPrestigeHomeschoolAcademyDemos";
import {
  LazySpringRiverSchoolAdminDashboardDemo,
  prefetchSpringRiverSchoolAdminDemo,
} from "@/components/demo/springriverschool/lazySpringRiverSchoolDemos";
import {
  LazyArizonaGiftedAcademyAdminDashboardDemo,
  prefetchArizonaGiftedAcademyAdminDemo,
} from "@/components/demo/arizonagiftedacademy/lazyArizonaGiftedAcademyDemos";

const DESIGN_WIDTH = 1440;

export default function ScaledAdminDemoPreview({
  demoSlug = "athena-microacademy",
  initialAdmissionsTab = "submissions",
  initialSelectedLeadId,
  initialSelectedFlowId,
  animateNewSubmission,
  autoSendEnrollmentLink,
}: {
  demoSlug?: string;
  initialAdmissionsTab?: "flows" | "submissions";
  initialSelectedLeadId?: string;
  initialSelectedFlowId?: string;
  animateNewSubmission?: boolean;
  autoSendEnrollmentLink?: boolean;
}) {
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
  const isSpringRiverSchool = demoSlug === "spring-river-school";
  const isArizonaGiftedAcademy = demoSlug === "arizona-gifted-academy";

  useEffect(() => {
    if (isSpringRiverSchool) prefetchSpringRiverSchoolAdminDemo();
    else if (isArizonaGiftedAcademy) prefetchArizonaGiftedAcademyAdminDemo();
    else if (isPrestigeHomeschoolAcademy) prefetchPrestigeHomeschoolAcademyAdminDemo();
    else if (isRootedMeadows) prefetchRootedMeadowsAdminDemo();
    else if (isAscendMicroSchool) prefetchAscendMicroschoolAdminDemo();
    else if (isHomeworkHub) prefetchHomeworkHubAdminDemo();
    else if (isMicahMissionSchool) prefetchMicahMissionAdminDemo();
    else if (isHiltonHorizons) prefetchHiltonHorizonAdminDemo();
    else if (isZoeLearningHouse) prefetchZoeLearningHouseAdminDemo();
    else if (isMonarchHills) prefetchMonarchHillsAdminDemo();
    else if (isWonderHere) prefetchWonderHereAdminDemo();
    else prefetchAthenaAdminDemo();
  }, [isSpringRiverSchool, isArizonaGiftedAcademy, isPrestigeHomeschoolAcademy, isRootedMeadows, isAscendMicroSchool, isHomeworkHub, isMicahMissionSchool, isHiltonHorizons, isZoeLearningHouse, isMonarchHills, isWonderHere]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const DemoComponent = isSpringRiverSchool
    ? LazySpringRiverSchoolAdminDashboardDemo
    : isArizonaGiftedAcademy
    ? LazyArizonaGiftedAcademyAdminDashboardDemo
    : isPrestigeHomeschoolAcademy
    ? LazyPrestigeHomeschoolAcademyAdminDashboardDemo
    : isRootedMeadows
    ? LazyRootedMeadowsAdminDashboardDemo
    : isAscendMicroSchool
    ? LazyAscendMicroschoolAdminDashboardDemo
    : isHomeworkHub
    ? LazyHomeworkHubAdminDashboardDemo
    : isMicahMissionSchool
    ? LazyMicahMissionAdminDashboardDemo
    : isHiltonHorizons
    ? LazyHiltonHorizonAdminDashboardDemo
    : isZoeLearningHouse
    ? LazyZoeLearningHouseAdminDashboardDemo
    : isMonarchHills
      ? LazyMonarchHillsAdminDashboardDemo
      : isWonderHere
        ? LazyWonderHereAdminDashboardDemo
        : LazyAthenaAdminDashboardDemo;

  return (
    <DemoPreviewFrame variant="admin">
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
            initialPage="leads"
            initialAdmissionsTab={initialAdmissionsTab}
            initialSelectedLeadId={initialSelectedLeadId}
            initialSelectedFlowId={initialSelectedFlowId}
            animateNewSubmission={animateNewSubmission}
            autoSendEnrollmentLink={autoSendEnrollmentLink}
          />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
