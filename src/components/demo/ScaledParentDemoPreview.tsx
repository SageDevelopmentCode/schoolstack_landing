"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import type { DemoTuitionOverride } from "@/data/school-demos/tuition-override";
import type { DemoWalkthroughParentTab } from "@/data/school-demos/walkthrough-placeholder";

const DESIGN_WIDTH = 1440;

type DemoComponent = ComponentType<Record<string, unknown>>;

const LOADERS: Record<string, () => Promise<{ default: DemoComponent }>> = {
  "austin-micro-school": () =>
    import("@/components/demo/austinmicroschool/lazyAustinMicroSchoolDemos").then(
      (m) => ({ default: m.LazyAustinMicroSchoolParentDashboardDemo }),
    ),
  "kineo-school": () =>
    import("@/components/demo/kineoschool/lazyKineoSchoolDemos").then((m) => ({
      default: m.LazyKineoSchoolParentDashboardDemo,
    })),
  "hilton-horizons-academy": () =>
    import("@/components/demo/hiltonhorizon/lazyHiltonHorizonDemos").then((m) => ({
      default: m.LazyHiltonHorizonParentDashboardDemo,
    })),
  "zoe-learning-house": () =>
    import("@/components/demo/zoelearninghouse/lazyZoeLearningHouseDemos").then(
      (m) => ({ default: m.LazyZoeLearningHouseParentDashboardDemo }),
    ),
  "monarch-hills-education": () =>
    import("@/components/demo/monarchhills/lazyMonarchHillsDemos").then((m) => ({
      default: m.LazyMonarchHillsParentDashboardDemo,
    })),
  "wondering-oaks-learning": () =>
    import(
      "@/components/demo/wonderingoakslearning/lazyWonderingOaksLearningDemos"
    ).then((m) => ({ default: m.LazyWonderingOaksLearningParentDashboardDemo })),
  "wild-hearts-adventure": () =>
    import(
      "@/components/demo/wildheartsadventure/lazyWildHeartsAdventureDemos"
    ).then((m) => ({ default: m.LazyWildHeartsAdventureParentDashboardDemo })),
  "natures-schoolhouse": () =>
    import(
      "@/components/demo/natureschoolhouse/lazyNaturesSchoolhouseDemos"
    ).then((m) => ({ default: m.LazyNaturesSchoolhouseParentDashboardDemo })),
  "the-woodlands-microschool": () =>
    import(
      "@/components/demo/thewoodlandsmicroschool/lazyTheWoodlandsMicroschoolDemos"
    ).then((m) => ({
      default: m.LazyTheWoodlandsMicroschoolParentDashboardDemo,
    })),
  "wonderhere-lakeland": () =>
    import("@/components/demo/wonderhere/lazyWonderHereDemos").then((m) => ({
      default: m.LazyWonderHereParentDashboardDemo,
    })),
  "micahs-mission-school": () =>
    import("@/components/demo/micahmission/lazyMicahMissionDemos").then((m) => ({
      default: m.LazyMicahMissionParentDashboardDemo,
    })),
  "homework-hub": () =>
    import("@/components/demo/homeworkhub/lazyHomeworkHubDemos").then((m) => ({
      default: m.LazyHomeworkHubParentDashboardDemo,
    })),
  "ascend-micro-school": () =>
    import("@/components/demo/ascendmicroschool/lazyAscendMicroschoolDemos").then(
      (m) => ({ default: m.LazyAscendMicroschoolParentDashboardDemo }),
    ),
  "rooted-meadows": () =>
    import("@/components/demo/rootedmeadows/lazyRootedMeadowsDemos").then((m) => ({
      default: m.LazyRootedMeadowsParentDashboardDemo,
    })),
  "prestige-homeschool-academy": () =>
    import(
      "@/components/demo/prestigehomeschoolacademy/lazyPrestigeHomeschoolAcademyDemos"
    ).then((m) => ({
      default: m.LazyPrestigeHomeschoolAcademyParentDashboardDemo,
    })),
  "spring-river-school": () =>
    import("@/components/demo/springriverschool/lazySpringRiverSchoolDemos").then(
      (m) => ({ default: m.LazySpringRiverSchoolParentDashboardDemo }),
    ),
  "arizona-gifted-academy": () =>
    import(
      "@/components/demo/arizonagiftedacademy/lazyArizonaGiftedAcademyDemos"
    ).then((m) => ({ default: m.LazyArizonaGiftedAcademyParentDashboardDemo })),
  "lighthouse-homeschool": () =>
    import(
      "@/components/demo/lighthousehomeschool/lazyLighthouseHomeschoolDemos"
    ).then((m) => ({ default: m.LazyLighthouseHomeschoolParentDashboardDemo })),
  "luff-learning": () =>
    import("@/components/demo/lufflearning/lazyLuffLearningDemos").then((m) => ({
      default: m.LazyLuffLearningParentDashboardDemo,
    })),
  "paradise-earth-academy": () =>
    import(
      "@/components/demo/paradiseearthacademy/lazyParadiseEarthAcademyDemos"
    ).then((m) => ({ default: m.LazyParadiseEarthAcademyParentDashboardDemo })),
  "creation-acres": () =>
    import("@/components/demo/creationacres/lazyCreationAcresDemos").then((m) => ({
      default: m.LazyCreationAcresParentDashboardDemo,
    })),
  "true-north": () =>
    import("@/components/demo/truenorth/lazyTrueNorthDemos").then((m) => ({
      default: m.LazyTrueNorthParentDashboardDemo,
    })),
  "lab-learning": () =>
    import("@/components/demo/lablearning/lazyLabLearningDemos").then((m) => ({
      default: m.LazyLabLearningParentDashboardDemo,
    })),
  "one-acre-farm": () =>
    import("@/components/demo/oneacrefarm/lazyOneAcreFarmDemos").then((m) => ({
      default: m.LazyOneAcreFarmParentDashboardDemo,
    })),
  "athena-microacademy": () =>
    import("@/components/demo/athena/lazyAthenaDemos").then((m) => ({
      default: m.LazyAthenaParentDashboardDemo,
    })),
};

function loadDemo(slug: string) {
  return (LOADERS[slug] ?? LOADERS["athena-microacademy"])();
}

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
  initialCommitteeSection?:
    | "home"
    | "about"
    | "resources"
    | "calendar"
    | "tasks"
    | "messages"
    | "members"
    | "settings";
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
          {DemoComponent ? (
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
              initialCommitteeSection={
                isRootedMeadows ? initialCommitteeSection : undefined
              }
            />
          ) : null}
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
