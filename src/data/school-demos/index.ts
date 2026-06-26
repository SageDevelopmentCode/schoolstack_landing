export type { SchoolWebsiteDemoConfig } from "./types";
export { defaultWebsiteDemoConfig } from "./default";
export { athenaMicroacademyConfig } from "./athena-microacademy";
export { wonderingOaksLearningConfig } from "./wondering-oaks-learning";
export { wildHeartsAdventureConfig } from "./wild-hearts-adventure";
export { naturesSchoolhouseConfig } from "./natures-schoolhouse";
export { theWoodlandsMicroschoolConfig } from "./the-woodlands-microschool";
export { wonderhereLakelandConfig } from "./wonderhere-lakeland";
export { monarchHillsEducationConfig } from "./monarch-hills-education";
export { zoeLearningHouseConfig } from "./zoe-learning-house";
export { hiltonHorizonsAcademyConfig } from "./hilton-horizons-academy";
export { micahsMissionSchoolConfig } from "./micahs-mission-school";
export { homeworkHubConfig } from "./homework-hub";
export { ascendMicroSchoolConfig } from "./ascend-micro-school";
export { rootedMeadowsConfig } from "./rooted-meadows";
export { prestigeHomeschoolAcademyConfig } from "./prestige-homeschool-academy";
export { arizonaGiftedAcademyConfig } from "./arizona-gifted-academy";
export { springRiverSchoolConfig } from "./spring-river-school";
export { lighthouseHomeschoolConfig } from "./lighthouse-homeschool";
export { luffLearningConfig } from "./luff-learning";

import type { SchoolWebsiteDemoConfig } from "./types";
import { athenaMicroacademyConfig } from "./athena-microacademy";
import { wonderingOaksLearningConfig } from "./wondering-oaks-learning";
import { wildHeartsAdventureConfig } from "./wild-hearts-adventure";
import { naturesSchoolhouseConfig } from "./natures-schoolhouse";
import { theWoodlandsMicroschoolConfig } from "./the-woodlands-microschool";
import { wonderhereLakelandConfig } from "./wonderhere-lakeland";
import { monarchHillsEducationConfig } from "./monarch-hills-education";
import { zoeLearningHouseConfig } from "./zoe-learning-house";
import { hiltonHorizonsAcademyConfig } from "./hilton-horizons-academy";
import { micahsMissionSchoolConfig } from "./micahs-mission-school";
import { homeworkHubConfig } from "./homework-hub";
import { ascendMicroSchoolConfig } from "./ascend-micro-school";
import { rootedMeadowsConfig } from "./rooted-meadows";
import { prestigeHomeschoolAcademyConfig } from "./prestige-homeschool-academy";
import { arizonaGiftedAcademyConfig } from "./arizona-gifted-academy";
import { springRiverSchoolConfig } from "./spring-river-school";
import { lighthouseHomeschoolConfig } from "./lighthouse-homeschool";
import { luffLearningConfig } from "./luff-learning";

export const schoolDemoRegistry: Record<string, SchoolWebsiteDemoConfig> = {
  "athena-microacademy": athenaMicroacademyConfig,
  "wondering-oaks-learning": wonderingOaksLearningConfig,
  "wild-hearts-adventure": wildHeartsAdventureConfig,
  "natures-schoolhouse": naturesSchoolhouseConfig,
  "the-woodlands-microschool": theWoodlandsMicroschoolConfig,
  "wonderhere-lakeland": wonderhereLakelandConfig,
  "monarch-hills-education": monarchHillsEducationConfig,
  "zoe-learning-house": zoeLearningHouseConfig,
  "hilton-horizons-academy": hiltonHorizonsAcademyConfig,
  "micahs-mission-school": micahsMissionSchoolConfig,
  "homework-hub": homeworkHubConfig,
  "ascend-micro-school": ascendMicroSchoolConfig,
  "rooted-meadows": rootedMeadowsConfig,
  "prestige-homeschool-academy": prestigeHomeschoolAcademyConfig,
  "arizona-gifted-academy": arizonaGiftedAcademyConfig,
  "spring-river-school": springRiverSchoolConfig,
  "lighthouse-homeschool": lighthouseHomeschoolConfig,
  "luff-learning": luffLearningConfig,
};

export function getSchoolDemoConfig(slug: string): SchoolWebsiteDemoConfig | undefined {
  return schoolDemoRegistry[slug];
}

export function listSchoolDemoOptions(): { slug: string; label: string }[] {
  return Object.entries(schoolDemoRegistry).map(([slug, config]) => ({
    slug,
    label: config.schoolName,
  }));
}

export function listSchoolDemos() {
  return Object.values(schoolDemoRegistry).map((config) => ({
    slug: config.slug,
    schoolName: config.schoolName,
    logo: config.logo,
    description: config.hero.subheadline,
    href: `/demo/${config.slug}`,
    themePrimary: config.theme.primary,
  }));
}
