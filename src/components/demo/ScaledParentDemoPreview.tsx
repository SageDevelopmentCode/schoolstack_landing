"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import {
  LazyAthenaParentDashboardDemo,
  prefetchAthenaParentDemo,
} from "@/components/demo/athena/lazyAthenaDemos";
import {
  LazyWonderingOaksLearningParentDashboardDemo,
  prefetchWonderingOaksLearningParentDemo,
} from "@/components/demo/wonderingoakslearning/lazyWonderingOaksLearningDemos";
import {
  LazyWildHeartsAdventureParentDashboardDemo,
  prefetchWildHeartsAdventureParentDemo,
} from "@/components/demo/wildheartsadventure/lazyWildHeartsAdventureDemos";
import {
  LazyNaturesSchoolhouseParentDashboardDemo,
  prefetchNaturesSchoolhouseParentDemo,
} from "@/components/demo/natureschoolhouse/lazyNaturesSchoolhouseDemos";
import {
  LazyTheWoodlandsMicroschoolParentDashboardDemo,
  prefetchTheWoodlandsMicroschoolParentDemo,
} from "@/components/demo/thewoodlandsmicroschool/lazyTheWoodlandsMicroschoolDemos";
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
import {
  LazyHomeworkHubParentDashboardDemo,
  prefetchHomeworkHubParentDemo,
} from "@/components/demo/homeworkhub/lazyHomeworkHubDemos";
import {
  LazyAscendMicroschoolParentDashboardDemo,
  prefetchAscendMicroschoolParentDemo,
} from "@/components/demo/ascendmicroschool/lazyAscendMicroschoolDemos";
import {
  LazyRootedMeadowsParentDashboardDemo,
  prefetchRootedMeadowsParentDemo,
} from "@/components/demo/rootedmeadows/lazyRootedMeadowsDemos";
import {
  LazyPrestigeHomeschoolAcademyParentDashboardDemo,
  prefetchPrestigeHomeschoolAcademyParentDemo,
} from "@/components/demo/prestigehomeschoolacademy/lazyPrestigeHomeschoolAcademyDemos";
import {
  LazySpringRiverSchoolParentDashboardDemo,
  prefetchSpringRiverSchoolParentDemo,
} from "@/components/demo/springriverschool/lazySpringRiverSchoolDemos";
import {
  LazyArizonaGiftedAcademyParentDashboardDemo,
  prefetchArizonaGiftedAcademyParentDemo,
} from "@/components/demo/arizonagiftedacademy/lazyArizonaGiftedAcademyDemos";
import {
  LazyLighthouseHomeschoolParentDashboardDemo,
  prefetchLighthouseHomeschoolParentDemo,
} from "@/components/demo/lighthousehomeschool/lazyLighthouseHomeschoolDemos";
import {
  LazyLuffLearningParentDashboardDemo,
  prefetchLuffLearningParentDemo,
} from "@/components/demo/lufflearning/lazyLuffLearningDemos";
import type { DemoWalkthroughParentTab } from "@/data/school-demos/walkthrough-placeholder";
import type { DemoTuitionOverride } from "@/data/school-demos/tuition-override";

const DESIGN_WIDTH = 1440;

