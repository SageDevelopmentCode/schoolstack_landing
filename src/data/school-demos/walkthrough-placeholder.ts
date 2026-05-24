export interface DemoWalkthroughStep {
  id: string;
  title: string;
  description: string;
  talkingPoint?: string;
}

export const athenaWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "hero",
    title: "Hero & positioning",
    description:
      "Lead with grades 6–12, Fall 2026 launch, and the microschool promise — smaller, wiser, more personal.",
    talkingPoint: "Name the school, audience, and primary CTA in the first scroll.",
  },
  {
    id: "parent-fit",
    title: "Parent fit",
    description:
      "Help parents self-identify quickly — overwhelmed by large schools, independent learners, socially thoughtful students.",
    talkingPoint: "Parents should know within 10 seconds if this is for their child.",
  },
  {
    id: "programs",
    title: "Program options",
    description:
      "Full-time and part-time pathways with clear pricing — make the model easy to understand without leading with cost.",
    talkingPoint: "Three cards: full-time, part-time 5 days, part-time 4 days.",
  },
  {
    id: "daily-rhythm",
    title: "Daily rhythm",
    description:
      "Walk through Activation, Learning, Skill Building, Flex, and Flex Friday — make the model concrete.",
    talkingPoint: "Parents new to microschools need to see what a day actually looks like.",
  },
  {
    id: "founder",
    title: "Founder credibility",
    description:
      "Mily Pérez's 22 years in education, Texas certification, and premier school experience build trust early.",
    talkingPoint: "Founder story should appear within the first 3–4 scrolls.",
  },
  {
    id: "admissions",
    title: "Admissions CTA",
    description:
      "Discovery call and inquiry form — low-friction next step repeated throughout the page.",
    talkingPoint: "End every section thinking: what's the obvious next step for this parent?",
  },
];
