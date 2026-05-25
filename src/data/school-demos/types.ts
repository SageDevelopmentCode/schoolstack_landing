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

export interface SchoolWebsiteDemoConfig {
  slug: string;
  schoolName: string;
  theme: DemoTheme;
  logo: { src: string; alt: string; width?: number; height?: number };
  hero: {
    eyebrow: string;
    /** When "announcementBar", eyebrow renders as a full-width top bar instead of a hero badge. */
    eyebrowPlacement?: "hero" | "announcementBar";
    headline: string[];
    headlineAccentLine?: number;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    navCta: string;
    navLinks: string[];
    backgroundImage: string;
    floatingImages: string[];
    imageAlt: string;
  };
  stats: DemoStat[];
  welcome: DemoMissionSection | DemoParentFitSection;
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
