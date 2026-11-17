import {
  BadgeCheck,
  Bell,
  BellRing,
  BookOpenCheck,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  Camera,
  ClipboardCheck,
  Clock,
  CreditCard,
  Eye,
  FileSignature,
  Filter,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Home,
  Inbox,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  MailCheck,
  MapPin,
  Megaphone,
  MessagesSquare,
  PartyPopper,
  PiggyBank,
  Receipt,
  RefreshCw,
  Repeat,
  School,
  Send,
  ShieldCheck,
  Smartphone,
  Soup,
  Sprout,
  TimerReset,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { MUDKITCHEN_MARKETING_GARDEN_THEME } from "@/lib/marketing/mudkitchen-garden-marketing-theme";
import { MUDKITCHEN_ACCOUNT_PITCH_KEY } from "@/lib/school-admin/free-plan-upgrade";

/*
 * What each locked feature does for a free school, shown in the unlock popup
 * and on the free Home. Every line describes something the feature really
 * does today; keep it that way (no numbers, prices or time claims).
 *
 * Keep it light (enforced in free-plan-upgrade.test.ts):
 * - highlights: 3, each 6 words or fewer
 * - scenario: moment ≤ 4 words, before ≤ 14 words, after ≤ 16 words
 */

export type FreePlanPitchTint = "butter" | "sky" | "lav" | "mint" | "peach";

export type FreePlanHighlight = { icon: LucideIcon; text: string };

/** One familiar microschool moment, today vs with the feature. */
export type FreePlanScenario = { moment: string; before: string; after: string };

export type FreePlanPitch = {
  emoji: string;
  headlineLead: string;
  headlineAccent: string;
  /** One sentence: what it is, in the admin's terms. */
  promise: string;
  highlights: readonly [FreePlanHighlight, FreePlanHighlight, FreePlanHighlight];
  scenario: FreePlanScenario;
  /** Tools this replaces (keys of FREE_PLAN_REPLACED_TOOLS). */
  replaces?: readonly FreePlanReplacedTool[];
  icon: LucideIcon;
  tint: FreePlanPitchTint;
};

/** Same tool → logo pairs as the home page's "tools you replace" (PainSection PAIRS). */
export const FREE_PLAN_REPLACED_TOOLS = {
  "Google Forms": "/images/competitors/GoogleForms.png",
  Venmo: "/images/competitors/Venmo.png",
  PayPal: "/images/competitors/Paypal.svg",
  Gmail: "/images/competitors/Gmail.png",
  DocuSign: "/images/competitors/DocuSign.png",
  Calendly: "/images/competitors/Calendly.webp",
} as const;

export type FreePlanReplacedTool = keyof typeof FREE_PLAN_REPLACED_TOOLS;

/** MudKitchen speaking (not the school): Garden tokens with clay as the action colour. */
export const FREE_PLAN_UPGRADE_THEME: ParentThemeTokens = {
  ...MUDKITCHEN_MARKETING_GARDEN_THEME,
  primary: "#A05C45",
  primaryDark: "#7E4533",
  primaryLight: "#F8DDCF",
  primarySoft: "rgba(160, 92, 69, 0.1)",
};

export const FREE_PLAN_FALLBACK_PITCH: FreePlanPitch = {
  emoji: "🌱",
  headlineLead: "Everything your school runs on,",
  headlineAccent: "in one place.",
  promise:
    "Enrollment, billing, and daily operations in one workspace — from first click to enrolled.",
  highlights: [
    { icon: Wallet, text: "Tuition on autopay" },
    { icon: Users, text: "Students, staff and attendance together" },
    { icon: Smartphone, text: "Families stay in the loop" },
  ],
  scenario: {
    moment: "A normal Monday",
    before: "Forms, payments, texts and spreadsheets live in a different app each.",
    after: "Enrollment, tuition, attendance and family messages all live in MudKitchen.",
  },
  replaces: ["Google Forms", "Venmo", "Gmail"],
  icon: Sprout,
  tint: "mint",
};

/** Keyed by admin feature key, or `feature:child` for a sidebar child. */
const PITCHES: Record<string, FreePlanPitch> = {
  dashboard: {
    emoji: "📊",
    headlineLead: "See your whole school day",
    headlineAccent: "on one page.",
    promise:
      "Your admin home: what needs you today, who's here, who's on the clock and where every family is.",
    highlights: [
      { icon: ListChecks, text: "What needs you today" },
      { icon: CalendarCheck, text: "Who's here, at a glance" },
      { icon: Clock, text: "Who's on the clock" },
    ],
    scenario: {
      moment: "Arriving at 8am",
      before: "You check three inboxes and a spreadsheet to see what's waiting.",
      after: "One page shows new applications, today's attendance and hour requests.",
    },
    icon: LayoutDashboard,
    tint: "sky",
  },
  "admissions:payments": {
    emoji: "💳",
    headlineLead: "Collect fees",
    headlineAccent: "as families apply.",
    promise:
      "Connect Stripe once and application and enrollment fees are collected at checkout.",
    highlights: [
      { icon: CreditCard, text: "Fees paid at checkout" },
      { icon: PiggyBank, text: "Straight to your Stripe" },
      { icon: BadgeCheck, text: "Paid status on each application" },
    ],
    scenario: {
      moment: "A new application",
      before: "You email the family a Venmo link and wait to see if they pay.",
      after: "The family pays the fee as they apply, and you see it on their submission.",
    },
    replaces: ["Venmo", "PayPal"],
    icon: CreditCard,
    tint: "peach",
  },
  my_school: {
    emoji: "🏫",
    headlineLead: "Run the whole school",
    headlineAccent: "from one place.",
    promise:
      "Students, staff, classrooms, attendance, forms and tuition, kept together for your team.",
    highlights: [
      { icon: Users, text: "Every student and family" },
      { icon: CalendarCheck, text: "Daily attendance and staff hours" },
      { icon: Wallet, text: "Tuition on autopay" },
    ],
    scenario: {
      moment: "A parent calls",
      before: "You dig through folders and spreadsheets to find their child's details.",
      after: "Their profile, pickups and billing are one search away.",
    },
    icon: School,
    tint: "mint",
  },
  "my_school:school_profile": {
    emoji: "📍",
    headlineLead: "Your school's profile,",
    headlineAccent: "ready for families.",
    promise: "The details families see about your school, kept in one place.",
    highlights: [
      { icon: MapPin, text: "Address and contact details" },
      { icon: Camera, text: "Photos of your school" },
      { icon: MailCheck, text: "Visit details sent automatically" },
    ],
    scenario: {
      moment: "A tour booking",
      before: "You type out your address and parking notes in every reply.",
      after: "Their booking email already includes your school's visit details.",
    },
    icon: MapPin,
    tint: "butter",
  },
  "my_school:students": {
    emoji: "🧒",
    headlineLead: "Every student's details,",
    headlineAccent: "in one place.",
    promise: "A roster of every enrolled student, with the details your team needs.",
    highlights: [
      { icon: UserPlus, text: "Enrolled students added for you" },
      { icon: HeartPulse, text: "Health info and emergency contacts" },
      { icon: ShieldCheck, text: "Authorized pickups" },
    ],
    scenario: {
      moment: "Pickup time",
      before: "You scroll back through texts to check who's allowed to pick up.",
      after: "The child's authorized pickup list is right on their profile.",
    },
    icon: Users,
    tint: "sky",
  },
  "my_school:attendance": {
    emoji: "✅",
    headlineLead: "Know who's here,",
    headlineAccent: "every day.",
    promise: "Log daily attendance for every student and look back week by week.",
    highlights: [
      { icon: CalendarCheck, text: "Present or absent, day by day" },
      { icon: ShieldCheck, text: "Pickup contacts on the roster" },
      { icon: UserCheck, text: "Teachers can take roll" },
    ],
    scenario: {
      moment: "End of the month",
      before: "You piece attendance together from paper sheets and memory.",
      after: "Every day is already logged, and you can look back week by week.",
    },
    icon: CalendarCheck,
    tint: "mint",
  },
  "my_school:staff": {
    emoji: "🧑‍🏫",
    headlineLead: "Bring your team",
    headlineAccent: "into MudKitchen.",
    promise: "Add your staff and give each of them their own staff portal.",
    highlights: [
      { icon: Users, text: "Your whole team, one roster" },
      { icon: KeyRound, text: "A login for every teacher" },
      { icon: Smartphone, text: "Their own staff portal" },
    ],
    scenario: {
      moment: "A new teacher starts",
      before: "You forward them a pile of docs, spreadsheets and group chats.",
      after: "They log in and find their students, messages, calendar and hours.",
    },
    icon: UserCheck,
    tint: "lav",
  },
  "my_school:staff_hours": {
    emoji: "⏱️",
    headlineLead: "Staff hours,",
    headlineAccent: "without the timesheets.",
    promise: "Teachers log their hours and you see weekly and monthly totals.",
    highlights: [
      { icon: Clock, text: "Clock in from the app" },
      { icon: BadgeCheck, text: "Approve hour changes" },
      { icon: CalendarClock, text: "Weekly and monthly totals" },
    ],
    scenario: {
      moment: "Payroll week",
      before: "You collect paper timesheets and add up hours by hand.",
      after: "Hours are already logged, totaled and waiting for your approval.",
    },
    icon: Clock,
    tint: "butter",
  },
  "my_school:classrooms": {
    emoji: "🏠",
    headlineLead: "Group students",
    headlineAccent: "into classrooms.",
    promise: "Set up each classroom and its roster.",
    highlights: [
      { icon: Home, text: "A roster for every classroom" },
      { icon: RefreshCw, text: "Tidy as families enroll" },
      { icon: UserCheck, text: "Teachers see their own students" },
    ],
    scenario: {
      moment: "A new term",
      before: "You rebuild class lists in a spreadsheet and email them around.",
      after: "Each classroom has its roster, and teachers see their students in their portal.",
    },
    icon: Home,
    tint: "peach",
  },
  "my_school:forms_documents": {
    emoji: "📝",
    headlineLead: "Forms families sign",
    headlineAccent: "online.",
    promise: "Send forms and documents to families and track who has signed.",
    highlights: [
      { icon: FileSignature, text: "Families sign online" },
      { icon: ListChecks, text: "See who still needs to" },
      { icon: ClipboardCheck, text: "Saved with each family" },
    ],
    scenario: {
      moment: "Field trip permission slips",
      before: "Paper slips go home in backpacks and half come back.",
      after: "Families sign in the parent portal, and you see who's still missing.",
    },
    replaces: ["DocuSign"],
    icon: FileSignature,
    tint: "lav",
  },
  "my_school:tuition": {
    emoji: "💰",
    headlineLead: "Tuition and billing,",
    headlineAccent: "on autopay.",
    promise:
      "Families view invoices, make payments, and track tuition history in one place.",
    highlights: [
      { icon: Repeat, text: "Autopay on your schedule" },
      { icon: BellRing, text: "Reminders sent for you" },
      { icon: Receipt, text: "Receipts for every payment" },
    ],
    scenario: {
      moment: "Tuition due day",
      before: "You chase Venmo payments and track who paid in a spreadsheet.",
      after: "Autopay runs, reminders go out for you, and families get receipts.",
    },
    replaces: ["Venmo", "PayPal"],
    icon: Wallet,
    tint: "peach",
  },
  communication: {
    emoji: "💬",
    headlineLead: "Talk with families",
    headlineAccent: "in one place.",
    promise: "Newsletters, committees, and family and staff messaging.",
    highlights: [
      { icon: Inbox, text: "One inbox for everyone" },
      { icon: Smartphone, text: "Families reply from the app" },
      { icon: HandHeart, text: "Committee spaces for volunteers" },
    ],
    scenario: {
      moment: "A question about lunch",
      before: "It's buried in your personal texts, email and three group chats.",
      after: "It lands in one school inbox, and anyone on your team can answer.",
    },
    replaces: ["Gmail"],
    icon: MessagesSquare,
    tint: "sky",
  },
  messages: {
    emoji: "💬",
    headlineLead: "Every conversation,",
    headlineAccent: "in one inbox.",
    promise: "Family and staff messaging, built into MudKitchen.",
    highlights: [
      { icon: Inbox, text: "Families and staff, one inbox" },
      { icon: Smartphone, text: "Replies from the app" },
      { icon: MailCheck, text: "Unread reminders sent daily" },
    ],
    scenario: {
      moment: "A question about lunch",
      before: "It's buried in your personal texts, email and three group chats.",
      after: "It lands in one school inbox, and families reply from the app.",
    },
    replaces: ["Gmail"],
    icon: MessagesSquare,
    tint: "sky",
  },
  committees: {
    emoji: "🤝",
    headlineLead: "Give parent committees",
    headlineAccent: "a home.",
    promise: "Workspaces where parent volunteers plan and get things done.",
    highlights: [
      { icon: HandHeart, text: "A workspace per committee" },
      { icon: UserPlus, text: "Parents ask to join" },
      { icon: MailCheck, text: "A daily digest for members" },
    ],
    scenario: {
      moment: "Planning the spring fair",
      before: "Plans scatter across a group chat, email and someone's notes app.",
      after: "The committee shares a feed, calendar and resources in one workspace.",
    },
    icon: HandHeart,
    tint: "lav",
  },
  bulletin: {
    emoji: "📌",
    headlineLead: "Announcements and flyers",
    headlineAccent: "families see.",
    promise: "Announcements and flyers for families and staff.",
    highlights: [
      { icon: Megaphone, text: "Post to families or staff" },
      { icon: ClipboardCheck, text: "Flyers right in the post" },
      { icon: Smartphone, text: "Seen in the parent portal" },
    ],
    scenario: {
      moment: "A schedule change",
      before: "You send the same note by text, email and a paper flyer.",
      after: "You post it once and families see it in the parent portal.",
    },
    icon: ClipboardCheck,
    tint: "butter",
  },
  photos: {
    emoji: "📸",
    headlineLead: "Share the school day",
    headlineAccent: "with every family.",
    promise:
      "Post photos from the school day and families see them in the parent portal and the app.",
    highlights: [
      { icon: Camera, text: "Post once, every family sees" },
      { icon: BellRing, text: "Email and app notification" },
      { icon: UserCheck, text: "Teachers can upload too" },
    ],
    scenario: {
      moment: "Field trip day",
      before: "You text photos to a few parents; the rest ask at pickup.",
      after: "You post them once and every family gets an email and an app notification.",
    },
    icon: Camera,
    tint: "butter",
  },
  notifications: {
    emoji: "🔔",
    headlineLead: "Never miss",
    headlineAccent: "what's new.",
    promise: "Email alerts for applications, payments, and visits.",
    highlights: [
      { icon: Bell, text: "Applications, payments and visits" },
      { icon: Send, text: "You choose who's alerted" },
      { icon: TimerReset, text: "Reminders that nudge families" },
    ],
    scenario: {
      moment: "A late-night application",
      before: "You find it days later in a shared inbox.",
      after: "You get an email alert right away, and so does anyone you add.",
    },
    icon: Bell,
    tint: "peach",
  },
  finances: {
    emoji: "📈",
    headlineLead: "Know where",
    headlineAccent: "the money goes.",
    promise: "Budget, revenue, expenses and payroll for your school.",
    highlights: [
      { icon: PiggyBank, text: "Revenue and expenses together" },
      { icon: Filter, text: "Every transaction, one list" },
      { icon: Wallet, text: "Payroll alongside the rest" },
    ],
    scenario: {
      moment: "Budget planning",
      before: "You export bank statements into a spreadsheet and sort by hand.",
      after: "Revenue, expenses and payroll are already together in one view.",
    },
    icon: PiggyBank,
    tint: "mint",
  },
  marketing: {
    emoji: "📣",
    headlineLead: "Keep new families",
    headlineAccent: "warm.",
    promise:
      "Automated email campaigns and lead nurture sequences, all tied to your pipeline.",
    highlights: [
      { icon: Send, text: "Email campaigns to interested families" },
      { icon: Repeat, text: "Follow-ups that run themselves" },
      { icon: BookOpenCheck, text: "Tied to your admissions pipeline" },
    ],
    scenario: {
      moment: "After an open house",
      before: "You mean to follow up with every family, but the week gets away.",
      after: "A follow-up sequence goes out to them automatically.",
    },
    icon: Megaphone,
    tint: "lav",
  },
  "schedule:overview": {
    emoji: "🗓️",
    headlineLead: "Your whole calendar,",
    headlineAccent: "at a glance.",
    promise: "Tours, shadow days and school events in one view, with what's coming up next.",
    highlights: [
      { icon: CalendarCheck, text: "Upcoming visits in one list" },
      { icon: CalendarDays, text: "Open slots and shadow days" },
      { icon: PartyPopper, text: "School events alongside" },
    ],
    scenario: {
      moment: "Planning the week",
      before: "You flip between a booking tool, email and a wall calendar.",
      after: "Next visits, open slots and school events sit together on one page.",
    },
    icon: CalendarDays,
    tint: "sky",
  },
  "schedule:events": {
    emoji: "🎉",
    headlineLead: "School events",
    headlineAccent: "families actually see.",
    promise: "School-wide events that show up for families in the parent portal.",
    highlights: [
      { icon: PartyPopper, text: "Field trips and community events" },
      { icon: CalendarDays, text: "No-school days, posted once" },
      { icon: Smartphone, text: "In the parent portal" },
    ],
    scenario: {
      moment: "A no-school day",
      before: "You remind families by text, email and a note home, then answer questions.",
      after: "You add it once and it's on every family's school calendar.",
    },
    icon: PartyPopper,
    tint: "butter",
  },
  "schedule:permissions": {
    emoji: "🔑",
    headlineLead: "Let your team",
    headlineAccent: "add events too.",
    promise: "Choose which staff can put events on the school calendar.",
    highlights: [
      { icon: KeyRound, text: "Pick who can add events" },
      { icon: Users, text: "Teachers post their own" },
      { icon: ShieldCheck, text: "You stay in control" },
    ],
    scenario: {
      moment: "A class field trip",
      before: "The teacher emails you the details and waits for you to post it.",
      after: "The teacher adds it to the calendar themselves.",
    },
    icon: KeyRound,
    tint: "lav",
  },
  "schedule:shadow": {
    emoji: "🎒",
    headlineLead: "Shadow days",
    headlineAccent: "families can book.",
    promise: "Let prospective students spend a day at school, booked straight from your calendar.",
    highlights: [
      { icon: CalendarDays, text: "Open whole days or set times" },
      { icon: GraduationCap, text: "Target specific grades" },
      { icon: Eye, text: "Every visit in one list" },
    ],
    scenario: {
      moment: "A trial day request",
      before: "You trade emails for a week to find a day that works.",
      after: "They pick an open shadow day for their child's grade and it's booked.",
    },
    icon: GraduationCap,
    tint: "mint",
  },
  [MUDKITCHEN_ACCOUNT_PITCH_KEY]: {
    emoji: "🥣",
    headlineLead: "Your MudKitchen account,",
    headlineAccent: "all in one spot.",
    promise: "Where you and the MudKitchen team work on your school's setup.",
    highlights: [
      { icon: Wrench, text: "Send requests to our team" },
      { icon: ListChecks, text: "A log of what we built" },
      { icon: Receipt, text: "Your invoices and billing" },
    ],
    scenario: {
      moment: "You need a change",
      before: "You email back and forth and lose track of what's done.",
      after: "You send a request and follow it in your account until it's built.",
    },
    icon: Soup,
    tint: "peach",
  },
};

/** Every pitch, for tests and previews. */
export function listFreePlanPitches(): [string, FreePlanPitch][] {
  return [["fallback", FREE_PLAN_FALLBACK_PITCH], ...Object.entries(PITCHES)];
}

/**
 * Pitch for a pitch key (`feature` or `feature:child`). A child without its
 * own pitch uses its parent feature, then the fallback.
 */
export function getFreePlanPitch(key: string | null | undefined): FreePlanPitch {
  if (!key) return FREE_PLAN_FALLBACK_PITCH;
  if (PITCHES[key]) return PITCHES[key];
  const parent = key.split(":")[0];
  return PITCHES[parent] ?? FREE_PLAN_FALLBACK_PITCH;
}
