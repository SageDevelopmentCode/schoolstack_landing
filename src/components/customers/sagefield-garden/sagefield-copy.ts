/**
 * Sage Field case study copy. Every string is moved verbatim from the
 * previous Bright sections (src/components/sections/customers/sagefield/).
 */
import { BookOpen, Globe, LayoutDashboard, MapPin, Settings, UserCheck, Users, type LucideIcon } from "lucide-react";

export const SAGEFIELD_SITE_URL = "https://www.sagefield.co/";
export const SAGEFIELD_LOGO_SRC = "/images/SageFieldLogo.png";

export const HERO_COPY = {
  pill: "Customer Story",
  meta: "Sage Field · Round Rock, TX",
  site: "sagefield.co",
  headlineLead: "How Sage Field launched and grew from",
  headlineAccent: "0 to 35 students",
  headlineTail: "in under 3 months.",
  body: "Sage Field is an outdoor-focused private microschool in Round Rock, Texas. We helped power the launch with the website, enrollment experience, tuition setup, staff workflows, family communication, and back-office operations needed to run a real school from day one.",
  primaryCta: "Book a demo",
  insideCta: "See what's inside the platform",
  liveCta: "View their live site",
};

export const PROOF_ITEMS: { icon: LucideIcon; text: string }[] = [
  { icon: MapPin, text: "Real private microschool in Round Rock, Texas." },
  { icon: Users, text: "Ages 4–11, with live programs and tuition published online." },
  { icon: Globe, text: "Website, enrollment, and operations supporting an active launch." },
];

export const CHALLENGE_COPY = {
  eyebrow: "The challenge",
  headlineLead: "They weren't looking for more software.",
  headlineAccent: "They needed a school to work.",
  facts: [
    { label: "School", value: "Sage Field" },
    { label: "Location", value: "Round Rock, Texas" },
    { label: "Ages served", value: "4–11" },
    { label: "Result", value: "0 → 35 students in under 3 months" },
  ],
  paragraphs: [
    "Launching a microschool means more than building a website. You need a way to present the school clearly, capture interest, guide families toward tours and enrollment, manage tuition, support teachers, and keep administrators organized once students start arriving.",
    "Sage Field's public site already shows many of those live operational pieces — including programs, tuition, team, contact details, and enrollment pathways — which makes this story more credible than a generic “coming soon” example.",
    "The system didn't just help them launch. It gave them the operational confidence to take on students, communicate with families, and grow — without rebuilding their stack as they scaled.",
  ],
  stats: [
    { number: "35", label: "Students enrolled" },
    { number: "< 3", label: "Months to launch" },
    { number: "1", label: "Unified platform" },
  ],
};

export type TimelineStep = {
  number: string;
  icon: LucideIcon;
  title: string;
  outcome: string;
  body: string;
  details: string[];
};

export const TIMELINE_COPY = {
  eyebrow: "How it happened",
  headlineLead: "From idea to operating school.",
  headlineAccent: "Four steps.",
  body: "Each phase of the Sage Field launch was supported by a matching operational surface — so nothing fell through the cracks.",
};

export const STEPS: TimelineStep[] = [
  {
    number: "01",
    icon: Globe,
    title: "Launch",
    outcome: "Turn interest into a real school",
    body: "Before any student enrolled, Sage Field needed a credible public presence. That meant a polished website, visible tuition, clear program pages, and an enrollment pathway families could trust.",
    details: [
      "School website with program and tuition pages live",
      "Enrollment inquiry forms capturing family interest",
      "Public-facing team and contact infrastructure",
      "Admissions pathways guiding families toward a tour",
    ],
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Enroll",
    outcome: "Turn interest into tours",
    body: "With families discovering the school, the next step was capturing leads, scheduling tours, and moving prospects through an enrollment funnel without losing anyone in a spreadsheet.",
    details: [
      "Lead tracking and tour scheduling in one place",
      "Enrollment agreements and e-signature workflows",
      "Family records created on acceptance",
      "Tuition setup and payment collection activated",
    ],
  },
  {
    number: "03",
    icon: Users,
    title: "Onboard",
    outcome: "Keep families informed",
    body: "Once students were accepted, parents needed visibility into their child's school experience. Teachers needed to know who was in class, what was expected, and where to find everything.",
    details: [
      "Parent portal with school info and communication",
      "Student and family records accessible to staff",
      "Teacher onboarding with calendar and document access",
      "Attendance and daily workflow tools ready before day one",
    ],
  },
  {
    number: "04",
    icon: Settings,
    title: "Operate",
    outcome: "Run operations without spreadsheets",
    body: "Day-to-day school life required coordinated operations: attendance, payroll, finances, marketing, and family communication all running from a shared system instead of fragmented tools.",
    details: [
      "Admin dashboard for leads, finances, and school calendar",
      "Teacher workspace: attendance, students, SOPs, and feed",
      "Parent communication and school updates in one channel",
      "Marketing and operations coordinated without extra tools",
    ],
  },
];

