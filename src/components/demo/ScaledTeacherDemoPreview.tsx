"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import type { DemoWalkthroughTeacherTab } from "@/data/school-demos/walkthrough-placeholder";

const DESIGN_WIDTH = 1440;

type DemoComponent = ComponentType<Record<string, unknown>>;

const LOADERS: Record<string, () => Promise<{ default: DemoComponent }>> = {
  "austin-micro-school": () =>
    import("@/components/demo/austinmicroschool/lazyAustinMicroSchoolDemos").then(
      (m) => ({ default: m.LazyAustinMicroSchoolTeacherDashboardDemo }),
    ),
  "kinder-academy-prep-school": () =>
    import(
      "@/components/demo/kinderacademyprep/lazyKinderAcademyPrepSchoolDemos"
    ).then((m) => ({
      default: m.LazyKinderAcademyPrepSchoolTeacherDashboardDemo,
    })),
  "kats-community-microschool": () =>
    import(
      "@/components/demo/katscommunity/lazyKatsCommunityMicroschoolDemos"
    ).then((m) => ({
      default: m.LazyKatsCommunityMicroschoolTeacherDashboardDemo,
    })),
  "kineo-school": () =>
    import("@/components/demo/kineoschool/lazyKineoSchoolDemos").then((m) => ({
      default: m.LazyKineoSchoolTeacherDashboardDemo,
    })),
  "hilton-horizons-academy": () =>
    import("@/components/demo/hiltonhorizon/lazyHiltonHorizonDemos").then((m) => ({
      default: m.LazyHiltonHorizonTeacherDashboardDemo,
    })),
  "zoe-learning-house": () =>
    import("@/components/demo/zoelearninghouse/lazyZoeLearningHouseDemos").then(
      (m) => ({ default: m.LazyZoeLearningHouseTeacherDashboardDemo }),
    ),
  "monarch-hills-education": () =>
    import("@/components/demo/monarchhills/lazyMonarchHillsDemos").then((m) => ({
      default: m.LazyMonarchHillsTeacherDashboardDemo,
    })),
  "wondering-oaks-learning": () =>
    import(
      "@/components/demo/wonderingoakslearning/lazyWonderingOaksLearningDemos"
    ).then((m) => ({ default: m.LazyWonderingOaksLearningTeacherDashboardDemo })),
  "wild-hearts-adventure": () =>
    import(
      "@/components/demo/wildheartsadventure/lazyWildHeartsAdventureDemos"
    ).then((m) => ({ default: m.LazyWildHeartsAdventureTeacherDashboardDemo })),
  "natures-schoolhouse": () =>
    import(
      "@/components/demo/natureschoolhouse/lazyNaturesSchoolhouseDemos"
    ).then((m) => ({ default: m.LazyNaturesSchoolhouseTeacherDashboardDemo })),
  "the-woodlands-microschool": () =>
    import(
      "@/components/demo/thewoodlandsmicroschool/lazyTheWoodlandsMicroschoolDemos"
    ).then((m) => ({
      default: m.LazyTheWoodlandsMicroschoolTeacherDashboardDemo,
    })),
  "wonderhere-lakeland": () =>
    import("@/components/demo/wonderhere/lazyWonderHereDemos").then((m) => ({
      default: m.LazyWonderHereTeacherDashboardDemo,
    })),
  "micahs-mission-school": () =>
    import("@/components/demo/micahmission/lazyMicahMissionDemos").then((m) => ({
      default: m.LazyMicahMissionTeacherDashboardDemo,
    })),
  "homework-hub": () =>
    import("@/components/demo/homeworkhub/lazyHomeworkHubDemos").then((m) => ({
      default: m.LazyHomeworkHubTeacherDashboardDemo,
    })),
  "ascend-micro-school": () =>
    import("@/components/demo/ascendmicroschool/lazyAscendMicroschoolDemos").then(
      (m) => ({ default: m.LazyAscendMicroschoolTeacherDashboardDemo }),
    ),
  "rooted-meadows": () =>
    import("@/components/demo/rootedmeadows/lazyRootedMeadowsDemos").then((m) => ({
      default: m.LazyRootedMeadowsTeacherDashboardDemo,
    })),
  "prestige-homeschool-academy": () =>
    import(
      "@/components/demo/prestigehomeschoolacademy/lazyPrestigeHomeschoolAcademyDemos"
    ).then((m) => ({
      default: m.LazyPrestigeHomeschoolAcademyTeacherDashboardDemo,
    })),
  "spring-river-school": () =>
    import("@/components/demo/springriverschool/lazySpringRiverSchoolDemos").then(
      (m) => ({ default: m.LazySpringRiverSchoolTeacherDashboardDemo }),
    ),
  "arizona-gifted-academy": () =>
    import(
      "@/components/demo/arizonagiftedacademy/lazyArizonaGiftedAcademyDemos"
    ).then((m) => ({ default: m.LazyArizonaGiftedAcademyTeacherDashboardDemo })),
  "lighthouse-homeschool": () =>
    import(
      "@/components/demo/lighthousehomeschool/lazyLighthouseHomeschoolDemos"
    ).then((m) => ({ default: m.LazyLighthouseHomeschoolTeacherDashboardDemo })),
  "luff-learning": () =>
    import("@/components/demo/lufflearning/lazyLuffLearningDemos").then((m) => ({
      default: m.LazyLuffLearningTeacherDashboardDemo,
    })),
  "paradise-earth-academy": () =>
    import(
      "@/components/demo/paradiseearthacademy/lazyParadiseEarthAcademyDemos"
    ).then((m) => ({ default: m.LazyParadiseEarthAcademyTeacherDashboardDemo })),
  "creation-acres": () =>
    import("@/components/demo/creationacres/lazyCreationAcresDemos").then((m) => ({
      default: m.LazyCreationAcresTeacherDashboardDemo,
    })),
  "true-north": () =>
    import("@/components/demo/truenorth/lazyTrueNorthDemos").then((m) => ({
      default: m.LazyTrueNorthTeacherDashboardDemo,
    })),
  "lab-learning": () =>
    import("@/components/demo/lablearning/lazyLabLearningDemos").then((m) => ({
      default: m.LazyLabLearningTeacherDashboardDemo,
    })),
  "one-acre-farm": () =>
    import("@/components/demo/oneacrefarm/lazyOneAcreFarmDemos").then((m) => ({
      default: m.LazyOneAcreFarmTeacherDashboardDemo,
    })),
  "athena-microacademy": () =>
    import("@/components/demo/athena/lazyAthenaDemos").then((m) => ({
      default: m.LazyAthenaTeacherDashboardDemo,
    })),
};

function loadDemo(slug: string) {
  return (LOADERS[slug] ?? LOADERS["athena-microacademy"])();
}

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
  const [loadedDemo, setLoadedDemo] = useState<{
    slug: string;
    Component: DemoComponent;
  } | null>(null);
  const isRootedMeadows = demoSlug === "rooted-meadows";
  const DemoComponent =
    loadedDemo?.slug === demoSlug ? loadedDemo.Component : null;

  useEffect(() => {
    let cancelled = false;
    void loadDemo(demoSlug).then((mod) => {
      if (!cancelled) {
        setLoadedDemo({ slug: demoSlug, Component: mod.default });
      }
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
          {DemoComponent ? (
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
          ) : null}
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