export default function ScaledParentDemoPreview({
  demoSlug = "athena-microacademy",
  initialParentTab = "enrollment",
  parentEnrollmentVariant,
  billingChildIds,
  tuitionOverride,
  initialCommitteeId,
  initialCommitteeSection,
}: {
  demoSlug?: string;
  initialParentTab?: DemoWalkthroughParentTab;
  parentEnrollmentVariant?: "prototype";
  billingChildIds?: readonly ("emma" | "jake" | "liam")[];
  tuitionOverride?: DemoTuitionOverride | null;
  initialCommitteeId?: string;
  initialCommitteeSection?: "home" | "about" | "resources" | "calendar" | "tasks" | "messages" | "members" | "settings";
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.81);
  const isHiltonHorizons = demoSlug === "hilton-horizons-academy";
  const isZoeLearningHouse = demoSlug === "zoe-learning-house";
  const isMonarchHills = demoSlug === "monarch-hills-education";
  const isWonderingOaks = demoSlug === "wondering-oaks-learning";
  const isWildHeartsAdventure = demoSlug === "wild-hearts-adventure";
  const isNaturesSchoolhouse = demoSlug === "natures-schoolhouse";
  const isTheWoodlandsMicroschool = demoSlug === "the-woodlands-microschool";
  const isWonderHere = demoSlug === "wonderhere-lakeland";
  const isMicahMissionSchool = demoSlug === "micahs-mission-school";
  const isHomeworkHub = demoSlug === "homework-hub";
  const isAscendMicroSchool = demoSlug === "ascend-micro-school";
  const isRootedMeadows = demoSlug === "rooted-meadows";
  const isPrestigeHomeschoolAcademy = demoSlug === "prestige-homeschool-academy";
  const isSpringRiverSchool = demoSlug === "spring-river-school";
  const isArizonaGiftedAcademy = demoSlug === "arizona-gifted-academy";
  const isLighthouseHomeschool = demoSlug === "lighthouse-homeschool";
  const isLuffLearning = demoSlug === "luff-learning";

  useEffect(() => {
    if (isLuffLearning) prefetchLuffLearningParentDemo();
    else if (isLighthouseHomeschool) prefetchLighthouseHomeschoolParentDemo();
    else if (isSpringRiverSchool) prefetchSpringRiverSchoolParentDemo();
    else if (isArizonaGiftedAcademy) prefetchArizonaGiftedAcademyParentDemo();
    else if (isPrestigeHomeschoolAcademy) prefetchPrestigeHomeschoolAcademyParentDemo();
    else if (isRootedMeadows) prefetchRootedMeadowsParentDemo();
    else if (isAscendMicroSchool) prefetchAscendMicroschoolParentDemo();
    else if (isHomeworkHub) prefetchHomeworkHubParentDemo();
    else if (isMicahMissionSchool) prefetchMicahMissionParentDemo();
    else if (isHiltonHorizons) prefetchHiltonHorizonParentDemo();
    else if (isZoeLearningHouse) prefetchZoeLearningHouseParentDemo();
    else if (isMonarchHills) prefetchMonarchHillsParentDemo();
    else if (isWonderingOaks) prefetchWonderingOaksLearningParentDemo();
    else if (isWildHeartsAdventure) prefetchWildHeartsAdventureParentDemo();
    else if (isNaturesSchoolhouse) prefetchNaturesSchoolhouseParentDemo();
    else if (isTheWoodlandsMicroschool) prefetchTheWoodlandsMicroschoolParentDemo();
    else if (isWonderHere) prefetchWonderHereParentDemo();
    else prefetchAthenaParentDemo();
  }, [isLuffLearning, isLighthouseHomeschool, isSpringRiverSchool, isArizonaGiftedAcademy, isPrestigeHomeschoolAcademy, isRootedMeadows, isAscendMicroSchool, isHomeworkHub, isMicahMissionSchool, isHiltonHorizons, isZoeLearningHouse, isMonarchHills, isWonderingOaks, isWildHeartsAdventure, isNaturesSchoolhouse, isTheWoodlandsMicroschool, isWonderHere]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const DemoComponent = isLuffLearning
    ? LazyLuffLearningParentDashboardDemo
    : isLighthouseHomeschool
    ? LazyLighthouseHomeschoolParentDashboardDemo
    : isSpringRiverSchool
    ? LazySpringRiverSchoolParentDashboardDemo
    : isArizonaGiftedAcademy
    ? LazyArizonaGiftedAcademyParentDashboardDemo
    : isPrestigeHomeschoolAcademy
    ? LazyPrestigeHomeschoolAcademyParentDashboardDemo
    : isRootedMeadows
    ? LazyRootedMeadowsParentDashboardDemo
    : isAscendMicroSchool
    ? LazyAscendMicroschoolParentDashboardDemo
    : isHomeworkHub
    ? LazyHomeworkHubParentDashboardDemo
    : isMicahMissionSchool
    ? LazyMicahMissionParentDashboardDemo
    : isHiltonHorizons
    ? LazyHiltonHorizonParentDashboardDemo
    : isZoeLearningHouse
    ? LazyZoeLearningHouseParentDashboardDemo
    : isMonarchHills
      ? LazyMonarchHillsParentDashboardDemo
      : isWonderingOaks
        ? LazyWonderingOaksLearningParentDashboardDemo
      : isWildHeartsAdventure
        ? LazyWildHeartsAdventureParentDashboardDemo
      : isNaturesSchoolhouse
        ? LazyNaturesSchoolhouseParentDashboardDemo
      : isTheWoodlandsMicroschool
        ? LazyTheWoodlandsMicroschoolParentDashboardDemo
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
            initialTab={
              initialParentTab as "home" | "enrollment" | "billing"
            }
            disableTour
            hideNav={false}
            enrollmentVariant={
              isRootedMeadows && parentEnrollmentVariant === "prototype"
                ? "prototype"
                : "default"
            }
            billingChildIds={isRootedMeadows ? billingChildIds : undefined}
            tuitionOverride={isRootedMeadows ? tuitionOverride : undefined}
            initialCommitteeId={isRootedMeadows ? initialCommitteeId : undefined}
            initialCommitteeSection={isRootedMeadows ? initialCommitteeSection : undefined}
          />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
