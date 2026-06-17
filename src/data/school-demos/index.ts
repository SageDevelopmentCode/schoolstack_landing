export type { SchoolWebsiteDemoConfig } from "./types";
export { defaultWebsiteDemoConfig } from "./default";
export { athenaMicroacademyConfig } from "./athena-microacademy";
export { wonderhereLakelandConfig } from "./wonderhere-lakeland";
export { monarchHillsEducationConfig } from "./monarch-hills-education";
export { zoeLearningHouseConfig } from "./zoe-learning-house";
export { hiltonHorizonsAcademyConfig } from "./hilton-horizons-academy";
export { micahsMissionSchoolConfig } from "./micahs-mission-school";

import type { SchoolWebsiteDemoConfig } from "./types";
import { athenaMicroacademyConfig } from "./athena-microacademy";
import { wonderhereLakelandConfig } from "./wonderhere-lakeland";
import { monarchHillsEducationConfig } from "./monarch-hills-education";
import { zoeLearningHouseConfig } from "./zoe-learning-house";
import { hiltonHorizonsAcademyConfig } from "./hilton-horizons-academy";
import { micahsMissionSchoolConfig } from "./micahs-mission-school";

export const schoolDemoRegistry: Record<string, SchoolWebsiteDemoConfig> = {
  "athena-microacademy": athenaMicroacademyConfig,
  "wonderhere-lakeland": wonderhereLakelandConfig,
  "monarch-hills-education": monarchHillsEducationConfig,
  "zoe-learning-house": zoeLearningHouseConfig,
  "hilton-horizons-academy": hiltonHorizonsAcademyConfig,
  "micahs-mission-school": micahsMissionSchoolConfig,
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
