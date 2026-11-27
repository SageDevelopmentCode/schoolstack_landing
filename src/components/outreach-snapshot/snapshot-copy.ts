import { STORY_COPY } from "@/components/home/home-copy";

/** Copy for the free "Family experience snapshot" page (/snapshot/<slug>/<token>). */
export const SNAPSHOT_COPY = {
  title: (schoolName: string) => schoolName,
  intro: (schoolName: string) =>
    `A close look at what a family runs into on ${schoolName}'s website today, from finding tuition to staying in the loop, and what we'd do about each one.`,
  preparedBy: "Prepared by Julius at Sage Field",
  todayLabel: "What a family sees today",
  impactLabel: "Why it matters",
  countLabel: (n: number) => `${n} things we noticed`,
  toolsKicker: "Your tools today",
  toolsTitle: (n: number) => `Families use ${n} separate tools today`,
  toolsOneLogin: "With MudKitchen",
  toolsOneLoginBody: "One login for families, one admin for you.",
  toolsNetworkNote: (network: string) => `via ${network}`,
  openInDemo: "See it in your demo",
  sourceLabel: "Source",
  pageSpeedTitle: "Mobile speed",
  pageSpeedBody: "Google PageSpeed Insights, mobile score out of 100.",
  proofKicker: STORY_COPY.location,
  proofLead: STORY_COPY.headlineLead,
  proofAccent: STORY_COPY.headlineAccent,
  proofBody: STORY_COPY.body,
  proofStory: "Read the story",
  proofStoryHref: STORY_COPY.href,
  ctaTitle: "Want a walkthrough of your version?",
  ctaBody: "I'll show you around it in about 20 minutes, using your school's programs.",
  ctaBook: "Book a 20-minute walkthrough",
  /** Fits on one line in the 260px side rail. */
  ctaBookShort: "Book a 20-min walkthrough",
  ctaDemo: "Open your demo",
  contactLead: "Or reach me directly",
  footnote:
    "Everything above came from public pages on your site, read on the dates shown. If anything has changed, just tell me. \"In your demo\" means you can click through it today; \"We can set this up for you\" means it's part of what we'd set up or build with you.",
} as const;
