"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentType } from "react";

const WEBSITE_DEMO_LOADERS: Record<
  string,
  () => Promise<{ default: ComponentType<Record<string, unknown>> }>
> = {
  "arizona-gifted-academy": () =>
    import(
      "@/components/demo/arizonagiftedacademy/ArizonaGiftedAcademyWebsiteDashboardDemo"
    ),
  "asheboro-hybrid-academy": () =>
    import(
      "@/components/demo/asheborohybridacademy/AsheboroHybridAcademyWebsiteDashboardDemo"
    ),
  "acton-academy-pittsburgh": () =>
    import(
      "@/components/demo/actonacademy/ActonAcademyPittsburghWebsiteDashboardDemo"
    ),
  "acton-academy-placer": () =>
    import(
      "@/components/demo/actonacademyplacer/ActonAcademyPlacerWebsiteDashboardDemo"
    ),
  "ascend-micro-school": () =>
    import(
      "@/components/demo/ascendmicroschool/AscendMicroschoolWebsiteDashboardDemo"
    ),
  "athena-microacademy": () =>
    import("@/components/demo/athena/AthenaWebsiteDashboardDemo"),
  "austin-micro-school": () =>
    import(
      "@/components/demo/austinmicroschool/AustinMicroSchoolWebsiteDashboardDemo"
    ),
  "creation-acres": () =>
    import(
      "@/components/demo/creationacres/CreationAcresWebsiteDashboardDemo"
    ),
  "family-lyceum": () =>
    import(
      "@/components/demo/familylyceum/FamilyLyceumWebsiteDashboardDemo"
    ),
  "freedom-prep-academy": () =>
    import(
      "@/components/demo/freedomprep/FreedomPrepAcademyWebsiteDashboardDemo"
    ),
  "gathered-oak-farm": () =>
    import(
      "@/components/demo/gatheredoakfarm/GatheredOakFarmWebsiteDashboardDemo"
    ),
  "hilton-horizons-academy": () =>
    import(
      "@/components/demo/hiltonhorizon/HiltonHorizonWebsiteDashboardDemo"
    ),
  "homework-hub": () =>
    import("@/components/demo/homeworkhub/HomeworkHubWebsiteDashboardDemo"),
  "kats-community-microschool": () =>
    import(
      "@/components/demo/katscommunity/KatsCommunityMicroschoolWebsiteDashboardDemo"
    ),
  "kinder-academy-prep-school": () =>
    import(
      "@/components/demo/kinderacademyprep/KinderAcademyPrepSchoolWebsiteDashboardDemo"
    ),
  "kineo-school": () =>
    import("@/components/demo/kineoschool/KineoSchoolWebsiteDashboardDemo"),
  "lab-learning": () =>
    import("@/components/demo/lablearning/LabLearningWebsiteDashboardDemo"),
  "lighthouse-homeschool": () =>
    import(
      "@/components/demo/lighthousehomeschool/LighthouseHomeschoolWebsiteDashboardDemo"
    ),
  "luff-learning": () =>
    import("@/components/demo/lufflearning/LuffLearningWebsiteDashboardDemo"),
  "micahs-mission-school": () =>
    import("@/components/demo/micahmission/MicahMissionWebsiteDashboardDemo"),
  "monarch-hills-education": () =>
    import("@/components/demo/monarchhills/MonarchHillsWebsiteDashboardDemo"),
  "naples-microschools": () =>
    import(
      "@/components/demo/naplesmicroschool/NaplesMicroschoolsWebsiteDashboardDemo"
    ),
  "natures-schoolhouse": () =>
    import(
      "@/components/demo/natureschoolhouse/NaturesSchoolhouseWebsiteDashboardDemo"
    ),
  "one-acre-farm": () =>
    import("@/components/demo/oneacrefarm/OneAcreFarmWebsiteDashboardDemo"),
  "paradise-earth-academy": () =>
    import(
      "@/components/demo/paradiseearthacademy/ParadiseEarthAcademyWebsiteDashboardDemo"
    ),
  "piedmont-forest-school": () =>
    import(
      "@/components/demo/piedmontforestschool/PiedmontForestSchoolWebsiteDashboardDemo"
    ),
  "little-sprigs-tampa": () =>
    import(
      "@/components/demo/littlesprigstampa/LittleSprigsTampaWebsiteDashboardDemo"
    ),
  "prestige-homeschool-academy": () =>
    import(
      "@/components/demo/prestigehomeschoolacademy/PrestigeHomeschoolAcademyWebsiteDashboardDemo"
    ),
  "rooted-meadows": () =>
    import(
      "@/components/demo/rootedmeadows/RootedMeadowsWebsiteDashboardDemo"
    ),
  "roots-and-wings-microschool": () =>
    import(
      "@/components/demo/rootsandwingsmicroschool/RootsAndWingsMicroschoolWebsiteDashboardDemo"
    ),
  "river-oak-academy": () =>
    import(
      "@/components/demo/riveroakacademy/RiverOakAcademyWebsiteDashboardDemo"
    ),
  "spring-river-school": () =>
    import(
      "@/components/demo/springriverschool/SpringRiverSchoolWebsiteDashboardDemo"
    ),
  "tapestry-academy": () =>
    import(
      "@/components/demo/tapestryacademy/TapestryAcademyWebsiteDashboardDemo"
    ),
  "the-focus-academy": () =>
    import(
      "@/components/demo/thefocusacademy/TheFocusAcademyWebsiteDashboardDemo"
    ),
  "the-woodlands-microschool": () =>
    import(
      "@/components/demo/thewoodlandsmicroschool/TheWoodlandsMicroschoolWebsiteDashboardDemo"
    ),
  "true-north": () =>
    import("@/components/demo/truenorth/TrueNorthWebsiteDashboardDemo"),
  "wild-hearts-adventure": () =>
    import(
      "@/components/demo/wildheartsadventure/WildHeartsAdventureWebsiteDashboardDemo"
    ),
  "wonderhere-lakeland": () =>
    import("@/components/demo/wonderhere/WonderHereWebsiteDashboardDemo"),
  "wondering-oaks-learning": () =>
    import(
      "@/components/demo/wonderingoakslearning/WonderingOaksLearningWebsiteDashboardDemo"
    ),
  "zoe-learning-house": () =>
    import(
      "@/components/demo/zoelearninghouse/ZoeLearningHouseWebsiteDashboardDemo"
    ),
};

export function LazySchoolWebsiteDashboardDemo({
  demoSlug,
  ...props
}: {
  demoSlug: string;
} & Record<string, unknown>) {
  const [Component, setComponent] = useState<ComponentType<
    Record<string, unknown>
  > | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader =
      WEBSITE_DEMO_LOADERS[demoSlug] ??
      WEBSITE_DEMO_LOADERS["athena-microacademy"];
    void loader().then((mod) => {
      if (!cancelled) setComponent(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [demoSlug]);

  if (!Component) return null;
  return <Component {...props} />;
}

export function prefetchSchoolWebsiteDemo(demoSlug: string) {
  const loader =
    WEBSITE_DEMO_LOADERS[demoSlug] ?? WEBSITE_DEMO_LOADERS["athena-microacademy"];
  return loader();
}
