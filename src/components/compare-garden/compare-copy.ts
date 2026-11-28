/** Copy for /compare and /compare/[rival]. Facts come from compare.ts (the feature comparison data). */

export const COMPARE_INDEX_COPY = {
  seoTitle: "Microschool software compared: MudKitchen vs Brightwheel and more",
  seoDescription:
    "How MudKitchen compares with Brightwheel, Playground and Transparent Classroom for running a microschool, feature by feature, with a source for every claim.",
  note: "side by side ↓",
  headlineLead: "Microschool software,",
  headlineAccent: "compared honestly.",
  body: "Most school software is built for childcare centers or Montessori schools. Here's how MudKitchen lines up against the platforms microschool founders ask us about, feature by feature, with a link to the source behind every claim about another product.",
  cardCta: "See the full comparison",
  tallyYes: "clearly offers",
  tallyPartial: "partly offers",
  tallyNo: "doesn't offer",
  tallyUnknown: "unconfirmed",
  outOf: "of {total} microschool capabilities",
  featuresLink: "Or browse every MudKitchen feature",
} as const;

export const COMPARE_RIVAL_COPY = {
  backLink: "All comparisons",
  updated: "Updated",
  note: "the short answer ↓",
  headlineLead: "MudKitchen vs {rival}",
  headlineAccent: "for microschools.",
  bookDemo: "Book a Demo",
  seeTable: "See the full table",
  differencesLead: "Where they",
  differencesAccent: "differ.",
  differencesBody:
    "Capabilities MudKitchen has where {rival} only partly does or doesn't, according to {rival}'s own public pages.",
  noDifferences: "We didn't find a capability where {rival} clearly falls short. The differences are in who it's built for and how it fits a microschool.",
  tableLead: "Feature by",
  tableAccent: "feature.",
  tableBody: "Every capability a microschool uses, grouped by feature. Each {rival} claim links to its source.",
  capability: "Capability",
  featureLink: "{feature} in MudKitchen",
  checked: "{rival} checked {date} from its public website. Details can change; follow the links to confirm.",
  sources: "Sources",
  faqHeading: "MudKitchen vs {rival} questions",
  otherComparisons: "Other comparisons",
} as const;

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}
