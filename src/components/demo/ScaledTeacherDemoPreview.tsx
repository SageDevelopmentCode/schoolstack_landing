"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import {
  LazyAthenaTeacherDashboardDemo,
  prefetchAthenaTeacherDemo,
} from "@/components/demo/athena/lazyAthenaDemos";
import {
  LazyWonderingOaksLearningTeacherDashboardDemo,
  prefetchWonderingOaksLearningTeacherDemo,
} from "@/components/demo/wonderingoakslearning/lazyWonderingOaksLearningDemos";
import {
  LazyWildHeartsAdventureTeacherDashboardDemo,
  prefetchWildHeartsAdventureTeacherDemo,
} from "@/components/demo/wildheartsadventure/lazyWildHeartsAdventureDemos";
import {
  LazyNaturesSchoolhouseTeacherDashboardDemo,
  prefetchNaturesSchoolhouseTeacherDemo,
} from "@/components/demo/natureschoolhouse/lazyNaturesSchoolhouseDemos";
import {
  LazyTheWoodlandsMicroschoolTeacherDashboardDemo,
  prefetchTheWoodlandsMicroschoolTeacherDemo,
} from "@/components/demo/thewoodlandsmicroschool/lazyTheWoodlandsMicroschoolDemos";
import {
  LazyWonderHereTeacherDashboardDemo,
  prefetchWonderHereTeacherDemo,
} from "@/components/demo/wonderhere/lazyWonderHereDemos";
import {
  LazyMonarchHillsTeacherDashboardDemo,
  prefetchMonarchHillsTeacherDemo,
} from "@/components/demo/monarchhills/lazyMonarchHillsDemos";
import {
  LazyHiltonHorizonTeacherDashboardDemo,
  prefetchHiltonHorizonTeacherDemo,
} from "@/components/demo/hiltonhorizon/lazyHiltonHorizonDemos";
import {
  LazyZoeLearningHouseTeacherDashboardDemo,
  prefetchZoeLearningHouseTeacherDemo,
} from "@/components/demo/zoelearninghouse/lazyZoeLearningHouseDemos";
import {
  LazyMicahMissionTeacherDashboardDemo,
  prefetchMicahMissionTeacherDemo,
} from "@/components/demo/micahmission/lazyMicahMissionDemos";
import {
  LazyHomeworkHubTeacherDashboardDemo,
  prefetchHomeworkHubTeacherDemo,
} from "@/components/demo/homeworkhub/lazyHomeworkHubDemos";
import {
  LazyAscendMicroschoolTeacherDashboardDemo,
  prefetchAscendMicroschoolTeacherDemo,
} from "@/components/demo/ascendmicroschool/lazyAscendMicroschoolDemos";
import {
  LazyRootedMeadowsTeacherDashboardDemo,
  prefetchRootedMeadowsTeacherDemo,
} from "@/components/demo/rootedmeadows/lazyRootedMeadowsDemos";
import {
  LazyPrestigeHomeschoolAcademyTeacherDashboardDemo,
  prefetchPrestigeHomeschoolAcademyTeacherDemo,
} from "@/components/demo/prestigehomeschoolacademy/lazyPrestigeHomeschoolAcademyDemos";
import {
  LazySpringRiverSchoolTeacherDashboardDemo,
  prefetchSpringRiverSchoolTeacherDemo,
} from "@/components/demo/springriverschool/lazySpringRiverSchoolDemos";
import {
  LazyArizonaGiftedAcademyTeacherDashboardDemo,
  prefetchArizonaGiftedAcademyTeacherDemo,
} from "@/components/demo/arizonagiftedacademy/lazyArizonaGiftedAcademyDemos";
import {
  LazyLighthouseHomeschoolTeacherDashboardDemo,
  prefetchLighthouseHomeschoolTeacherDemo,
} from "@/components/demo/lighthousehomeschool/lazyLighthouseHomeschoolDemos";
import {
  LazyLuffLearningTeacherDashboardDemo,
  prefetchLuffLearningTeacherDemo,
} from "@/components/demo/lufflearning/lazyLuffLearningDemos";
import {
  LazyParadiseEarthAcademyTeacherDashboardDemo,
  prefetchParadiseEarthAcademyTeacherDemo,
} from "@/components/demo/paradiseearthacademy/lazyParadiseEarthAcademyDemos";
import {
  LazyCreationAcresTeacherDashboardDemo,
  prefetchCreationAcresTeacherDemo,
} from "@/components/demo/creationacres/lazyCreationAcresDemos";
import type { DemoWalkthroughTeacherTab } from "@/data/school-demos/walkthrough-placeholder";

const DESIGN_WIDTH = 1440;

