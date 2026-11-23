/**
 * Link previews (Open Graph / Twitter cards): the image a chat app or social site shows when someone
 * pastes one of our links. One 1200×630 card per public page, designed in the Marketing Studio
 * ("Avatars & icons" → "Link previews", `brand-marks/marks-link-previews.tsx`), exported as PNGs into
 * `public/og/` and picked up by `pageMetadata` (`src/lib/metadata.ts`) through `linkPreviewImage`.
 *
 * Every word on a card comes from the page's own copy (Garden rule: no invented claims).
 * After changing a card: re-export it from the studio, run `node scripts/optimize-og-images.mjs`,
 * and bump `OG_VERSION` so iMessage, Slack and Facebook fetch the new image instead of their cache.
 */
import { ABOUT_HERO_COPY } from "@/components/about-garden/about-copy";
import { BLOG_COPY } from "@/components/blog/blog-copy";
import { CUSTOMERS_COPY } from "@/components/customers/customers-copy";
import { FREE_PREVIEW_COPY, FREE_PREVIEW_PAGE_PATH } from "@/components/free-preview/free-preview-copy";
import { GIFT_CARD_PAGE_COPY } from "@/lib/marketing/gift-card-offer";
import { FEATURES_INDEX_COPY } from "@/lib/marketing/features/features-copy";

/** Bump after re-exporting any card: crawlers cache previews by image URL. */
export const OG_VERSION = "3";

export const LINK_PREVIEW_SIZE = { width: 1200, height: 630 } as const;

export type LinkPreviewCard = {
  /** Studio id and PNG file name (`public/og/<id>.png`). */
  id: string;
  /** Short name in the studio list. */
  title: string;
  /** Routes that use this card. */
  paths: string[];
  /** Small pill above the headline. */
  eyebrow?: string;
  /** Headline, then an optional coloured accent phrase and a plain tail. */
  lead: string;
  accent?: string;
  tail?: string;
  /** One supporting line under the headline. */
  sub?: string;
  /** Short sticker tags under the headline (instead of `sub`). */
  chips?: string[];
  /** Alt text for the image. */
  alt: string;
};

const TOOL_EYEBROW = "Free tool";

