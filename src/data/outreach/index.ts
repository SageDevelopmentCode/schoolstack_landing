import { athenaMicroacademyOutreach } from "./athena-microacademy";
import { naturesSchoolhouseOutreach } from "./natures-schoolhouse";
import type { OutreachPlan } from "./types";
import { wildHeartsAdventureOutreach } from "./wild-hearts-adventure";
import { zoeLearningHouseOutreach } from "./zoe-learning-house";

export type * from "./types";
export { OUTREACH_FILL_IN_TOKENS } from "./types";

/** Researched outreach plans keyed by demo slug. Add new schools here (the research skill does this). */
export const outreachPlanRegistry: Record<string, OutreachPlan> = {
  [athenaMicroacademyOutreach.slug]: athenaMicroacademyOutreach,
  [naturesSchoolhouseOutreach.slug]: naturesSchoolhouseOutreach,
  [wildHeartsAdventureOutreach.slug]: wildHeartsAdventureOutreach,
  [zoeLearningHouseOutreach.slug]: zoeLearningHouseOutreach,
};

export function getOutreachPlan(slug: string): OutreachPlan | null {
  return Object.prototype.hasOwnProperty.call(outreachPlanRegistry, slug) ? outreachPlanRegistry[slug] : null;
}

export function listOutreachPlans(): OutreachPlan[] {
  return Object.values(outreachPlanRegistry);
}
