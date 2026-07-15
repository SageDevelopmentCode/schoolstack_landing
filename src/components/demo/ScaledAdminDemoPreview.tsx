"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import {
  LazyAthenaAdminDashboardDemo,
  prefetchAthenaAdminDemo,
} from "@/components/demo/athena/lazyAthenaDemos";
import {
  LazyWonderingOaksLearningAdminDashboardDemo,
  prefetchWonderingOaksLearningAdminDemo,
} from "@/components/demo/wonderingoakslearning/lazyWonderingOaksLearningDemos";
import {
  LazyWildHeartsAdventureAdminDashboardDemo,
  prefetchWildHeartsAdventureAdminDemo,
} from "@/components/demo/wildheartsadventure/lazyWildHeartsAdventureDemos";
import {
  LazyNaturesSchoolhouseAdminDashboardDemo,
  prefetchNaturesSchoolhouseAdminDemo,
} from "@/components/demo/natureschoolhouse/lazyNaturesSchoolhouseDemos";
import {
  LazyTheWoodlandsMicroschoolAdminDashboardDemo,
  prefetchTheWoodlandsMicroschoolAdminDemo,
} from "@/components/demo/thewoodlandsmicroschool/lazyTheWoodlandsMicroschoolDemos";
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
import {
  LazyLighthouseHomeschoolAdminDashboardDemo,
  prefetchLighthouseHomeschoolAdminDemo,
} from "@/components/demo/lighthousehomeschool/lazyLighthouseHomeschoolDemos";
import {
  LazyLuffLearningAdminDashboardDemo,
  prefetchLuffLearningAdminDemo,
} from "@/components/demo/lufflearning/lazyLuffLearningDemos";
import {
  LazyParadiseEarthAcademyAdminDashboardDemo,
  prefetchParadiseEarthAcademyAdminDemo,
} from "@/components/demo/paradiseearthacademy/lazyParadiseEarthAcademyDemos";
import {
  LazyCreationAcresAdminDashboardDemo,
  prefetchCreationAcresAdminDemo,
} from "@/components/demo/creationacres/lazyCreationAcresDemos";

import type {
  DemoWalkthroughMySchoolTab,
  DemoWalkthroughAdminPage,
  DemoWalkthroughCommitteeSection,
} from "@/data/school-demos/walkthrough-placeholder";
import type { DemoTuitionOverride } from "@/data/school-demos/tuition-override";

const DESIGN_WIDTH = 1440;

