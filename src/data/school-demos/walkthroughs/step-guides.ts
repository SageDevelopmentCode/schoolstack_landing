import type { DemoWalkthroughStep } from "./shared";

/**
 * The short card shown on each demo step: what the founder is looking at, and one thing to
 * try. Keep both to a short line. Only point "try" at controls that work in the demo (pay,
 * roll call and form submit buttons are disabled previews).
 */
export type DemoStepGuide = {
  what: string;
  tryThis?: string;
};

/** Labels from the school's own website demo, so "try" names the real button. */
export type DemoStepGuideLabels = {
  /** The website's nav button (always visible at the top), which jumps to the inquiry form. */
  navCta: string;
  /** The inquiry form's submit button. */
  submitLabel: string;
};

const GUIDES: Record<string, (labels: DemoStepGuideLabels) => DemoStepGuide> = {
  discover: ({ navCta }) => ({
    what: "Your website, with inquiries wired straight into MudKitchen.",
    tryThis: `Tap “${navCta}” at the top.`,
  }),
  inquiry: ({ submitLabel }) => ({
    what: "Every inquiry lands in your admin, not an inbox.",
    tryThis: `Fill it in and tap “${submitLabel}”, then Next.`,
  }),
  "view-lead": () => ({
    what: "New inquiries show up here with the family’s details.",
  }),
  "send-application-link": () => ({
    what: "Accepting a family sends them their enrollment checklist.",
  }),
  "parent-enrollment": () => ({
    what: "Families finish forms, agreements and fees in one checklist.",
  }),
  "parent-pays-tuition": () => ({
    what: "Parents see what’s due and pay, or turn on autopay.",
    tryThis: "Switch between children at the top.",
  }),
  "teacher-attendance": () => ({
    what: "Teachers mark attendance from the class roster.",
    tryThis: "Tap Not marked to see who’s left.",
  }),
  "mobile-app": () => ({
    what: "The same tools in the MudKitchen app for families, staff and admins.",
    tryThis: "Tap the arrows to flip through the screens.",
  }),
};

/** Step 2 has many ids (`inquire`, `discovery-call`, `schedule-tour`, …); they're all the inquiry form. */
function guideKey(step: DemoWalkthroughStep): string {
  if (GUIDES[step.id]) return step.id;
  if ((step.preview ?? "website") === "website" && step.scrollTarget === "form") return "inquiry";
  return step.id;
}

/** The guide for a step, or null (the contact step speaks for itself). `previewHint` overrides `what`. */
export function getStepGuide(
  step: DemoWalkthroughStep | undefined,
  labels: DemoStepGuideLabels,
): DemoStepGuide | null {
  if (!step) return null;
  const build = Object.prototype.hasOwnProperty.call(GUIDES, guideKey(step)) ? GUIDES[guideKey(step)] : null;
  const guide = build ? build(labels) : null;
  if (step.previewHint) return { what: step.previewHint, tryThis: guide?.tryThis };
  return guide;
}
