/**
 * Every school website demo served at /demo/<slug>, by URL slug.
 *
 * One dynamic route (src/app/demo/[slug]) renders all of these. Do not add a
 * route folder per school: 87 near-identical routes, each pulling in every
 * school's lazy demo chunks, made the production build run out of memory.
 * To add a demo, import its website config and walkthrough here and add an entry.
 *
 * Server-side only: the page passes one entry's data to the client shell.
 */
import type { SchoolWebsiteDemoConfig } from "./types";
import type { DemoWalkthroughStep } from "./walkthroughs/shared";

import { aMindOfMagicAndReasonConfig } from "@/data/school-demos/a-mind-of-magic-and-reason";
import { aMindOfMagicAndReasonWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/a-mind-of-magic-and-reason";
import { actonAcademyPittsburghConfig } from "@/data/school-demos/acton-academy-pittsburgh";
import { actonAcademyPittsburghWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/acton-academy-pittsburgh";
import { actonAcademyPlacerConfig } from "@/data/school-demos/acton-academy-placer";
import { actonAcademyPlacerWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/acton-academy-placer";
import { adelphiaClassicalChristianAcademyConfig } from "@/data/school-demos/adelphia-classical-christian-academy";
import { adelphiaClassicalChristianAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/adelphia-classical-christian-academy";
import { ahbCommunitySchoolConfig } from "@/data/school-demos/ahb-community-school";
import { ahbCommunitySchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/ahb-community-school";
import { apogeeLaMicroschoolConfig } from "@/data/school-demos/apogee-la-microschool";
import { apogeeLaMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/apogee-la-microschool";
import { arizonaGiftedAcademyConfig } from "@/data/school-demos/arizona-gifted-academy";
import { arizonaGiftedAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/arizona-gifted-academy";
import { ascendMicroSchoolConfig } from "@/data/school-demos/ascend-micro-school";
import { ascendMicroSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/ascend-micro-school";
import { asheboroHybridAcademyConfig } from "@/data/school-demos/asheboro-hybrid-academy";
import { asheboroHybridAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/asheboro-hybrid-academy";
import { athenaMicroacademyConfig } from "@/data/school-demos/athena-microacademy";
import { athenaWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/athena";
import { austinMicroSchoolConfig } from "@/data/school-demos/austin-micro-school";
import { austinMicroSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/austin-micro-school";
import { beaconOfHopeAcademyConfig } from "@/data/school-demos/beacon-of-hope-academy";
import { beaconOfHopeAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/beacon-of-hope-academy";
import { blueHorizonStudioConfig } from "@/data/school-demos/blue-horizon-studio";
import { blueHorizonStudioWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/blue-horizon-studio";
import { bmfMicroschoolsConfig } from "@/data/school-demos/bmf-microschools";
import { bmfMicroschoolsWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/bmf-microschools";
import { bookHooksSchoolhouseConfig } from "@/data/school-demos/book-hooks-schoolhouse";
import { bookHooksSchoolhouseWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/book-hooks-schoolhouse";
import { brazosValleyHonorAcademyConfig } from "@/data/school-demos/brazos-valley-honor-academy";
import { brazosValleyHonorAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/brazos-valley-honor-academy";
import { brightMindsFutureLeadersConfig } from "@/data/school-demos/bright-minds-future-leaders";
import { brightMindsFutureLeadersWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/bright-minds-future-leaders";
import { choiceActonAcademyConfig } from "@/data/school-demos/choice-acton-academy";
import { choiceActonAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/choice-acton-academy";
import { coastalSageMontessoriConfig } from "@/data/school-demos/coastal-sage-montessori";
import { coastalSageMontessoriWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/coastal-sage-montessori";
import { coysCampsAndClassesConfig } from "@/data/school-demos/coys-camps-and-classes";
import { coysCampsAndClassesWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/coys-camps-and-classes";
import { creationAcresConfig } from "@/data/school-demos/creation-acres";
import { creationAcresWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/creation-acres";
import { desertDragonSchoolConfig } from "@/data/school-demos/desert-dragon-school";
import { desertDragonSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/desert-dragon-school";
import { desertSunRanchAcademyConfig } from "@/data/school-demos/desert-sun-ranch-academy";
import { desertSunRanchAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/desert-sun-ranch-academy";
import { downToEarthHomeschoolConfig } from "@/data/school-demos/down-to-earth-homeschool";
import { downToEarthHomeschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/down-to-earth-homeschool";
import { elitePerformancePrepFreeportConfig } from "@/data/school-demos/elite-performance-prep-freeport";
import { elitePerformancePrepFreeportWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/elite-performance-prep-freeport";
import { esteamAcademyRoundRockConfig } from "@/data/school-demos/esteam-academy-round-rock";
import { esteamAcademyRoundRockWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/esteam-academy-round-rock";
import { everrootAcademyConfig } from "@/data/school-demos/everroot-academy";
import { everrootAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/everroot-academy";
import { exodusAcademyConfig } from "@/data/school-demos/exodus-academy";
import { exodusAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/exodus-academy";
import { familyLyceumConfig } from "@/data/school-demos/family-lyceum";
import { familyLyceumWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/family-lyceum";
import { foothillChristianAcademyConfig } from "@/data/school-demos/foothill-christian-academy";
import { foothillChristianAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/foothill-christian-academy";
import { freedomPrepAcademyConfig } from "@/data/school-demos/freedom-prep-academy";
import { freedomPrepAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/freedom-prep-academy";
import { gardenSchoolMariettaConfig } from "@/data/school-demos/garden-school-marietta";
import { gardenSchoolMariettaWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/garden-school-marietta";
import { gatheredOakFarmConfig } from "@/data/school-demos/gathered-oak-farm";
import { gatheredOakFarmWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/gathered-oak-farm";
import { giftedCollectiveMicroschoolConfig } from "@/data/school-demos/gifted-collective-microschool";
import { giftedCollectiveMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/gifted-collective-microschool";
import { godsLittlePeopleLearningAcademyConfig } from "@/data/school-demos/gods-little-people-learning-academy";
import { godsLittlePeopleLearningAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/gods-little-people-learning-academy";
import { heartsongCottageSchoolConfig } from "@/data/school-demos/heartsong-cottage-school";
import { heartsongCottageSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/heartsong-cottage-school";
import { hiltonHorizonsAcademyConfig } from "@/data/school-demos/hilton-horizons-academy";
import { hiltonHorizonsAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/hilton-horizons-academy";
import { homeworkHubConfig } from "@/data/school-demos/homework-hub";
import { homeworkHubWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/homework-hub";
import { honeycombCottageSchoolConfig } from "@/data/school-demos/honeycomb-cottage-school";
import { honeycombCottageSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/honeycomb-cottage-school";
import { igniteMicroschoolConfig } from "@/data/school-demos/ignite-microschool";
import { igniteMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/ignite-microschool";
import { innerFireAcademyConfig } from "@/data/school-demos/inner-fire-academy";
import { innerFireAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/inner-fire-academy";
import { innovationAcademyLasVegasConfig } from "@/data/school-demos/innovation-academy-las-vegas";
import { innovationAcademyLasVegasWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/innovation-academy-las-vegas";
import { inspiredLearningConfig } from "@/data/school-demos/inspired-learning-academy";
import { inspiredLearningWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/inspired-learning";
import { invictusLeanderConfig } from "@/data/school-demos/invictus-leander";
import { invictusLeanderWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/invictus-leander";
import { journeyAcademyConfig } from "@/data/school-demos/journey-academy";
import { journeyAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/journey-academy";
import { katsCommunityMicroschoolConfig } from "@/data/school-demos/kats-community-microschool";
import { katsCommunityMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/kats-community-microschool";
import { kinderAcademyPrepSchoolConfig } from "@/data/school-demos/kinder-academy-prep-school";
import { kinderAcademyPrepSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/kinder-academy-prep-school";
import { kineoSchoolConfig } from "@/data/school-demos/kineo-school";
import { kineoSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/kineo-school";
import { labLearningConfig } from "@/data/school-demos/lab-learning";
import { labLearningWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/lab-learning";
import { lighthouseHomeschoolConfig } from "@/data/school-demos/lighthouse-homeschool";
import { lighthouseHomeschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/lighthouse-homeschool";
import { littleSprigsTampaConfig } from "@/data/school-demos/little-sprigs-tampa";
import { littleSprigsTampaWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/little-sprigs-tampa";
import { luffLearningConfig } from "@/data/school-demos/luff-learning";
import { luffLearningWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/luff-learning";
import { madronaSchoolConfig } from "@/data/school-demos/madrona-school";
import { madronaSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/madrona-school";
import { mcpAcademyConfig } from "@/data/school-demos/mcp-academy";
import { mcpAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/mcp-academy";
import { meadowsBeeFarmConfig } from "@/data/school-demos/meadows-bee-farm";
import { meadowsBeeFarmWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/meadows-bee-farm";
import { micahsMissionSchoolConfig } from "@/data/school-demos/micahs-mission-school";
import { micahMissionWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/micah-mission";
import { mirusAcademyConfig } from "@/data/school-demos/mirus-academy";
import { mirusAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/mirus-academy";
import { monarchHillsEducationConfig } from "@/data/school-demos/monarch-hills-education";
import { monarchHillsWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/monarch-hills";
import { morganPrepAcademyConfig } from "@/data/school-demos/morgan-prep-academy";
import { morganPrepAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/morgan-prep-academy";
import { naplesMicroschoolsConfig } from "@/data/school-demos/naples-microschools";
import { naplesMicroschoolsWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/naples-microschools";
import { naturesSchoolhouseConfig } from "@/data/school-demos/natures-schoolhouse";
import { naturesSchoolhouseWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/natures-schoolhouse";
import { oneAcreFarmConfig } from "@/data/school-demos/one-acre-farm";
import { oneAcreFarmWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/one-acre-farm";
import { paradiseEarthAcademyConfig } from "@/data/school-demos/paradise-earth-academy";
import { paradiseEarthAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/paradise-earth-academy";
import { peninsularPrepConfig } from "@/data/school-demos/peninsular-prep";
import { peninsularPrepWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/peninsular-prep";
import { piedmontForestSchoolConfig } from "@/data/school-demos/piedmont-forest-school";
import { piedmontForestSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/piedmont-forest-school";
import { praxisEliteSportsAcademyConfig } from "@/data/school-demos/praxis-elite-sports-academy";
import { praxisEliteSportsAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/praxis-elite-sports-academy";
import { prestigeHomeschoolAcademyConfig } from "@/data/school-demos/prestige-homeschool-academy";
import { prestigeHomeschoolAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/prestige-homeschool-academy";
import { prestigeWisdomAcademyConfig } from "@/data/school-demos/prestige-wisdom-academy";
import { prestigeWisdomAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/prestige-wisdom-academy";
import { renewedRootsForestSchoolConfig } from "@/data/school-demos/renewed-roots-forest-school";
import { renewedRootsForestSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/renewed-roots-forest-school";
import { riverOakAcademyConfig } from "@/data/school-demos/river-oak-academy";
import { riverOakAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/river-oak-academy";
import { rootedMeadowsConfig } from "@/data/school-demos/rooted-meadows";
import { rootedMeadowsWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/rooted-meadows";
import { rootsAndWingsMicroschoolConfig } from "@/data/school-demos/roots-and-wings-microschool";
import { rootsAndWingsMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/roots-and-wings-microschool";
import { sageMontessoriNashvilleConfig } from "@/data/school-demos/sage-montessori-nashville";
import { sageMontessoriNashvilleWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/sage-montessori-nashville";
import { southOcHybridHomeschoolConfig } from "@/data/school-demos/south-oc-hybrid-homeschool";
import { southOcHybridHomeschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/south-oc-hybrid-homeschool";
import { springRiverSchoolConfig } from "@/data/school-demos/spring-river-school";
import { springRiverSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/spring-river-school";
import { spyrjaAcademyNewBraunfelsConfig } from "@/data/school-demos/spyrja-academy-new-braunfels";
import { spyrjaAcademyNewBraunfelsWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/spyrja-academy-new-braunfels";
import { stepsLearningCenterConfig } from "@/data/school-demos/steps-learning-center";
import { stepsLearningCenterWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/steps-learning-center";
import { tapestryAcademyConfig } from "@/data/school-demos/tapestry-academy";
import { tapestryAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/tapestry-academy";
import { theFocusAcademyConfig } from "@/data/school-demos/the-focus-academy";
import { theFocusAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/the-focus-academy";
import { theWildSchoolConfig } from "@/data/school-demos/the-wild-school";
import { theWildSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/the-wild-school";
import { theWoodlandsMicroschoolConfig } from "@/data/school-demos/the-woodlands-microschool";
import { theWoodlandsMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/the-woodlands-microschool";
import { trueNorthConfig } from "@/data/school-demos/true-north";
import { trueNorthWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/true-north";
import { wildHeartsAdventureConfig } from "@/data/school-demos/wild-hearts-adventure";
import { wildHeartsWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/wild-hearts";
import { wildcatMicroschoolConfig } from "@/data/school-demos/wildcat-microschool";
import { wildcatMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/wildcat-microschool";
import { wonderhereLakelandConfig } from "@/data/school-demos/wonderhere-lakeland";
import { wonderhereWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/wonderhere";
import { wonderingOaksLearningConfig } from "@/data/school-demos/wondering-oaks-learning";
import { wonderingOaksWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/wondering-oaks";
import { zoeLearningHouseConfig } from "@/data/school-demos/zoe-learning-house";
import { zoeLearningHouseWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/zoe-learning-house";

export type DemoRoute = {
  schoolName: string;
  title: string;
  description: string;
  config: SchoolWebsiteDemoConfig;
  steps: DemoWalkthroughStep[];
};

export const DEMO_ROUTES: Record<string, DemoRoute> = {
  "a-mind-of-magic-and-reason": {
    schoolName: "A Mind of Magic and Reason",
    title: "A Mind of Magic and Reason Website Demo",
    description:
      "A private website redesign concept for A Mind of Magic and Reason Learning Center, a secular K–8 microschool in Tucson, Arizona.",
    config: aMindOfMagicAndReasonConfig,
    steps: aMindOfMagicAndReasonWalkthroughPlaceholder,
  },
  "acton-academy-pittsburgh": {
    schoolName: "Acton Academy Pittsburgh",
    title: "Acton Academy Pittsburgh Website Demo",
    description:
      "A concept admissions landing page for Acton Academy Pittsburgh — a learner-driven private school in Wexford, Pennsylvania.",
    config: actonAcademyPittsburghConfig,
    steps: actonAcademyPittsburghWalkthroughPlaceholder,
  },
  "acton-academy-placer": {
    schoolName: "Acton Academy Placer",
    title: "Acton Academy Placer Website Demo",
    description:
      "A concept admissions landing page for Acton Academy Placer — a learner-driven school in the Sacramento–Placer region with campuses in Roseville, Sacramento, and Rocklin.",
    config: actonAcademyPlacerConfig,
    steps: actonAcademyPlacerWalkthroughPlaceholder,
  },
  "adelphia-classical-christian-academy": {
    schoolName: "Adelphia Classical Christian Academy",
    title: "Adelphia Classical Christian Academy Website Demo",
    description:
      "A private website redesign concept for Adelphia Classical Christian Academy, a K–12 classical Christian PSP in Orange, California.",
    config: adelphiaClassicalChristianAcademyConfig,
    steps: adelphiaClassicalChristianAcademyWalkthroughPlaceholder,
  },
  "ahb-community-school": {
    schoolName: "AHB Community School",
    title: "AHB Community School Website Demo",
    description:
      "A private website redesign concept for AHB Community School, a project-based K–8 micro school in Austin, Texas.",
    config: ahbCommunitySchoolConfig,
    steps: ahbCommunitySchoolWalkthroughPlaceholder,
  },
  "apogee-la-microschool": {
    schoolName: "Apogee LA",
    title: "Apogee LA Website Demo",
    description:
      "A private website redesign concept for Apogee LA, a faith-based K–12 learning center in Chatsworth, Los Angeles.",
    config: apogeeLaMicroschoolConfig,
    steps: apogeeLaMicroschoolWalkthroughPlaceholder,
  },
  "arizona-gifted-academy": {
    schoolName: "Arizona Gifted Academy",
    title: "Arizona Gifted Academy Website Demo",
    description:
      "A concept admissions landing page for Arizona Gifted Academy — a boutique gifted microschool in Scottsdale, Arizona for PK–5 learners.",
    config: arizonaGiftedAcademyConfig,
    steps: arizonaGiftedAcademyWalkthroughPlaceholder,
  },
  "ascend-micro-school": {
    schoolName: "Ascend Micro School",
    title: "Ascend Micro School Website Demo",
    description:
      "A concept admissions landing page for Ascend Micro School — a faith-based K–8 hybrid microschool in Northern Colorado Springs.",
    config: ascendMicroSchoolConfig,
    steps: ascendMicroSchoolWalkthroughPlaceholder,
  },
  "asheboro-hybrid-academy": {
    schoolName: "Asheboro Hybrid Academy",
    title: "Asheboro Hybrid Academy | Christian Hybrid School in Asheboro, NC",
    description:
      "Asheboro Hybrid Academy blends the joy of homeschooling with the structure of a traditional classroom. Explore elementary, middle, and high school hybrid learning in Asheboro, NC.",
    config: asheboroHybridAcademyConfig,
    steps: asheboroHybridAcademyWalkthroughPlaceholder,
  },
  "athena-microacademy": {
    schoolName: "Athena Micro-academy of Austin",
    title: "Athena Micro-academy Website Demo",
    description:
      "A concept admissions landing page for Athena Micro-academy of Austin — a relationship-centered microschool for grades 6–12 in South Austin.",
    config: athenaMicroacademyConfig,
    steps: athenaWalkthroughPlaceholder,
  },
  "austin-micro-school": {
    schoolName: "Austin Micro School",
    title: "Austin Micro School Website Demo",
    description:
      "A concept admissions landing page for Austin Micro School — an accredited K-12 microschool in South Austin focused on hands-on learning and leadership development.",
    config: austinMicroSchoolConfig,
    steps: austinMicroSchoolWalkthroughPlaceholder,
  },
  "beacon-of-hope-academy": {
    schoolName: "Beacon of Hope Academy",
    title: "Beacon of Hope Academy Website Demo",
    description:
      "A private website redesign concept for Beacon of Hope Academy, a faith-based special education learning center for grades K–5 in Greenacres, Florida.",
    config: beaconOfHopeAcademyConfig,
    steps: beaconOfHopeAcademyWalkthroughPlaceholder,
  },
  "blue-horizon-studio": {
    schoolName: "Blue Horizon Studio",
    title: "Blue Horizon Studio Website Demo",
    description:
      "A private website redesign concept for Blue Horizon Studio, a boutique grades 3–8 microschool opening in Lathrop/Manteca, California.",
    config: blueHorizonStudioConfig,
    steps: blueHorizonStudioWalkthroughPlaceholder,
  },
  "bmf-microschools": {
    schoolName: "School to Purpose Academies",
    title: "School to Purpose Academies Website Demo",
    description:
      "A private website redesign concept for School to Purpose Academies, the Black Mothers Forum microschools in Phoenix, Arizona.",
    config: bmfMicroschoolsConfig,
    steps: bmfMicroschoolsWalkthroughPlaceholder,
  },
  "book-hooks-schoolhouse": {
    schoolName: "The Book Hooks Schoolhouse",
    title: "The Book Hooks Schoolhouse Website Demo",
    description:
      "A private website redesign concept for The Book Hooks Schoolhouse, a Christian hybrid microschool in Houston, Texas.",
    config: bookHooksSchoolhouseConfig,
    steps: bookHooksSchoolhouseWalkthroughPlaceholder,
  },
  "brazos-valley-honor-academy": {
    schoolName: "Brazos Valley Honor Academy",
    title: "Brazos Valley Honor Academy Website Demo",
    description:
      "A concept admissions landing page for Brazos Valley Honor Academy — a Christian homeschool hybrid in Navasota, Texas serving K–7 students.",
    config: brazosValleyHonorAcademyConfig,
    steps: brazosValleyHonorAcademyWalkthroughPlaceholder,
  },
  "bright-minds-future-leaders": {
    schoolName: "Bright Minds Future Leaders",
    title: "Bright Minds Future Leaders Website Demo",
    description:
      "A private website redesign concept for Bright Minds Future Leaders, a K–5 private micro school in New Caney, Texas.",
    config: brightMindsFutureLeadersConfig,
    steps: brightMindsFutureLeadersWalkthroughPlaceholder,
  },
  "choice-acton-academy": {
    schoolName: "CHOICE: An Acton Academy",
    title: "CHOICE: An Acton Academy Website Demo",
    description:
      "A private website redesign concept for CHOICE: An Acton Academy, a learner-driven school for ages 4–14 in Woods Cross, Utah.",
    config: choiceActonAcademyConfig,
    steps: choiceActonAcademyWalkthroughPlaceholder,
  },
  "coastal-sage-montessori": {
    schoolName: "Coastal Sage Montessori",
    title: "Coastal Sage Montessori Website Demo",
    description:
      "A private website redesign concept for Coastal Sage Montessori, a Christ-centered Montessori school for ages 3 to 15 and high school in Carlsbad, California.",
    config: coastalSageMontessoriConfig,
    steps: coastalSageMontessoriWalkthroughPlaceholder,
  },
  "coys-camps-and-classes": {
    schoolName: "Coy's Camps And Classes",
    title: "Coy's Camps And Classes Website Demo",
    description:
      "A private website redesign concept for Coy's Camps And Classes and its Prodigypreneurs K–8 microschool in Tucson, Arizona.",
    config: coysCampsAndClassesConfig,
    steps: coysCampsAndClassesWalkthroughPlaceholder,
  },
  "creation-acres": {
    schoolName: "Creation Acres Montessori",
    title: "Creation Acres Montessori Website Demo",
    description:
      "A concept admissions landing page for Creation Acres Montessori — a Christ-centered Montessori microschool in Mint Hill, NC serving the Charlotte area.",
    config: creationAcresConfig,
    steps: creationAcresWalkthroughPlaceholder,
  },
  "desert-dragon-school": {
    schoolName: "Desert Dragon Learning Community",
    title: "Desert Dragon Learning Community Website Demo",
    description:
      "A private website redesign concept for Desert Dragon Learning Community, a neuroaffirming K–8 microschool in Tucson, Arizona.",
    config: desertDragonSchoolConfig,
    steps: desertDragonSchoolWalkthroughPlaceholder,
  },
  "desert-sun-ranch-academy": {
    schoolName: "Desert Sun Ranch Academy",
    title: "Desert Sun Ranch Academy Website Demo",
    description:
      "A private website redesign concept for Desert Sun Ranch Academy, a K–8 learning center for children with special needs in Queen Creek, Arizona.",
    config: desertSunRanchAcademyConfig,
    steps: desertSunRanchAcademyWalkthroughPlaceholder,
  },
  "down-to-earth-homeschool": {
    schoolName: "Down to Earth Co-op",
    title: "Down to Earth Co-op Website Demo",
    description:
      "A private website redesign concept for Down to Earth Co-op, a Christian homeschool co-op for grades K–8 in Lighthouse Point, Florida.",
    config: downToEarthHomeschoolConfig,
    steps: downToEarthHomeschoolWalkthroughPlaceholder,
  },
  "elite-performance-prep-freeport": {
    schoolName: "Elite Performance Prep Academy Freeport",
    title: "Elite Performance Prep Academy Freeport Website Demo",
    description:
      "A private website redesign concept for Elite Performance Prep Academy Freeport, a personalized K–8 microschool in Freeport, Florida.",
    config: elitePerformancePrepFreeportConfig,
    steps: elitePerformancePrepFreeportWalkthroughPlaceholder,
  },
  "esteam-academy-round-rock": {
    schoolName: "ESTEAM Academy",
    title: "ESTEAM Academy Website Demo",
    description:
      "A private website redesign concept for ESTEAM Academy, an Acton Academy affiliate microschool in Round Rock, Texas.",
    config: esteamAcademyRoundRockConfig,
    steps: esteamAcademyRoundRockWalkthroughPlaceholder,
  },
  "everroot-academy": {
    schoolName: "EverRoot Academy",
    title: "EverRoot Academy Website Demo",
    description:
      "A private website redesign concept for EverRoot Academy, a hybrid, inquiry-based program for grades 3–7 based in Crestview, Florida.",
    config: everrootAcademyConfig,
    steps: everrootAcademyWalkthroughPlaceholder,
  },
  "exodus-academy": {
    schoolName: "Exodus Academy",
    title: "Exodus Academy Website Demo",
    description:
      "A private website redesign concept for Exodus Academy, a Christian microschool for 2K–12 in Inman, South Carolina.",
    config: exodusAcademyConfig,
    steps: exodusAcademyWalkthroughPlaceholder,
  },
  "family-lyceum": {
    schoolName: "Family Lyceum",
    title: "Family Lyceum Website Demo",
    description:
      "A concept admissions landing page for Family Lyceum — a hybrid private school in Clearfield, Utah with small classes, family-centered learning, and programs from FIREFLY through TORCH.",
    config: familyLyceumConfig,
    steps: familyLyceumWalkthroughPlaceholder,
  },
  "foothill-christian-academy": {
    schoolName: "Foothill Christian Academy",
    title: "Foothill Christian Academy Website Demo",
    description:
      "A private website redesign concept for Foothill Christian Academy, a Christian hybrid school in Upland, California.",
    config: foothillChristianAcademyConfig,
    steps: foothillChristianAcademyWalkthroughPlaceholder,
  },
  "freedom-prep-academy": {
    schoolName: "Freedom Prep",
    title: "Freedom Prep Academy Website Demo",
    description:
      "A concept admissions landing page for Freedom Prep Academy — an Arizona K–12 charter school with online, learning center, and microschool pathways.",
    config: freedomPrepAcademyConfig,
    steps: freedomPrepAcademyWalkthroughPlaceholder,
  },
  "garden-school-marietta": {
    schoolName: "The Garden School of Marietta",
    title: "The Garden School of Marietta Website Demo",
    description:
      "A private website redesign concept for The Garden School of Marietta, a Waldorf-inspired forest school in Marietta, Georgia.",
    config: gardenSchoolMariettaConfig,
    steps: gardenSchoolMariettaWalkthroughPlaceholder,
  },
  "gathered-oak-farm": {
    schoolName: "Gathered Oak Farm",
    title: "Gathered Oak Farm Website Demo",
    description:
      "A concept admissions landing page for Gathered Oak Farm — a nature- and farm-based microschool in Fallbrook, California, where children learn through hands-on discovery and community.",
    config: gatheredOakFarmConfig,
    steps: gatheredOakFarmWalkthroughPlaceholder,
  },
  "gifted-collective-microschool": {
    schoolName: "Gifted Microschool at The Gifted Collective",
    title: "Gifted Microschool at The Gifted Collective Website Demo",
    description:
      "A private website redesign concept for the Gifted Microschool at The Gifted Collective in Phoenix, Arizona.",
    config: giftedCollectiveMicroschoolConfig,
    steps: giftedCollectiveMicroschoolWalkthroughPlaceholder,
  },
  "gods-little-people-learning-academy": {
    schoolName: "God's Little People Learning Academy",
    title: "God's Little People Learning Academy Website Demo",
    description:
      "A private website redesign concept for God's Little People Learning Academy, a faith-based Pre-K–2nd grade microschool in Houston, Texas.",
    config: godsLittlePeopleLearningAcademyConfig,
    steps: godsLittlePeopleLearningAcademyWalkthroughPlaceholder,
  },
  "heartsong-cottage-school": {
    schoolName: "Heartsong Cottage School",
    title: "Heartsong Cottage School Website Demo",
    description:
      "A private website redesign concept for Heartsong Cottage School, a Waldorf-inspired homeschool co-op in Highland, Utah.",
    config: heartsongCottageSchoolConfig,
    steps: heartsongCottageSchoolWalkthroughPlaceholder,
  },
  "hilton-horizons-academy": {
    schoolName: "Hilton Horizons Academy",
    title: "Hilton Horizons Academy Website Demo",
    description:
      "A concept admissions landing page for Hilton Horizons Academy — project-based K–12 education across Category III private school and hybrid microschool pathways in the Tri-Cities.",
    config: hiltonHorizonsAcademyConfig,
    steps: hiltonHorizonsAcademyWalkthroughPlaceholder,
  },
  "homework-hub": {
    schoolName: "Homework Hub",
    title: "Homework Hub Website Demo",
    description:
      "A concept admissions landing page for Homework Hub — an award-winning academic learning center serving Pre-K through college and beyond in Melville, NY.",
    config: homeworkHubConfig,
    steps: homeworkHubWalkthroughPlaceholder,
  },
  "honeycomb-cottage-school": {
    schoolName: "Honeycomb Cottage School",
    title: "Honeycomb Cottage School Website Demo",
    description:
      "A private website redesign concept for Honeycomb Cottage School, a Waldorf-inspired hybrid homeschool in Lehi, Utah.",
    config: honeycombCottageSchoolConfig,
    steps: honeycombCottageSchoolWalkthroughPlaceholder,
  },
  "ignite-microschool": {
    schoolName: "Ignite Microschool",
    title: "Ignite Microschool Website Demo",
    description:
      "A private website redesign concept for Ignite Microschool, a STEAM microschool and learning center in Greenville, South Carolina.",
    config: igniteMicroschoolConfig,
    steps: igniteMicroschoolWalkthroughPlaceholder,
  },
  "inner-fire-academy": {
    schoolName: "Inner Fire Academy",
    title: "Inner Fire Academy Website Demo",
    description:
      "A private website redesign concept for Inner Fire Academy, a microschool for gifted and twice-exceptional children in San Francisco.",
    config: innerFireAcademyConfig,
    steps: innerFireAcademyWalkthroughPlaceholder,
  },
  "innovation-academy-las-vegas": {
    schoolName: "Innovation Academy",
    title: "Innovation Academy Website Demo",
    description:
      "A private website redesign concept for Innovation Academy, a Montessori-based K–8 school in Las Vegas, Nevada.",
    config: innovationAcademyLasVegasConfig,
    steps: innovationAcademyLasVegasWalkthroughPlaceholder,
  },
  "inspired-learning-academy": {
    schoolName: "Inspired Learning Academy",
    title: "Inspired Learning Academy | Hybrid Microschool in Allen, TX",
    description:
      "Unofficial concept preview. A hybrid microschool for grades 6–12 in Allen, TX. Three campus days, two remote days, and mentorship that supports ownership, confidence, and growth.",
    config: inspiredLearningConfig,
    steps: inspiredLearningWalkthroughPlaceholder,
  },
  "invictus-leander": {
    schoolName: "Invictus: An Acton Academy",
    title: "Invictus: An Acton Academy Website Demo",
    description:
      "A private website redesign concept for Invictus: An Acton Academy, a learner-driven private school for ages 3.5 to 11 near Leander, Liberty Hill and Georgetown, Texas.",
    config: invictusLeanderConfig,
    steps: invictusLeanderWalkthroughPlaceholder,
  },
  "journey-academy": {
    schoolName: "Journey Academy",
    title: "Journey Academy Website Demo",
    description:
      "A private website redesign concept for Journey Academy, an Acton Academy affiliate in Littleton, Colorado.",
    config: journeyAcademyConfig,
    steps: journeyAcademyWalkthroughPlaceholder,
  },
  "kats-community-microschool": {
    schoolName: "Kat's Community Microschool",
    title: "Kat's Community Microschool Website Demo",
    description:
      "A concept admissions landing page for Kat's Community Microschool — a small, student-driven microschool in Phoenix for grades 3–6 with AZ ESA enrollment support.",
    config: katsCommunityMicroschoolConfig,
    steps: katsCommunityMicroschoolWalkthroughPlaceholder,
  },
  "kinder-academy-prep-school": {
    schoolName: "Kinder Academy Prep School",
    title: "Kinder Academy Prep School Website Demo",
    description:
      "A concept admissions landing page for Kinder Academy Prep School — a private early-childhood microschool in Georgetown, Texas for ages 4–8 and K–3 with personalized, play-based learning.",
    config: kinderAcademyPrepSchoolConfig,
    steps: kinderAcademyPrepSchoolWalkthroughPlaceholder,
  },
  "kineo-school": {
    schoolName: "The Kineo School",
    title: "Kineo School Website Demo",
    description:
      "A concept admissions landing page for The Kineo School — an accredited K-5 independent school in Kirkland, Washington.",
    config: kineoSchoolConfig,
    steps: kineoSchoolWalkthroughPlaceholder,
  },
  "lab-learning": {
    schoolName: "The Lab Learning Space",
    title: "The Lab Learning Space Website Demo",
    description:
      "A concept admissions landing page for The Lab Learning Space — a nonprofit mastery-based enrichment center for K–8 students in Long Beach, CA.",
    config: labLearningConfig,
    steps: labLearningWalkthroughPlaceholder,
  },
  "lighthouse-homeschool": {
    schoolName: "Lighthouse Homeschool Academy",
    title: "Lighthouse Homeschool Academy Website Demo",
    description:
      "A concept admissions landing page for Lighthouse Homeschool Academy — a Christ-centered hybrid homeschool program in Fairview Park, Ohio.",
    config: lighthouseHomeschoolConfig,
    steps: lighthouseHomeschoolWalkthroughPlaceholder,
  },
  "little-sprigs-tampa": {
    schoolName: "Little Sprigs of Tampa",
    title: "Little Sprigs of Tampa Website Demo",
    description:
      "A concept community landing page for Little Sprigs of Tampa — a play-based, child-led family meetup community in the Tampa Bay area, part of The Homeschool Village.",
    config: littleSprigsTampaConfig,
    steps: littleSprigsTampaWalkthroughPlaceholder,
  },
  "luff-learning": {
    schoolName: "Luff Learning Fine Arts Academy",
    title: "Luff Learning Website Demo",
    description:
      "A concept admissions landing page for Luff Learning Fine Arts Academy — a secular fine arts academy and virtual microschool in Spring, Texas.",
    config: luffLearningConfig,
    steps: luffLearningWalkthroughPlaceholder,
  },
  "madrona-school": {
    schoolName: "Madrona School",
    title: "Madrona School Website Demo",
    description:
      "A private website redesign concept for Madrona School, an independent Waldorf school on Bainbridge Island, Washington.",
    config: madronaSchoolConfig,
    steps: madronaSchoolWalkthroughPlaceholder,
  },
  "mcp-academy": {
    schoolName: "MCP Academy",
    title: "MCP Academy Website Demo",
    description:
      "A private website redesign concept for MCP Academy, a PreK–8 microschool in Mansfield, Texas.",
    config: mcpAcademyConfig,
    steps: mcpAcademyWalkthroughPlaceholder,
  },
  "meadows-bee-farm": {
    schoolName: "Meadows Bee Farm",
    title: "Meadows Bee Farm Website Demo",
    description:
      "A private website redesign concept for Meadows Bee Farm and its Young Farmers Program in Windham, Vermont.",
    config: meadowsBeeFarmConfig,
    steps: meadowsBeeFarmWalkthroughPlaceholder,
  },
  "micahs-mission-school": {
    schoolName: "Micah's Mission School, Inc.",
    title: "Micah's Mission School Website Demo",
    description:
      "A concept admissions landing page for Micah's Mission School, Inc. — a faith-based K–12 hybrid learning and resource center in Vicksburg, Mississippi.",
    config: micahsMissionSchoolConfig,
    steps: micahMissionWalkthroughPlaceholder,
  },
  "mirus-academy": {
    schoolName: "Mirus Academy",
    title: "Mirus Academy Website Demo",
    description:
      "A private website redesign concept for Mirus Academy, a small private high school in Old Town Katy, Texas.",
    config: mirusAcademyConfig,
    steps: mirusAcademyWalkthroughPlaceholder,
  },
  "monarch-hills": {
    schoolName: "Monarch Hills Education",
    title: "Monarch Hills Education Website Demo",
    description:
      "A concept admissions landing page for Monarch Hills Education — outdoor enrichment and alternative education for grades TK–6 in San Luis Obispo, California.",
    config: monarchHillsEducationConfig,
    steps: monarchHillsWalkthroughPlaceholder,
  },
  "morgan-prep-academy": {
    schoolName: "Morgan Preparatory Academy for Boys",
    title: "Morgan Preparatory Academy for Boys Website Demo",
    description:
      "A private website redesign concept for Morgan Preparatory Academy for Boys, a K–5 boys' microschool in Plano, Texas.",
    config: morganPrepAcademyConfig,
    steps: morganPrepAcademyWalkthroughPlaceholder,
  },
  "naples-microschools": {
    schoolName: "Naples MicroSchools",
    title: "Naples MicroSchools Website Demo",
    description:
      "A concept admissions landing page for Naples MicroSchools — a nature-immersive homeschool partner on a working farm in Golden Gate Estates, Florida.",
    config: naplesMicroschoolsConfig,
    steps: naplesMicroschoolsWalkthroughPlaceholder,
  },
  "natures-schoolhouse": {
    schoolName: "Nature's Schoolhouse Microschool",
    title: "Nature's Schoolhouse Microschool Website Demo",
    description:
      "A concept admissions landing page for Nature's Schoolhouse Microschool — a nature-forward, flexible learning community in Cedar Park, Texas.",
    config: naturesSchoolhouseConfig,
    steps: naturesSchoolhouseWalkthroughPlaceholder,
  },
  "one-acre-farm": {
    schoolName: "One Acre Farm",
    title: "One Acre Farm Website Demo",
    description:
      "A concept admissions landing page for One Acre Farm Educational Foundation — a nonprofit educational farm with Farm School learning pods in Porter, TX.",
    config: oneAcreFarmConfig,
    steps: oneAcreFarmWalkthroughPlaceholder,
  },
  "paradise-earth-academy": {
    schoolName: "Paradise Earth Academy",
    title: "Paradise Earth Academy Website Demo",
    description:
      "A concept admissions landing page for Paradise Earth Academy — a private K-8 school in Gilbert, Arizona with holistic academics, nature days, and flexible enrollment.",
    config: paradiseEarthAcademyConfig,
    steps: paradiseEarthAcademyWalkthroughPlaceholder,
  },
  "peninsular-prep": {
    schoolName: "Peninsular Prep",
    title: "Peninsular Prep Website Demo",
    description:
      "A private website redesign concept for Peninsular Prep, a small K–8 school in South Tampa, Florida.",
    config: peninsularPrepConfig,
    steps: peninsularPrepWalkthroughPlaceholder,
  },
  "piedmont-forest-school": {
    schoolName: "Piedmont Forest School",
    title: "Piedmont Forest School Website Demo",
    description:
      "A concept admissions landing page for Piedmont Forest School — an inclusive, year-round forest school community in Winston-Salem, North Carolina.",
    config: piedmontForestSchoolConfig,
    steps: piedmontForestSchoolWalkthroughPlaceholder,
  },
  "praxis-elite-sports-academy": {
    schoolName: "Praxis Elite Sports Academy",
    title: "Praxis Elite Sports Academy Website Demo",
    description:
      "A private website redesign concept for Praxis Elite Sports Academy Junior Prep, a private middle school for student athletes in San Diego, California.",
    config: praxisEliteSportsAcademyConfig,
    steps: praxisEliteSportsAcademyWalkthroughPlaceholder,
  },
  "prestige-homeschool-academy": {
    schoolName: "Prestige Homeschool Academy",
    title: "Prestige Homeschool Academy Website Demo",
    description:
      "A concept admissions landing page for Prestige Homeschool Academy — project-based homeschool education with small-group learning in Niceville, Florida.",
    config: prestigeHomeschoolAcademyConfig,
    steps: prestigeHomeschoolAcademyWalkthroughPlaceholder,
  },
  "prestige-wisdom-academy": {
    schoolName: "Prestige Wisdom Academy",
    title: "Prestige Wisdom Academy Website Demo",
    description:
      "A private website redesign concept for Prestige Wisdom Academy, a faith-centered microschool in Houston, Texas.",
    config: prestigeWisdomAcademyConfig,
    steps: prestigeWisdomAcademyWalkthroughPlaceholder,
  },
  "renewed-roots-forest-school": {
    schoolName: "Renewed Roots Forest School",
    title: "Renewed Roots Forest School Website Demo",
    description:
      "A private website redesign concept for Renewed Roots Forest School, a nature-based forest microschool in Moorhead, Minnesota.",
    config: renewedRootsForestSchoolConfig,
    steps: renewedRootsForestSchoolWalkthroughPlaceholder,
  },
  "river-oak-academy": {
    schoolName: "River Oak Academy",
    title: "River Oak Academy Website Demo",
    description:
      "A concept admissions landing page for River Oak Academy — a learner-driven, nature-rich private school in St. Johns, Florida.",
    config: riverOakAcademyConfig,
    steps: riverOakAcademyWalkthroughPlaceholder,
  },
  "rooted-meadows": {
    schoolName: "Rooted Meadows Waldorf School",
    title: "Rooted Meadows Website Demo",
    description:
      "A concept admissions landing page for Rooted Meadows Waldorf School — a Waldorf-guided micro-school serving grades K–8 in the Greater Idaho Falls area.",
    config: rootedMeadowsConfig,
    steps: rootedMeadowsWalkthroughPlaceholder,
  },
  "roots-and-wings-microschool": {
    schoolName: "Roots and Wings",
    title: "Roots and Wings Microschool Website Demo",
    description:
      "A concept admissions landing page for Roots and Wings Microschool — a small, private microschool in North Mesa led by a state-certified teacher with personalized K–8 learning.",
    config: rootsAndWingsMicroschoolConfig,
    steps: rootsAndWingsMicroschoolWalkthroughPlaceholder,
  },
  "sage-montessori-nashville": {
    schoolName: "Sage Montessori School of Nashville",
    title: "Sage Montessori School of Nashville Website Demo",
    description:
      "A private website redesign concept for Sage Montessori School of Nashville, a Wildflower Montessori school for ages 3–6 in downtown Nashville.",
    config: sageMontessoriNashvilleConfig,
    steps: sageMontessoriNashvilleWalkthroughPlaceholder,
  },
  "south-oc-hybrid-homeschool": {
    schoolName: "South OC Hybrid Homeschool",
    title: "South OC Hybrid Homeschool Website Demo",
    description:
      "A private website redesign concept for South OC Hybrid Homeschool, a nonprofit hybrid homeschool program in Mission Viejo, California.",
    config: southOcHybridHomeschoolConfig,
    steps: southOcHybridHomeschoolWalkthroughPlaceholder,
  },
  "spring-river-school": {
    schoolName: "Spring River School",
    title: "Spring River School Website Demo",
    description:
      "A concept admissions landing page for Spring River School — a Waldorf-inspired homeschool community in Atlantic Beach, Florida serving K–12 through nature-based outdoor learning.",
    config: springRiverSchoolConfig,
    steps: springRiverSchoolWalkthroughPlaceholder,
  },
  "spyrja-academy-new-braunfels": {
    schoolName: "Spyrja Academy of New Braunfels",
    title: "Spyrja Academy of New Braunfels Website Demo",
    description:
      "A private website redesign concept for Spyrja Academy of New Braunfels, a year-round microschool for 6th–12th grade in New Braunfels, Texas.",
    config: spyrjaAcademyNewBraunfelsConfig,
    steps: spyrjaAcademyNewBraunfelsWalkthroughPlaceholder,
  },
  "steps-learning-center": {
    schoolName: "Steps Learning Center",
    title: "Steps Learning Center Website Demo",
    description:
      "A private website redesign concept for Steps Learning Center, a microschool and support center for neurodiverse learners in Orlando, Florida.",
    config: stepsLearningCenterConfig,
    steps: stepsLearningCenterWalkthroughPlaceholder,
  },
  "tapestry-academy": {
    schoolName: "Tapestry Academy",
    title: "Tapestry Academy | Microschool & Homeschool Programs in Boca Raton, FL",
    description:
      "Tapestry Academy offers flexible microschool and homeschool programs for Grades K–12 in East Boca Raton—personalized learning, hands-on projects, mentorship, and community.",
    config: tapestryAcademyConfig,
    steps: tapestryAcademyWalkthroughPlaceholder,
  },
  "the-focus-academy": {
    schoolName: "The FOCUS Academy",
    title: "The FOCUS Academy Website Demo",
    description:
      "A concept admissions landing page for The FOCUS Academy — a Memphis-area microschool for gifted and neurodivergent middle-school boys.",
    config: theFocusAcademyConfig,
    steps: theFocusAcademyWalkthroughPlaceholder,
  },
  "the-wild-school": {
    schoolName: "The Wild School",
    title: "The Wild School Website Demo",
    description:
      "A private website redesign concept for The Wild School, a fully outdoor nature school with locations across Houston, Texas.",
    config: theWildSchoolConfig,
    steps: theWildSchoolWalkthroughPlaceholder,
  },
  "the-woodlands-microschool": {
    schoolName: "The Woodlands Microschool",
    title: "The Woodlands Microschool Website Demo",
    description:
      "A concept admissions landing page for The Woodlands Microschool — an accredited private microschool in Conroe, Texas with a distinctive four-hour day.",
    config: theWoodlandsMicroschoolConfig,
    steps: theWoodlandsMicroschoolWalkthroughPlaceholder,
  },
  "true-north": {
    schoolName: "True North",
    title: "True North Website Demo",
    description:
      "A concept admissions landing page for True North — a Christian, biblically based parent partnership serving grades 1–12 in The Woodlands, TX.",
    config: trueNorthConfig,
    steps: trueNorthWalkthroughPlaceholder,
  },
  "wild-hearts-adventure": {
    schoolName: "Wild Hearts Adventure Co.",
    title: "Wild Hearts Adventure Co. Website Demo",
    description:
      "A concept admissions landing page for Wild Hearts Adventure Co. — a project-based, nature-centered learning community in Visalia, California.",
    config: wildHeartsAdventureConfig,
    steps: wildHeartsWalkthroughPlaceholder,
  },
  "wildcat-microschool": {
    schoolName: "Wildcat Microschool",
    title: "Wildcat Microschool Website Demo",
    description:
      "A private website redesign concept for Wildcat Microschool, a homeschool learning pod in Haverhill, New Hampshire.",
    config: wildcatMicroschoolConfig,
    steps: wildcatMicroschoolWalkthroughPlaceholder,
  },
  "wonderhere-lakeland": {
    schoolName: "WonderHere Lakeland",
    title: "WonderHere Lakeland Website Demo",
    description:
      "A concept admissions landing page for WonderHere Lakeland — play-based, project-driven learning on a ten-acre farm in Lakeland, Florida.",
    config: wonderhereLakelandConfig,
    steps: wonderhereWalkthroughPlaceholder,
  },
  "wondering-oaks-learning": {
    schoolName: "Wondering Oaks Learning",
    title: "Wondering Oaks Learning Website Demo",
    description:
      "A concept admissions landing page for Wondering Oaks Learning — a secular homeschool-away-from-home microschool in Conroe, Texas for ages 5–8.",
    config: wonderingOaksLearningConfig,
    steps: wonderingOaksWalkthroughPlaceholder,
  },
  "zoe-learning-house": {
    schoolName: "Zoe Learning House",
    title: "Zoe Learning House Website Demo",
    description:
      "A concept admissions landing page for Zoe Learning House — a holistic Christian K–5 microschool in Greater New Orleans with flexible 1–5 day options.",
    config: zoeLearningHouseConfig,
    steps: zoeLearningHouseWalkthroughPlaceholder,
  },
};