/** Illustrative mock data inside the timeline previews (unchanged). */
export const STEP_PREVIEW_DATA = {
  launchTabs: ["Programs", "Tuition", "Team"],
  enrollFamilies: [
    { name: "Rivera family", status: "Tour scheduled", done: false },
    { name: "Chen family", status: "Application sent", done: true },
    { name: "Torres family", status: "Enrolled", done: true },
  ],
  enrollAdd: "+ Add new lead",
  onboardTitle: "Parent Portal",
  onboardLive: "Live",
  onboardItems: ["Class schedule", "School updates", "Tuition & billing", "Documents"],
  operateRows: [
    { label: "Attendance", value: "32 / 35", tone: "good" },
    { label: "Open leads", value: "8 families", tone: "warm" },
    { label: "Invoices due", value: "$4,800", tone: "good" },
    { label: "Pending tasks", value: "3 items", tone: "quiet" },
  ],
} as const;

export const LIVE_SITE_COPY = {
  eyebrow: "See it live",
  headlineLead: "The site families visit",
  headlineAccent: "today.",
  bodyBefore: "Programs, tuition, team profiles, and enrollment pathways are all published on ",
  bodyLink: "sagefield.co",
  bodyAfter: "— the same public surface families used during Sage Field's launch.",
  openInTab: "Open in new tab",
  fallbackTitle: "Preview unavailable in this frame",
  fallbackBody: "Visit Sage Field's live site to explore programs, tuition, team, and enrollment.",
  fallbackCta: "Visit sagefield.co",
};

export type OutcomeRole = "parent" | "teacher" | "admin";

export const OUTCOMES_COPY = {
  eyebrow: "What we helped Sage Field run",
  headlineLead: "Four outcomes.",
  headlineAccent: "One platform.",
  body: "The platform didn't just provide features — it gave every person in the school a clear operating surface so everyone could do their job without chasing information.",
  ctaTitle: "Ready to see the platform for your school?",
  ctaBody: "Walk through it live with someone who runs a microschool.",
  cta: "Book a demo",
};