export default function ScaledTeacherDemoPreview({
  demoSlug = "athena-microacademy",
  initialTeacherTab = "attendance",
  initialSelectedTeacherStudentId,
  openInitialTeacherStudentDetailDelayMs,
}: {
  demoSlug?: string;
  initialTeacherTab?: DemoWalkthroughTeacherTab;
  initialSelectedTeacherStudentId?: string;
  openInitialTeacherStudentDetailDelayMs?: number;
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
  const isParadiseEarthAcademy = demoSlug === "paradise-earth-academy";
  const isCreationAcres = demoSlug === "creation-acres";

  useEffect(() => {
    if (isCreationAcres) prefetchCreationAcresTeacherDemo();
    else if (isParadiseEarthAcademy) prefetchParadiseEarthAcademyTeacherDemo();
    else if (isLuffLearning) prefetchLuffLearningTeacherDemo();
    else if (isLighthouseHomeschool) prefetchLighthouseHomeschoolTeacherDemo();
    else if (isSpringRiverSchool) prefetchSpringRiverSchoolTeacherDemo();
    else if (isArizonaGiftedAcademy) prefetchArizonaGiftedAcademyTeacherDemo();
    else if (isPrestigeHomeschoolAcademy) prefetchPrestigeHomeschoolAcademyTeacherDemo();
    else if (isRootedMeadows) prefetchRootedMeadowsTeacherDemo();
    else if (isAscendMicroSchool) prefetchAscendMicroschoolTeacherDemo();
    else if (isHomeworkHub) prefetchHomeworkHubTeacherDemo();
    else if (isMicahMissionSchool) prefetchMicahMissionTeacherDemo();
    else if (isHiltonHorizons) prefetchHiltonHorizonTeacherDemo();
    else if (isZoeLearningHouse) prefetchZoeLearningHouseTeacherDemo();
    else if (isMonarchHills) prefetchMonarchHillsTeacherDemo();
    else if (isWonderingOaks) prefetchWonderingOaksLearningTeacherDemo();
    else if (isWildHeartsAdventure) prefetchWildHeartsAdventureTeacherDemo();
    else if (isNaturesSchoolhouse) prefetchNaturesSchoolhouseTeacherDemo();
    else if (isTheWoodlandsMicroschool) prefetchTheWoodlandsMicroschoolTeacherDemo();
    else if (isWonderHere) prefetchWonderHereTeacherDemo();
    else prefetchAthenaTeacherDemo();
  }, [isCreationAcres, isParadiseEarthAcademy, isLuffLearning, isLighthouseHomeschool, isSpringRiverSchool, isArizonaGiftedAcademy, isPrestigeHomeschoolAcademy, isRootedMeadows, isAscendMicroSchool, isHomeworkHub, isMicahMissionSchool, isHiltonHorizons, isZoeLearningHouse, isMonarchHills, isWonderingOaks, isWildHeartsAdventure, isNaturesSchoolhouse, isTheWoodlandsMicroschool, isWonderHere]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const DemoComponent = isCreationAcres
    ? LazyCreationAcresTeacherDashboardDemo
    : isParadiseEarthAcademy
    ? LazyParadiseEarthAcademyTeacherDashboardDemo
    : isLuffLearning
    ? LazyLuffLearningTeacherDashboardDemo
    : isLighthouseHomeschool
    ? LazyLighthouseHomeschoolTeacherDashboardDemo
    : isSpringRiverSchool
    ? LazySpringRiverSchoolTeacherDashboardDemo
    : isArizonaGiftedAcademy
    ? LazyArizonaGiftedAcademyTeacherDashboardDemo
    : isPrestigeHomeschoolAcademy
    ? LazyPrestigeHomeschoolAcademyTeacherDashboardDemo
    : isRootedMeadows
    ? LazyRootedMeadowsTeacherDashboardDemo
    : isAscendMicroSchool
    ? LazyAscendMicroschoolTeacherDashboardDemo
    : isHomeworkHub
    ? LazyHomeworkHubTeacherDashboardDemo
    : isMicahMissionSchool
    ? LazyMicahMissionTeacherDashboardDemo
    : isHiltonHorizons
    ? LazyHiltonHorizonTeacherDashboardDemo
    : isZoeLearningHouse
    ? LazyZoeLearningHouseTeacherDashboardDemo
    : isMonarchHills
      ? LazyMonarchHillsTeacherDashboardDemo
      : isWonderingOaks
        ? LazyWonderingOaksLearningTeacherDashboardDemo
      : isWildHeartsAdventure
        ? LazyWildHeartsAdventureTeacherDashboardDemo
      : isNaturesSchoolhouse
        ? LazyNaturesSchoolhouseTeacherDashboardDemo
      : isTheWoodlandsMicroschool
        ? LazyTheWoodlandsMicroschoolTeacherDashboardDemo
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
            {...(isRootedMeadows
              ? {
                  initialSelectedStudentId: initialSelectedTeacherStudentId,
                  openInitialStudentDetailDelayMs:
                    openInitialTeacherStudentDetailDelayMs,
                }
              : {})}
          />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
