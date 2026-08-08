"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import type {
  DemoWalkthroughMySchoolTab,
  DemoWalkthroughAdminPage,
  DemoWalkthroughCommitteeSection,
} from "@/data/school-demos/walkthrough-placeholder";
import type { DemoTuitionOverride } from "@/data/school-demos/tuition-override";

const DESIGN_WIDTH = 1440;

type AdminDemoComponent = ComponentType<Record<string, unknown>>;

const ADMIN_DEMO_LOADERS: Record<
  string,
  () => Promise<{ default: AdminDemoComponent }>
> = {
  "austin-micro-school": () =>
    import("@/components/demo/austinmicroschool/lazyAustinMicroSchoolDemos").then(
      (m) => ({ default: m.LazyAustinMicroSchoolAdminDashboardDemo }),
    ),
  "kineo-school": () =>
    import("@/components/demo/kineoschool/lazyKineoSchoolDemos").then((m) => ({
      default: m.LazyKineoSchoolAdminDashboardDemo,
    })),
  "hilton-horizons-academy": () =>
    import("@/components/demo/hiltonhorizon/lazyHiltonHorizonDemos").then((m) => ({
      default: m.LazyHiltonHorizonAdminDashboardDemo,
    })),
  "zoe-learning-house": () =>
    import("@/components/demo/zoelearninghouse/lazyZoeLearningHouseDemos").then(
      (m) => ({ default: m.LazyZoeLearningHouseAdminDashboardDemo }),
    ),
  "monarch-hills-education": () =>
    import("@/components/demo/monarchhills/lazyMonarchHillsDemos").then((m) => ({
      default: m.LazyMonarchHillsAdminDashboardDemo,
    })),
  "wondering-oaks-learning": () =>
    import(
      "@/components/demo/wonderingoakslearning/lazyWonderingOaksLearningDemos"
    ).then((m) => ({ default: m.LazyWonderingOaksLearningAdminDashboardDemo })),
  "wild-hearts-adventure": () =>
    import(
      "@/components/demo/wildheartsadventure/lazyWildHeartsAdventureDemos"
    ).then((m) => ({ default: m.LazyWildHeartsAdventureAdminDashboardDemo })),
  "natures-schoolhouse": () =>
    import(
      "@/components/demo/natureschoolhouse/lazyNaturesSchoolhouseDemos"
    ).then((m) => ({ default: m.LazyNaturesSchoolhouseAdminDashboardDemo })),
  "the-woodlands-microschool": () =>
    import(
      "@/components/demo/thewoodlandsmicroschool/lazyTheWoodlandsMicroschoolDemos"
    ).then((m) => ({
      default: m.LazyTheWoodlandsMicroschoolAdminDashboardDemo,
    })),
  "wonderhere-lakeland": () =>
    import("@/components/demo/wonderhere/lazyWonderHereDemos").then((m) => ({
      default: m.LazyWonderHereAdminDashboardDemo,
    })),
  "micahs-mission-school": () =>
    import("@/components/demo/micahmission/lazyMicahMissionDemos").then((m) => ({
      default: m.LazyMicahMissionAdminDashboardDemo,
    })),
  "homework-hub": () =>
    import("@/components/demo/homeworkhub/lazyHomeworkHubDemos").then((m) => ({
      default: m.LazyHomeworkHubAdminDashboardDemo,
    })),
  "ascend-micro-school": () =>
    import("@/components/demo/ascendmicroschool/lazyAscendMicroschoolDemos").then(
      (m) => ({ default: m.LazyAscendMicroschoolAdminDashboardDemo }),
    ),
  "rooted-meadows": () =>
    import("@/components/demo/rootedmeadows/lazyRootedMeadowsDemos").then((m) => ({
      default: m.LazyRootedMeadowsAdminDashboardDemo,
    })),
  "prestige-homeschool-academy": () =>
    import(
      "@/components/demo/prestigehomeschoolacademy/lazyPrestigeHomeschoolAcademyDemos"
    ).then((m) => ({
      default: m.LazyPrestigeHomeschoolAcademyAdminDashboardDemo,
    })),
  "spring-river-school": () =>
    import("@/components/demo/springriverschool/lazySpringRiverSchoolDemos").then(
      (m) => ({ default: m.LazySpringRiverSchoolAdminDashboardDemo }),
    ),
  "arizona-gifted-academy": () =>
    import(
      "@/components/demo/arizonagiftedacademy/lazyArizonaGiftedAcademyDemos"
    ).then((m) => ({ default: m.LazyArizonaGiftedAcademyAdminDashboardDemo })),
  "lighthouse-homeschool": () =>
    import(
      "@/components/demo/lighthousehomeschool/lazyLighthouseHomeschoolDemos"
    ).then((m) => ({ default: m.LazyLighthouseHomeschoolAdminDashboardDemo })),
  "luff-learning": () =>
    import("@/components/demo/lufflearning/lazyLuffLearningDemos").then((m) => ({
      default: m.LazyLuffLearningAdminDashboardDemo,
    })),
  "paradise-earth-academy": () =>
    import(
      "@/components/demo/paradiseearthacademy/lazyParadiseEarthAcademyDemos"
    ).then((m) => ({ default: m.LazyParadiseEarthAcademyAdminDashboardDemo })),
  "creation-acres": () =>
    import("@/components/demo/creationacres/lazyCreationAcresDemos").then((m) => ({
      default: m.LazyCreationAcresAdminDashboardDemo,
    })),
  "true-north": () =>
    import("@/components/demo/truenorth/lazyTrueNorthDemos").then((m) => ({
      default: m.LazyTrueNorthAdminDashboardDemo,
    })),
  "lab-learning": () =>
    import("@/components/demo/lablearning/lazyLabLearningDemos").then((m) => ({
      default: m.LazyLabLearningAdminDashboardDemo,
    })),
  "one-acre-farm": () =>
    import("@/components/demo/oneacrefarm/lazyOneAcreFarmDemos").then((m) => ({
      default: m.LazyOneAcreFarmAdminDashboardDemo,
    })),
  "athena-microacademy": () =>
    import("@/components/demo/athena/lazyAthenaDemos").then((m) => ({
      default: m.LazyAthenaAdminDashboardDemo,
    })),
};

function loadAdminDemo(slug: string): Promise<{ default: AdminDemoComponent }> {
  const loader = ADMIN_DEMO_LOADERS[slug] ?? ADMIN_DEMO_LOADERS["athena-microacademy"];
  return loader();
}

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
  const [DemoComponent, setDemoComponent] = useState<AdminDemoComponent | null>(
    null,
  );
  const isRootedMeadows = demoSlug === "rooted-meadows";

  useEffect(() => {
    let cancelled = false;
    setDemoComponent(null);
    void loadAdminDemo(demoSlug).then((mod) => {
      if (!cancelled) setDemoComponent(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [demoSlug]);

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
          {DemoComponent ? (
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
          ) : null}
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
