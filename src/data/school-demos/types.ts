export type DemoIconName =
  | "sprout"
  | "heart"
  | "palette"
  | "treePine"
  | "leaf"
  | "graduationCap"
  | "users"
  | "compass"
  | "bookOpen"
  | "shield"
  | "award"
  | "sparkles";

export interface DemoTheme {
  primary: string;
  primaryHover: string;
  dark: string;
  darkHover: string;
  lightBg: string;
  lightBorder: string;
  muted: string;
  badgeBg: string;
  accentText: string;
  pageBg?: string;
}

export interface DemoStat {
  value: string;
  label: string;
}

export interface DemoProgram {
  badge: string;
  title: string;
  teaser: string;
  desc: string;
  details: string[];
  image: string;
  accent: string;
  accentBg: string;
}

export interface DemoTimelineStep {
  time: string;
  activity: string;
  desc: string;
  image: string;
}

export interface DemoTestimonial {
  quote: string;
  name: string;
  detail: string;
  stars: number;
  avatar: string;
}

export interface DemoTrustItem {
  title: string;
  desc: string;
  icon?: DemoIconName;
}

export interface DemoParentFitCard {
  title: string;
  desc: string;
}

export interface DemoPillar {
  icon: DemoIconName;
  title: string;
  desc: string;
}

export interface DemoFaq {
  q: string;
  a: string;
}

export interface DemoFormOption {
  value: string;
  label: string;
}

export interface DemoMissionSection {
  type: "mission";
  eyebrow: string;
  heading: string;
  headingAccent: string;
  paragraphs: string[];
  quote: string;
  quoteAttribution: string;
  mainImage: string;
  secondaryImage: string;
  statBadge?: { value: string; label: string };
  floatBadge?: { title: string; subtitle: string; icon: DemoIconName };
}

export interface DemoParentFitSection {
  type: "parentFit";
  eyebrow: string;
  heading: string;
  cards: DemoParentFitCard[];
  mainImage: string;
  secondaryImage: string;
}

export interface DemoTestimonialsSection {
  type: "testimonials";
  eyebrow: string;
  heading: string;
  subtitle: string;
  items: DemoTestimonial[];
}

export interface DemoTrustSection {
  type: "trust";
  eyebrow: string;
  heading: string;
  subtitle: string;
  items: DemoTrustItem[];
}

export interface DemoLearningMode {
  label: string;
  title: string;
  desc: string;
  icon: DemoIconName;
}

export interface DemoLearningModesSection {
  type: "learningModes";
  eyebrow: string;
  heading: string;
  subtitle?: string;
  modes: DemoLearningMode[];
  flexFriday?: { title: string; desc: string };
}

export interface DemoFruitOfSpirit {
  name: string;
  desc: string;
}

export interface DemoFruitsOfSpiritSection {
  type: "fruitsOfSpirit";
  eyebrow: string;
  heading: string;
  intro: string;
  quote?: string;
  fruits: DemoFruitOfSpirit[];
}

export interface DemoNatureArtJoyPillar {
  label: string;
  title: string;
  desc: string;
  icon: DemoIconName;
}

export interface DemoNatureArtJoySection {
  type: "natureArtJoy";
  eyebrow: string;
  heading: string;
  pillars: DemoNatureArtJoyPillar[];
  trustLine?: string;
}

export interface DemoHybridDay {
  label: string;
  title: string;
  desc: string;
}

export interface DemoHybridRhythmSection {
  type: "hybridRhythm";
  eyebrow: string;
  heading: string;
  subtitle: string;
  tagline?: string;
  campusDays: DemoHybridDay[];
  homeDays: DemoHybridDay[];
  serviceNote?: string;
}

export interface DemoValuePillar {
  title: string;
  desc: string;
  icon: DemoIconName;
}

export interface DemoValuePillarsSection {
  type: "valuePillars";
  eyebrow: string;
  heading: string;
  tagline?: string;
  pillars: DemoValuePillar[];
}

