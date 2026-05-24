export type { SchoolWebsiteDemoConfig } from "./types";
export { defaultWebsiteDemoConfig } from "./default";
export { athenaMicroacademyConfig } from "./athena-microacademy";

import type { SchoolWebsiteDemoConfig } from "./types";
import { athenaMicroacademyConfig } from "./athena-microacademy";

export const schoolDemoRegistry: Record<string, SchoolWebsiteDemoConfig> = {
  "athena-microacademy": athenaMicroacademyConfig,
};

export function getSchoolDemoConfig(slug: string): SchoolWebsiteDemoConfig | undefined {
  return schoolDemoRegistry[slug];
}