export const OUTCOME_TABS: { id: OutcomeRole; label: string; icon: LucideIcon; outcome: string; tagline: string; items: string[] }[] = [
  {
    id: "parent",
    label: "Parent",
    icon: Users,
    outcome: "Keep families informed",
    tagline: "Parents have a single place for everything related to their child's school experience.",
    items: [
      "Tuition access and payment history",
      "School news and announcements",
      "Direct communication with staff",
      "Class schedule and calendar",
      "Documents and forms",
      "Visibility into their child's daily experience",
    ],
  },
  {
    id: "teacher",
    label: "Teacher",
    icon: BookOpen,
    outcome: "Give teachers one place to work",
    tagline: "Teachers see their students, their schedule, and their responsibilities in one workspace.",
    items: [
      "Daily attendance tracking",
      "Student roster and profiles",
      "Shared school calendar",
      "Activity feed and updates",
      "Documents and SOPs",
      "Payroll and hours visibility",
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: LayoutDashboard,
    outcome: "Run operations without spreadsheets",
    tagline: "Administrators run the whole school from one coordinated system.",
    items: [
      "Lead and tour management",
      "Parent and student records",
      "School finances and invoicing",
      "Calendar and event coordination",
      "Marketing and outreach tools",
      "Staff management and scheduling",
    ],
  },
];

export const BEFORE_AFTER_COPY = {
  eyebrow: "Before & after",
  headlineLead: "What changed with",
  headlineAccent: "MudKitchen.",
  body: "Microschool founders don't lack tools — they have too many disconnected ones. The difference isn't a new feature. It's having one system that holds everything.",
  withoutLabel: "Without an operating system",
  withoutLabelShort: "Without a system",
  withLabel: "With MudKitchen",
};

export const WITHOUT = [
  { label: "Enrollment tracking", detail: "Spreadsheet with family names, tour dates, and status columns maintained manually." },
  { label: "Family communication", detail: "Email chains and group texts — no way to ensure everyone received the right info." },
  { label: "Tuition collection", detail: "Manual invoices via Venmo, Zelle, or bank transfer. Chasing payments every month." },
  { label: "Staff coordination", detail: "Separate group chats, shared Google Docs, and calendar invites across three platforms." },
  { label: "Operations overview", detail: "No single view of the school. Context switching between apps to answer basic questions." },
];

export const WITH = [
  { label: "Enrollment tracking", detail: "Lead pipeline with status, tour scheduling, and enrollment agreements all in one place." },
  { label: "Family communication", detail: "Parent portal with updates, documents, and messaging — one channel for all families." },
  { label: "Tuition collection", detail: "Automated invoicing, online payment, and billing history visible to parents and admin." },
  { label: "Staff coordination", detail: "Teacher workspace with shared calendar, student roster, SOPs, and activity feed." },
  { label: "Operations overview", detail: "Admin dashboard showing leads, finances, attendance, and school calendar in one view." },
];

export const WHY_COPY = {
  eyebrow: "Why it worked",
  headlineLead: "Software that mirrors",
  headlineAccent: "the school's values.",
  body: "Sage Field's model is intentionally high-trust and relationship-driven. The software story mirrors that — not by offering more features, but by supporting a real school with real operational complexity from the very first day.",
  quote:
    "We didn't need disconnected tools. We needed one system that could help us launch confidently, stay organized, and support families well from the start.",
  quoteBy: "— Sabrina, Co-Founder, Sage Field",
  approachLabel: "Educational approach",
  approach: ["Montessori", "Waldorf", "Reggio Emilia", "TEKS-aligned", "Outdoor learning", "Small groups", "Family partnership"],
};

export const REASONS = [
  {
    number: "01",
    title: "High-trust, relationship-driven model",
    body: "Sage Field is built on small groups, family partnership, and a clear educational philosophy. The platform had to support that — not fight it. Communication tools, parent visibility, and operational transparency reinforced the trust the school already prioritized.",
  },
  {
    number: "02",
    title: "Real operational complexity from day one",
    body: "This wasn't a hobby project or a waitlist. Sage Field launched with live programs, published tuition, and enrolled families. The system had to handle real complexity: billing cycles, staff coordination, enrollment agreements, and ongoing family communication.",
  },
  {
    number: "03",
    title: "Outdoors and philosophy-led learning",
    body: "Blending Montessori, Waldorf, Reggio Emilia influences, and TEKS-aligned academics meant the school had a distinct approach. The platform supported — but never overshadowed — that approach, giving teachers and administrators the infrastructure to focus on pedagogy, not paperwork.",
  },
];

export const GALLERY_COPY = {
  eyebrow: "Campus photos",
  site: "sagefield.co",
  location: "Round Rock, TX",
};

export const TAKEAWAYS_COPY = {
  eyebrow: "What prospects should notice",
  headlineLead: "What this means",
  headlineAccent: "for your school.",
  body: "Sage Field's story isn't just about one school. It's a model for what's possible when a microschool launches with operational infrastructure that actually matches how the school runs.",
  ctaLead: "Ready to launch like",
  ctaAccent: "Sage Field?",
  ctaBody: "See how the platform can support your microschool from website to daily operations.",
  cta: "Book a demo",
  secondaryCta: "Explore the platform",
  secondaryHref: "/features",
  reassurance: "No commitment. No sales pressure. Just a conversation.",
};

export const TAKEAWAYS = [
  {
    number: "01",
    headline: "Launch with a real public-facing school presence.",
    body: "Not just an internal system — a website, program pages, tuition, team, and enrollment pathway that families can trust before they ever walk through the door.",
  },
  {
    number: "02",
    headline: "Support tuition, enrollment, and communication the way families expect.",
    body: "Parents can see their account, receive updates, and stay informed without chasing emails. Enrollment is a pathway, not a form.",
  },
  {
    number: "03",
    headline: "Give teachers and administrators a shared operating system.",
    body: "No more fragmented tools. Staff have one workspace. Admins have one dashboard. Everyone sees the same school.",
  },
  {
    number: "04",
    headline: "Start lean and grow without rebuilding your stack.",
    body: "Sage Field launched from zero and scaled to 35 students without switching platforms. The system grew with the school.",
  },
];