export default function ScaledAdminDemoPreview({
  demoSlug = "athena-microacademy",
  initialAdmissionsTab = "submissions",
  initialSelectedLeadId,
  initialSelectedLeadStatus,
  initialSelectedLeadApplicationSectionIndex,
  initialSelectedFlowId,
  animateNewSubmission,
  autoSendEnrollmentLink,
  autoSendEnrollmentLinkDelayMs,
  openInitialLeadDetail,
  hideLeadDetailEnrollmentAction,
  highlightSendEnrollmentLeadId,
  initialAdminPage,
  initialMySchoolTab,
  initialSelectedTuitionFamilyId,
  openInitialTuitionAdjustModal,
  openInitialTuitionAdjustModalDelayMs,
  tuitionOverride,
  onTuitionOverrideApplied,
  initialCommitteeId,
  initialCommitteeAdminView,
  initialCommitteeSection,
  openCreateCommitteeModal,
  openCreateCommitteeModalDelayMs,
  highlightCreateWorkspace,
  openSendAugustSignupModal,
  openSendAugustSignupModalDelayMs,
  openArchiveCommitteeModal,
}: {
  demoSlug?: string;
  initialAdmissionsTab?: "flows" | "submissions";
  initialSelectedLeadId?: string;
  initialSelectedLeadStatus?: string;
  initialSelectedLeadApplicationSectionIndex?: number;
  initialSelectedFlowId?: string;
  animateNewSubmission?: boolean;
  autoSendEnrollmentLink?: boolean;
  autoSendEnrollmentLinkDelayMs?: number;
  openInitialLeadDetail?: boolean;
  hideLeadDetailEnrollmentAction?: boolean;
  highlightSendEnrollmentLeadId?: string;
  initialAdminPage?: DemoWalkthroughAdminPage;
  initialMySchoolTab?: DemoWalkthroughMySchoolTab;
  initialSelectedTuitionFamilyId?: string;
  openInitialTuitionAdjustModal?: boolean;
  openInitialTuitionAdjustModalDelayMs?: number;
  tuitionOverride?: DemoTuitionOverride | null;
  onTuitionOverrideApplied?: (override: DemoTuitionOverride | null) => void;
  initialCommitteeId?: string;
  initialCommitteeAdminView?: "list" | "detail" | "signup" | "archive";
  initialCommitteeSection?: DemoWalkthroughCommitteeSection;
  openCreateCommitteeModal?: boolean;
  openCreateCommitteeModalDelayMs?: number;
  highlightCreateWorkspace?: boolean;
  openSendAugustSignupModal?: boolean;
  openSendAugustSignupModalDelayMs?: number;
  openArchiveCommitteeModal?: boolean;
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
    if (isCreationAcres) prefetchCreationAcresAdminDemo();
    else if (isParadiseEarthAcademy) prefetchParadiseEarthAcademyAdminDemo();
    else if (isLuffLearning) prefetchLuffLearningAdminDemo();
    else if (isLighthouseHomeschool) prefetchLighthouseHomeschoolAdminDemo();
    else if (isSpringRiverSchool) prefetchSpringRiverSchoolAdminDemo();
    else if (isArizonaGiftedAcademy) prefetchArizonaGiftedAcademyAdminDemo();
    else if (isPrestigeHomeschoolAcademy) prefetchPrestigeHomeschoolAcademyAdminDemo();
    else if (isRootedMeadows) prefetchRootedMeadowsAdminDemo();
    else if (isAscendMicroSchool) prefetchAscendMicroschoolAdminDemo();
    else if (isHomeworkHub) prefetchHomeworkHubAdminDemo();
    else if (isMicahMissionSchool) prefetchMicahMissionAdminDemo();
    else if (isHiltonHorizons) prefetchHiltonHorizonAdminDemo();
    else if (isZoeLearningHouse) prefetchZoeLearningHouseAdminDemo();
    else if (isMonarchHills) prefetchMonarchHillsAdminDemo();
    else if (isWonderingOaks) prefetchWonderingOaksLearningAdminDemo();
    else if (isWildHeartsAdventure) prefetchWildHeartsAdventureAdminDemo();
    else if (isNaturesSchoolhouse) prefetchNaturesSchoolhouseAdminDemo();
    else if (isTheWoodlandsMicroschool) prefetchTheWoodlandsMicroschoolAdminDemo();
    else if (isWonderHere) prefetchWonderHereAdminDemo();
    else prefetchAthenaAdminDemo();
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
    ? LazyCreationAcresAdminDashboardDemo
    : isParadiseEarthAcademy
    ? LazyParadiseEarthAcademyAdminDashboardDemo
    : isLuffLearning
    ? LazyLuffLearningAdminDashboardDemo
    : isLighthouseHomeschool
    ? LazyLighthouseHomeschoolAdminDashboardDemo
    : isSpringRiverSchool
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
      : isWonderingOaks
        ? LazyWonderingOaksLearningAdminDashboardDemo
      : isWildHeartsAdventure
        ? LazyWildHeartsAdventureAdminDashboardDemo
      : isNaturesSchoolhouse
        ? LazyNaturesSchoolhouseAdminDashboardDemo
      : isTheWoodlandsMicroschool
        ? LazyTheWoodlandsMicroschoolAdminDashboardDemo
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
            initialPage={
              (initialAdminPage ?? "leads") as
                | "dashboard"
                | "leads"
                | "myschool"
                | "budget"
                | "marketing"
                | "impersonate"
            }
            initialAdmissionsTab={initialAdmissionsTab}
            initialSelectedLeadId={initialSelectedLeadId}
            initialSelectedLeadStatus={initialSelectedLeadStatus}
            initialSelectedLeadApplicationSectionIndex={
              initialSelectedLeadApplicationSectionIndex
            }
            initialSelectedFlowId={initialSelectedFlowId}
            animateNewSubmission={animateNewSubmission}
            autoSendEnrollmentLink={autoSendEnrollmentLink}
            autoSendEnrollmentLinkDelayMs={autoSendEnrollmentLinkDelayMs}
            openInitialLeadDetail={openInitialLeadDetail}
            hideLeadDetailEnrollmentAction={hideLeadDetailEnrollmentAction}
            highlightSendEnrollmentLeadId={highlightSendEnrollmentLeadId}
            {...(isRootedMeadows
              ? {
                  initialMySchoolTab,
                  initialSelectedTuitionFamilyId,
                  openInitialTuitionAdjustModal,
                  openInitialTuitionAdjustModalDelayMs,
                  tuitionOverride,
                  onTuitionOverrideApplied,
                  initialCommitteeId,
                  initialCommitteeAdminView,
                  initialCommitteeSection,
                  openCreateCommitteeModal,
                  openCreateCommitteeModalDelayMs,
                  highlightCreateWorkspace,
                  openSendAugustSignupModal,
                  openSendAugustSignupModalDelayMs,
                  openArchiveCommitteeModal,
                }
              : {})}
          />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
