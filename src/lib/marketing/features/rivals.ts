import type { RivalId } from "./types";

export type Rival = {
  id: RivalId;
  name: string;
  /** Who the product is built for, in their own positioning. */
  builtFor: string;
  url: string;
};

/**
 * The school platforms every feature comparison names. Facts in comparison
 * cells come from each company's own public pages (see docs/features-research/_rivals.md).
 */
export const RIVALS: Rival[] = [
  { id: "brightwheel", name: "Brightwheel", builtFor: "Childcare centers and preschools", url: "https://mybrightwheel.com" },
  { id: "playground", name: "Playground", builtFor: "Childcare programs", url: "https://www.tryplayground.com" },
  { id: "transparent-classroom", name: "Transparent Classroom", builtFor: "Montessori schools", url: "https://www.transparentclassroom.com" },
];

export const COMPARISONS_CHECKED = "November 2026";
