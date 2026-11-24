/**
 * What MudKitchen replaces each third-party tool with, keyed by the tool name exactly as
 * `detectTools` (src/lib/outreach/site-audit.ts) returns it. Used by the site audit's
 * "Tools families juggle" section and by outreach research.
 *
 * `keep: true` means we work alongside it rather than replace it (funding platforms, donations,
 * network platforms). `replacedBy` then lists the capability that connects to it, if any.
 */
import type { SnapshotArea } from "@/data/outreach/types";
import {
  MUDKITCHEN_CAPABILITIES,
  isCustomCapability,
  type CapabilityId,
} from "@/data/outreach/mudkitchen-capabilities";

export interface ToolReplacement {
  /** The family moment this tool shows up in. */
  moment: SnapshotArea;
  replacedBy: CapabilityId[];
  keep?: true;
  note?: string;
}

const FORM: ToolReplacement = { moment: "apply", replacedBy: ["online-application", "admissions-pipeline"] };
const TOUR: ToolReplacement = { moment: "tour", replacedBy: ["tour-self-booking"] };
const TUITION_PAY: ToolReplacement = { moment: "pay", replacedBy: ["parent-billing", "card-and-ach", "autopay"] };
const CLASS_PAY: ToolReplacement = { moment: "pay", replacedBy: ["class-billing", "card-and-ach"] };
const SIGNING: ToolReplacement = { moment: "enroll", replacedBy: ["enrollment-agreements", "forms-documents"] };
const NEWSLETTER: ToolReplacement = { moment: "updates", replacedBy: ["newsletters"] };
const CHAT: ToolReplacement = { moment: "updates", replacedBy: ["messaging"] };

export const TOOL_REPLACEMENTS: Record<string, ToolReplacement> = {
  // Applying
  "Google Forms": FORM,
  Jotform: FORM,
  Typeform: FORM,
  "Cognito Forms": FORM,
  Wufoo: FORM,
  "HubSpot Forms": FORM,
  Formstack: FORM,
  Tally: FORM,
  "Google Docs/Drive form": FORM,
  // Visiting
  Calendly: TOUR,
  "Acuity Scheduling": TOUR,
  "Google Calendar booking": TOUR,
  // Paying tuition
  PayPal: TUITION_PAY,
  Venmo: TUITION_PAY,
  Zelle: TUITION_PAY,
  "Cash App": TUITION_PAY,
  Square: TUITION_PAY,
  "Square Online store": TUITION_PAY,
  Stripe: TUITION_PAY,
  "WooCommerce cart/checkout": { ...TUITION_PAY, note: "the shop is also how families apply (application fee as a cart item)" },
  "Smart Tuition": { ...TUITION_PAY, replacedBy: ["parent-billing", "card-and-ach", "autopay", "tuition-rate-plans"] },
  "Tuition Express": TUITION_PAY,
  "QuickBooks invoices": { ...TUITION_PAY, note: "accounting-export keeps their books in QuickBooks" },
  "Wave invoices": TUITION_PAY,
  FACTS: { moment: "pay", replacedBy: ["parent-billing", "card-and-ach", "autopay", "tuition-rate-plans"] },
  // Paying for classes and events
  Omella: CLASS_PAY,
  Eventbrite: CLASS_PAY,
  Jackrabbit: { ...CLASS_PAY, note: "class registration and billing" },
  Sawyer: { ...CLASS_PAY, note: "class registration and billing" },
  // Enrollment paperwork
  DocuSign: SIGNING,
  "Dropbox Sign": SIGNING,
  PandaDoc: SIGNING,
  Blackbaud: { moment: "enroll", replacedBy: ["enrollment-checklist", "enrollment-agreements", "admissions-pipeline"] },
  // Staying in the loop
  "Google Calendar": { moment: "updates", replacedBy: ["calendar"] },
  Brightwheel: { moment: "updates", replacedBy: ["messaging", "photos", "attendance"] },
  Procare: { moment: "updates", replacedBy: ["attendance", "messaging", "photos"] },
  "Transparent Classroom": { moment: "updates", replacedBy: ["messaging", "photos", "student-records"] },
  ParentSquare: { moment: "updates", replacedBy: ["messaging", "bulletin"] },
  Remind: { moment: "updates", replacedBy: ["messaging", "mobile-app"] },
  ClassDojo: { moment: "updates", replacedBy: ["messaging", "photos"] },
  Seesaw: { moment: "updates", replacedBy: ["photos", "messaging"] },
  Bloomz: { moment: "updates", replacedBy: ["messaging", "calendar", "committees"] },
  Konstella: { moment: "updates", replacedBy: ["messaging", "committees"] },
  Newton: { moment: "updates", replacedBy: ["messaging", "bulletin", "mobile-app"] },
  SignUpGenius: { moment: "updates", replacedBy: ["committees"] },
  Mailchimp: NEWSLETTER,
  Substack: NEWSLETTER,
  Flodesk: NEWSLETTER,
  "Constant Contact": NEWSLETTER,
  GroupMe: CHAT,
  "WhatsApp group": CHAT,
  Wonderschool: {
    moment: "pay",
    replacedBy: ["parent-billing", "autopay", "card-and-ach"],
    note: "Wonderschool also lists the program; we replace its billing and parent app",
  },
  // Kept: we work alongside these
  Odyssey: { moment: "pay", replacedBy: ["third-party-payer-billing"], keep: true, note: "funding platform; use third-party-payer-billing" },
  ClassWallet: { moment: "pay", replacedBy: ["third-party-payer-billing"], keep: true, note: "funding platform; use third-party-payer-billing" },
  Givebutter: { moment: "pay", replacedBy: [], keep: true, note: "donations" },
  Zeffy: { moment: "pay", replacedBy: [], keep: true, note: "donations" },
  Prenda: { moment: "apply", replacedBy: [], keep: true, note: "network platform" },
};

/** "Online application with saved drafts (in MudKitchen)" or "... (we'd build)". */
export function capabilityLabel(id: CapabilityId): string {
  return `${MUDKITCHEN_CAPABILITIES[id].label} (${isCustomCapability(id) ? "we'd build" : "in MudKitchen"})`;
}

/** True when replacing the tool needs at least one capability we'd build. */
export function needsCustomWork(replacement: ToolReplacement): boolean {
  return replacement.replacedBy.some((id) => isCustomCapability(id));
}