export const LINK_PREVIEW_CARDS: LinkPreviewCard[] = [
  {
    id: "home",
    title: "Home",
    paths: ["/"],
    // The tagline from the original card and the Covers.
    lead: "The complete operating system",
    accent: "for microschools",
    sub: "Enrollment · Billing · Parent communication · Daily operations",
    alt: "MudKitchen — The complete operating system for microschools",
  },
  {
    id: "get-started",
    title: "Book a demo",
    paths: ["/get-started"],
    eyebrow: "Book a Demo",
    // GetStartedDemoFlow scheduler step.
    lead: "Pick a time",
    accent: "that works.",
    sub: "We'll walk through the workflows that matter most to your school.",
    alt: "Book a demo of MudKitchen",
  },
  {
    id: "free-preview",
    title: "Free preview",
    paths: [FREE_PREVIEW_PAGE_PATH],
    eyebrow: "Free custom preview",
    lead: FREE_PREVIEW_COPY.hero.lead,
    accent: FREE_PREVIEW_COPY.hero.accent,
    chips: [...FREE_PREVIEW_COPY.hero.ticks],
    alt: `${FREE_PREVIEW_COPY.hero.lead} ${FREE_PREVIEW_COPY.hero.accent}`,
  },
  {
    id: "try",
    title: "Try for free",
    paths: ["/try"],
    lead: "Try MudKitchen",
    accent: "for free",
    sub: "Create a free MudKitchen school dashboard.",
    alt: "Try MudKitchen for free",
  },
  {
    id: "about",
    title: "About",
    paths: ["/about"],
    eyebrow: ABOUT_HERO_COPY.eyebrow,
    lead: ABOUT_HERO_COPY.headlineLead,
    accent: ABOUT_HERO_COPY.headlineAccent,
    alt: `${ABOUT_HERO_COPY.headlineLead} ${ABOUT_HERO_COPY.headlineAccent} — About MudKitchen`,
  },
  {
    id: "features",
    title: "Features",
    paths: ["/features"],
    eyebrow: FEATURES_INDEX_COPY.eyebrow,
    lead: FEATURES_INDEX_COPY.headlineLead,
    accent: FEATURES_INDEX_COPY.headlineAccent,
    chips: ["Admins", "Families", "Staff"],
    alt: `MudKitchen features — ${FEATURES_INDEX_COPY.headlineLead} ${FEATURES_INDEX_COPY.headlineAccent}`,
  },
  {
    id: "customers",
    title: "Customer stories",
    paths: ["/customers"],
    eyebrow: "Customer stories",
    lead: CUSTOMERS_COPY.headlineLead,
    accent: CUSTOMERS_COPY.headlineAccent,
    alt: `MudKitchen customer stories — ${CUSTOMERS_COPY.headlineLead} ${CUSTOMERS_COPY.headlineAccent}`,
  },
  {
    id: "sagefield",
    title: "Sage Field case study",
    paths: ["/customers/sagefield"],
    eyebrow: "Customer Story",
    // The original Sage Field card's headline.
    lead: "Sage Field:",
    accent: "0 to 35 students",
    tail: "in under 3\u00a0months",
    sub: "Sage Field · Round Rock, TX",
    alt: "Sage Field Case Study — MudKitchen",
  },
  {
    id: "tools",
    title: "Free tools",
    paths: ["/tools"],
    eyebrow: "Free tools",
    lead: "Free tools",
    accent: "for your school",
    chips: ["Enrollment", "Tuition", "Operations"],
    alt: "Free tools for your school — MudKitchen",
  },
  {
    id: "how-many-students",
    title: "How many students?",
    paths: ["/how-many-students"],
    eyebrow: TOOL_EYEBROW,
    lead: "How many students",
    accent: "do I need?",
    sub: "Find the enrollment needed to cover your school’s costs and pay yourself.",
    alt: "How many students do I need? A free tool from MudKitchen",
  },
  {
    id: "tuition-planner",
    title: "Tuition planner",
    paths: ["/tuition-planner"],
    eyebrow: TOOL_EYEBROW,
    lead: "What if I change",
    accent: "tuition?",
    sub: "Try a different tuition or enrollment and compare the annual revenue with your current plan.",
    alt: "What if I change tuition? A free tool from MudKitchen",
  },
  {
    id: "ops-check",
    title: "Microschool Ops Check",
    paths: ["/microschool-ops-check"],
    eyebrow: "Microschool Ops Check",
    lead: "What's holding",
    accent: "your school back?",
    sub: "Look at admissions, tuition, paperwork, and communication to find your next practical step.",
    alt: "Microschool Ops Check — MudKitchen",
  },
  {
    id: "blog",
    title: "Blog",
    paths: ["/blog"],
    eyebrow: BLOG_COPY.eyebrow,
    lead: BLOG_COPY.headlineLead,
    accent: BLOG_COPY.headlineAccent,
    alt: `MudKitchen blog — ${BLOG_COPY.headlineLead} ${BLOG_COPY.headlineAccent}`,
  },
  {
    id: "download",
    title: "Download the app",
    paths: ["/download"],
    eyebrow: "MudKitchen mobile",
    lead: "Your school,",
    accent: "in your pocket.",
    sub: "Download the MudKitchen app for iPhone today.",
    alt: "Your school, in your pocket — the MudKitchen app",
  },
  {
    id: "gift-card",
    title: "Gift card offer",
    paths: ["/gift-card"],
    eyebrow: GIFT_CARD_PAGE_COPY.heroPill,
    lead: GIFT_CARD_PAGE_COPY.heroLead,
    accent: GIFT_CARD_PAGE_COPY.heroAccent,
    sub: "Terms apply.",
    alt: `${GIFT_CARD_PAGE_COPY.heroLead} ${GIFT_CARD_PAGE_COPY.heroAccent}`,
  },
  {
    id: "demo-school",
    title: "Product demo",
    paths: ["/demo-school"],
    eyebrow: "Product Demo",
    lead: "Explore MudKitchen's",
    accent: "admin, teacher, and parent dashboards",
    alt: "MudKitchen product demo",
  },
  {
    id: "website-demo",
    title: "School website demo",
    paths: ["/website-demo"],
    eyebrow: "School Website Demo",
    lead: "Explore a sample",
    accent: "microschool website",
    tail: "built with MudKitchen.",
    alt: "A sample microschool website built with MudKitchen",
  },
];

export const DEFAULT_LINK_PREVIEW_ID = "home";

/** Blog posts share the blog card. */
function cardIdForPath(path: string | undefined): string {
  if (!path) return DEFAULT_LINK_PREVIEW_ID;
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const exact = LINK_PREVIEW_CARDS.find((card) => card.paths.includes(clean));
  if (exact) return exact.id;
  if (clean.startsWith("/blog/")) return "blog";
  if (clean.startsWith("/features/")) return "features";
  return DEFAULT_LINK_PREVIEW_ID;
}

export function linkPreviewCard(path: string | undefined): LinkPreviewCard {
  const id = cardIdForPath(path);
  return LINK_PREVIEW_CARDS.find((card) => card.id === id) ?? LINK_PREVIEW_CARDS[0];
}

/** Site-relative image URL for a card (resolved against `metadataBase`). */
export function linkPreviewImageUrl(card: LinkPreviewCard): string {
  return `/og/${card.id}.png?v=${OG_VERSION}`;
}
