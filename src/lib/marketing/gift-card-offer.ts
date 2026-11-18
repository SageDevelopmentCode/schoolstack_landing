/**
 * The $200 Amazon gift card offer: the one source of truth for the /gift-card
 * page, its legal terms (src/content/legal/gift-card-promotion.ts) and the paid
 * ads in /admin/marketing (ads/ad-kit.tsx). Change a date or amount here and in
 * the legal terms together.
 *
 * The condition (start a paid plan) must appear in every main claim, not only
 * behind an asterisk.
 */

export const GIFT_CARD_PAGE_PATH = "/gift-card";
export const GIFT_CARD_TERMS_PATH = "/gift-card/terms";

/** Promo id the /gift-card booking flow sends with a demo request. */
export const GIFT_CARD_PROMO_ID = "gift-card-200";

/** Promo ids the demo-requests API accepts, and the note it writes first in the prep notes. */
export const DEMO_PROMO_NOTES = {
  [GIFT_CARD_PROMO_ID]: "Promo: $200 Amazon gift card (/gift-card)",
} as const;

export type DemoPromoId = keyof typeof DEMO_PROMO_NOTES;

export function isDemoPromoId(value: unknown): value is DemoPromoId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(DEMO_PROMO_NOTES, value);
}

export const GIFT_CARD_OFFER = {
  amount: "$200",
  card: "Amazon.com eGift card",
  demoDeadline: "December 31, 2026",
  demoDeadlineShort: "Dec 31",
  signupWindowDays: 30,
  deliveryBusinessDays: 10,
  eligibility:
    "Founders, owners and directors of a US microschool, small private school or learning program, including programs launching within the next 12 months.",
  /** Short ad strings (in-image). */
  chip: "$200 Amazon gift card when you sign up",
  line: "$200 Amazon gift card when you sign up",
  fine: "Start a paid plan within 30 days of a demo held by Dec 31, 2026. Terms: trymudkitchen.com/gift-card",
} as const;

export type GiftCardStep = {
  n: string;
  title: string;
  body: string;
};

export const GIFT_CARD_STEPS: readonly GiftCardStep[] = [
  {
    n: "01",
    title: "Attend a demo",
    body: "Book and attend a MudKitchen demo, held by December 31, 2026.",
  },
  {
    n: "02",
    title: "Start a paid plan",
    body: "Start a paid MudKitchen plan within 30 days of your demo. It counts once your first payment goes through.",
  },
  {
    n: "03",
    title: "Get your gift card",
    body: "We email a $200 Amazon.com eGift card to the address you booked with, within 10 business days of that first payment.",
  },
] as const;

export const GIFT_CARD_PAGE_COPY = {
  heroPill: "Holiday offer · ends Dec 31",
  heroLead: "Book a demo. Start your plan.",
  heroAccent: "Get a $200 Amazon gift card.",
  heroBody:
    "See how MudKitchen runs enrollment, tuition, parent messages and attendance for your school. If you start a paid plan within 30 days of your demo, we'll send you a $200 Amazon gift card.",
  heroCta: "Choose a time",
  termsLink: "Read the full terms",
  stepsLabel: "How the gift card works",
  productPill: "What you'd be signing up for",
  finePrintPill: "The fine print",
  finePrintLead: "The fine print,",
  finePrintAccent: "in plain words.",
  finePrintBody: "Everything that decides whether you get the card, without the legalese. The full terms are the final word.",
  finePrintCards: [
    { title: "Who qualifies", body: "Founders, owners and directors of a US microschool, small private school or learning program, including programs launching within the next 12 months." },
    { title: "What counts as signing up", body: "A paid MudKitchen plan with its first payment processed. A free account on its own doesn't count." },
    { title: "The deadlines", body: "Your demo must happen by December 31, 2026. Your paid plan must start within 30 days of that demo." },
    { title: "Limits", body: "One gift card per person and one per school. Current MudKitchen customers aren't eligible." },
  ],
  faqPill: "Gift card FAQ",
  faqHeading: "Questions about the gift card",
  faqSub: "The short answers. If anything here differs from the full terms, the terms win.",
  closingLead: "Ready when",
  closingAccent: "you are.",
  closingBody: "Pick a time that works. We'll walk through the workflows that matter most to your school.",
  closingCta: "Choose a time",
} as const;

export const GIFT_CARD_FAQ = [
  {
    question: "Do I get the gift card just for taking the demo?",
    answer:
      "No. The demo is the first step. You get the $200 Amazon gift card when you start a paid MudKitchen plan within 30 days of your demo and your first payment goes through.",
  },
  {
    question: "Who qualifies?",
    answer:
      "Founders, owners and directors of a US microschool, small private school or learning program, including programs launching within the next 12 months. Current MudKitchen customers aren't eligible.",
  },
  {
    question: "When and how will I get it?",
    answer:
      "We email a $200 Amazon.com eGift card to the address you booked your demo with, within 10 business days of your first payment.",
  },
  {
    question: "My co-founder wants to join the demo. Do we each get one?",
    answer: "Bring them along. The offer is limited to one gift card per school, and one per person.",
  },
  {
    question: "What if my demo is after December 31?",
    answer:
      "The demo has to be held by December 31, 2026 to qualify. If no time before then works, book the earliest one you can and we'll still show you everything.",
  },
  {
    question: "What if my first payment is refunded or reversed?",
    answer:
      "If the first payment is refunded, charged back or fails before we send the card, the gift card isn't issued. See the full terms for details.",
  },
] as const;
