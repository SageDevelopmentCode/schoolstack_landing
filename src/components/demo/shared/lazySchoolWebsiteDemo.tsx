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
  "inspired-learning-academy": () =>
    import(
      "@/components/demo/inspiredlearning/InspiredLearningWebsiteDashboardDemo"
    ),
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
  "brazos-valley-honor-academy": () =>
    import(
      "@/components/demo/brazosvalleyhonoracademy/BrazosValleyHonorAcademyWebsiteDashboardDemo"
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
  "wildcat-microschool": () =>
    import(
      "@/components/demo/wildcatmicroschool/WildcatMicroschoolWebsiteDashboardDemo"
    ),
  "meadows-bee-farm": () =>
    import(
      "@/components/demo/meadowsbeefarm/MeadowsBeeFarmWebsiteDashboardDemo"
    ),
  "heartsong-cottage-school": () =>
    import(
      "@/components/demo/heartsongcottageschool/HeartsongCottageSchoolWebsiteDashboardDemo"
    ),
  "honeycomb-cottage-school": () =>
    import(
      "@/components/demo/honeycombcottageschool/HoneycombCottageSchoolWebsiteDashboardDemo"
    ),
  "madrona-school": () =>
    import(
      "@/components/demo/madronaschool/MadronaSchoolWebsiteDashboardDemo"
    ),
  "morgan-prep-academy": () =>
    import(
      "@/components/demo/morganprepacademy/MorganPrepAcademyWebsiteDashboardDemo"
    ),
  "gifted-collective-microschool": () =>
    import(
      "@/components/demo/giftedcollectivemicroschool/GiftedCollectiveMicroschoolWebsiteDashboardDemo"
    ),
  "foothill-christian-academy": () =>
    import(
      "@/components/demo/foothillchristianacademy/FoothillChristianAcademyWebsiteDashboardDemo"
    ),
  "exodus-academy": () =>
    import(
      "@/components/demo/exodusacademy/ExodusAcademyWebsiteDashboardDemo"
    ),
  "elite-performance-prep-freeport": () =>
    import(
      "@/components/demo/eliteperformanceprepfreeport/ElitePerformancePrepFreeportWebsiteDashboardDemo"
    ),
  "desert-sun-ranch-academy": () =>
    import(
      "@/components/demo/desertsunranchacademy/DesertSunRanchAcademyWebsiteDashboardDemo"
    ),
  "desert-dragon-school": () =>
    import(
      "@/components/demo/desertdragonschool/DesertDragonSchoolWebsiteDashboardDemo"
    ),
  "choice-acton-academy": () =>
    import(
      "@/components/demo/choiceactonacademy/ChoiceActonAcademyWebsiteDashboardDemo"
    ),
  "bright-minds-future-leaders": () =>
    import(
      "@/components/demo/brightmindsfutureleaders/BrightMindsFutureLeadersWebsiteDashboardDemo"
    ),
  "bmf-microschools": () =>
    import(
      "@/components/demo/bmfmicroschools/BmfMicroschoolsWebsiteDashboardDemo"
    ),
  "blue-horizon-studio": () =>
    import(
      "@/components/demo/bluehorizonstudio/BlueHorizonStudioWebsiteDashboardDemo"
    ),
  "apogee-la-microschool": () =>
    import(
      "@/components/demo/apogeelamicroschool/ApogeeLaMicroschoolWebsiteDashboardDemo"
    ),
  "ahb-community-school": () =>
    import(
      "@/components/demo/ahbcommunityschool/AhbCommunitySchoolWebsiteDashboardDemo"
    ),
  "adelphia-classical-christian-academy": () =>
    import(
      "@/components/demo/adelphiaclassicalchristianacademy/AdelphiaClassicalChristianAcademyWebsiteDashboardDemo"
    ),
  "a-mind-of-magic-and-reason": () =>
    import(
      "@/components/demo/amindofmagicandreason/AMindOfMagicAndReasonWebsiteDashboardDemo"
    ),
  "book-hooks-schoolhouse": () =>
    import(
      "@/components/demo/bookhooksschoolhouse/BookHooksSchoolhouseWebsiteDashboardDemo"
    ),
  "spyrja-academy-new-braunfels": () =>
    import(
      "@/components/demo/spyrjaacademynewbraunfels/SpyrjaAcademyNewBraunfelsWebsiteDashboardDemo"
    ),
  "south-oc-hybrid-homeschool": () =>
    import(
      "@/components/demo/southochybridhomeschool/SouthOcHybridHomeschoolWebsiteDashboardDemo"
    ),
  "praxis-elite-sports-academy": () =>
    import(
      "@/components/demo/praxiselitesportsacademy/PraxisEliteSportsAcademyWebsiteDashboardDemo"
    ),
  "mirus-academy": () =>
    import(
      "@/components/demo/mirusacademy/MirusAcademyWebsiteDashboardDemo"
    ),
  "mcp-academy": () =>
    import(
      "@/components/demo/mcpacademy/McpAcademyWebsiteDashboardDemo"
    ),
  "journey-academy": () =>
    import(
      "@/components/demo/journeyacademy/JourneyAcademyWebsiteDashboardDemo"
    ),
  "innovation-academy-las-vegas": () =>
    import(
      "@/components/demo/innovationacademylv/InnovationAcademyLasVegasWebsiteDashboardDemo"
    ),
  "inner-fire-academy": () =>
    import(
      "@/components/demo/innerfireacademy/InnerFireAcademyWebsiteDashboardDemo"
    ),
  "the-wild-school": () =>
    import(
      "@/components/demo/thewildschool/TheWildSchoolWebsiteDashboardDemo"
    ),
  "esteam-academy-round-rock": () =>
    import(
      "@/components/demo/esteamacademy/EsteamAcademyRoundRockWebsiteDashboardDemo"
    ),
  "ignite-microschool": () =>
    import(
      "@/components/demo/ignitemicroschool/IgniteMicroschoolWebsiteDashboardDemo"
    ),
  "garden-school-marietta": () =>
    import(
      "@/components/demo/gardenschoolmarietta/GardenSchoolMariettaWebsiteDashboardDemo"
    ),
  "peninsular-prep": () =>
    import(
      "@/components/demo/peninsularprep/PeninsularPrepWebsiteDashboardDemo"
    ),
  "steps-learning-center": () =>
    import(
      "@/components/demo/stepslearningcenter/StepsLearningCenterWebsiteDashboardDemo"
    ),
  "sage-montessori-nashville": () =>
    import(
      "@/components/demo/sagemontessorinashville/SageMontessoriNashvilleWebsiteDashboardDemo"
    ),
  "renewed-roots-forest-school": () =>
    import(
      "@/components/demo/renewedroots/RenewedRootsForestSchoolWebsiteDashboardDemo"
    ),
  "prestige-wisdom-academy": () =>
    import(
      "@/components/demo/prestigewisdomacademy/PrestigeWisdomAcademyWebsiteDashboardDemo"
    ),
  "invictus-leander": () =>
    import(
      "@/components/demo/invictusleander/InvictusLeanderWebsiteDashboardDemo"
    ),
  "gods-little-people-learning-academy": () =>
    import(
      "@/components/demo/godslittlepeople/GodsLittlePeopleLearningAcademyWebsiteDashboardDemo"
    ),
  "everroot-academy": () =>
    import(
      "@/components/demo/everrootacademy/EverrootAcademyWebsiteDashboardDemo"
    ),
  "down-to-earth-homeschool": () =>
    import(
      "@/components/demo/downtoearthhomeschool/DownToEarthHomeschoolWebsiteDashboardDemo"
    ),
  "coys-camps-and-classes": () =>
    import(
      "@/components/demo/coyscampsandclasses/CoysCampsAndClassesWebsiteDashboardDemo"
    ),
  "coastal-sage-montessori": () =>
    import(
      "@/components/demo/coastalsagemontessori/CoastalSageMontessoriWebsiteDashboardDemo"
    ),
  "beacon-of-hope-academy": () =>
    import(
      "@/components/demo/beaconofhopeacademy/BeaconOfHopeAcademyWebsiteDashboardDemo"
    ),
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