export interface DemoPhilosophyQuoteSection {
  type: "philosophyQuote";
  eyebrow: string;
  heading: string;
  quote: string;
  attribution?: string;
  body: string;
  ctaLabel: string;
}

export interface DemoFarmPath {
  title: string;
  desc: string;
  icon: DemoIconName;
  image?: string;
}

export interface DemoFarmExperienceSection {
  type: "farmExperience";
  eyebrow: string;
  heading: string;
  subtitle: string;
  paths: DemoFarmPath[];
}

export type DemoSignatureSection =
  | DemoLearningModesSection
  | DemoFruitsOfSpiritSection
  | DemoNatureArtJoySection
  | DemoHybridRhythmSection
  | DemoValuePillarsSection
  | DemoPhilosophyQuoteSection
  | DemoFarmExperienceSection;

export interface DemoSectionVisibility {
  showMosaic?: boolean;
  showStrip?: boolean;
  showParallax?: boolean;
  showFounder?: boolean;
  showClosingCta?: boolean;
}

export interface SchoolWebsiteDemoConfig {
  slug: string;
  schoolName: string;
  theme: DemoTheme;
  logo: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    /** When set, renders a text wordmark instead of an image. */
    text?: string;
    textClassName?: string;
    /** Optional class for the nav logo on the dark hero (e.g. brightness-0 invert). */
    logoOnDarkClassName?: string;
  };
  hero: {
    eyebrow: string;
    /** When "announcementBar", eyebrow renders as a full-width top bar instead of a hero badge. */
    eyebrowPlacement?: "hero" | "announcementBar";
    headline: string[];
    headlineAccentLine?: number;
    /** Override default hero h1 Tailwind classes. */
    headlineClassName?: string;
    /** Override accent line color on dark hero (defaults to --demo-primary-light). */
    headlineAccentClassName?: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    navCta: string;
    navLinks: string[];
    backgroundImage: string;
    floatingImages: string[];
    imageAlt: string;
    trustBadges?: string[];
    tagline?: string;
    secondaryCtaTarget?: "programs" | "signature" | "form";
  };
  sections?: DemoSectionVisibility;
  stats: DemoStat[];
  welcome: DemoMissionSection | DemoParentFitSection;
  signatureSection?: DemoSignatureSection;
  marquee: string[];
  programs: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    ctaLabel: string;
    items: DemoProgram[];
  };
  mosaicImages: string[];
  quote: {
    text: string[];
    attribution: string;
    backgroundImage: string;
  };
  stripImages: string[];
  timeline: {
    eyebrow: string;
    heading: string;
    headingSub: string;
    steps: DemoTimelineStep[];
  };
  socialProof: DemoTestimonialsSection | DemoTrustSection;
  founder: {
    eyebrow: string;
    heading: string;
    headingAccent: string;
    paragraphs: string[];
    credentials: string[];
    quote: string;
    quoteAttribution: string;
    image: string;
    imageBadge: { label: string; value: string };
    name: string;
    title: string;
  };
  parallax: {
    eyebrow: string;
    heading: string[];
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    backgroundImage: string;
  };
  pillars: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    items: DemoPillar[];
  };
  form: {
    sidebarQuote: string;
    sidebarImage: string;
    eyebrow: string;
    heading: string;
    description: string;
    submitLabel: string;
    disclaimer: string;
    successEmoji: string;
    successTitle: string;
    successMessage: string;
    trustNote?: string;
    programOptions: DemoFormOption[];
    studentFields?: {
      namePlaceholder: string;
      gradePlaceholder: string;
      gradeOptions: DemoFormOption[];
    };
  };
  faq: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    items: DemoFaq[];
  };
  closingCta: {
    eyebrow: string;
    heading: string;
    headingAccent: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  footer: {
    tagline: string;
    links: string[];
    copyright: string;
    poweredBy: string;
  };
}
