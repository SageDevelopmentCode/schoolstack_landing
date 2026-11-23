import { ClipboardCheck } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/classroom-signups.md */

const PTO_TODAY: Source = {
  label: "PTO Today, State of School Volunteering survey",
  url: "https://www.ptotoday.com/pto-today-articles/state-of-school-volunteering-pto-pta-leaders",
  year: "2026",
};
const NCES: Source = {
  label: "NCES, Digest of Education Statistics, Table 207.40",
  url: "https://nces.ed.gov/programs/digest/d22/tables/dt22_207.40.asp?current=yes",
  year: "2022",
};
const BW_SIGNUPS: Source = {
  label: "Brightwheel help: sign-up sheets",
  url: "https://help.mybrightwheel.com/en/articles/11175244-create-sign-up-sheets-for-events-supplies-parent-teacher-conferences-more",
};
const BW_FORMS: Source = { label: "Brightwheel: childcare forms", url: "https://mybrightwheel.com/childcare-forms/" };
const PG_INDEX: Source = { label: "Playground feature index (llms.txt)", url: "https://www.tryplayground.com/llms.txt" };
const TC_VOICE: Source = {
  label: "Transparent Classroom feature request (declined)",
  url: "https://transparentclassroom.uservoice.com/forums/145102-general/suggestions/18556135-online-parent-teacher-conference-sign-up-schedule",
};

const notListed = { value: "Not listed", mark: "unknown" as const };

export const classroomSignups: Feature = {
  slug: "classroom-signups",
  name: "Classroom signups",
  icon: ClipboardCheck,
  tint: "mint",
  oneLiner: "Volunteer and supply signups for each classroom, in one place.",
  roles: ["staff", "family"],
  roleLines: {
    staff: "Ask your class for chaperones, readers or snacks, and remind only who's left.",
    family: "Pick a slot from your phone. Full slots close themselves.",
  },
  platforms: { web: true, mobile: true },
  seo: {
    title: "Classroom volunteer & supply signups for microschools",
    description:
      "Post a signup for chaperones, reading buddies or party snacks. Families in that class pick a slot from their phone, full slots close, and one reminder reaches only who hasn't answered.",
  },
  hero: {
    lead: "Classroom help, signed up",
    accent: "without the group text.",
    body: "Post a signup for chaperones, readers or party snacks. Families in that class pick a slot from their phone, full slots close themselves, and one reminder reaches only who hasn't answered.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    staff: [
      { title: "Start from a template", body: "Reading buddies, event helpers, field-trip chaperones and party contributions come ready to edit." },
      { title: "Slots, roles or open", body: "Offer timed slots with a capacity, roles with a number needed, or an open question." },
      { title: "Ask the right families", body: "Send to your students' families, one classroom or several. No email lists to paste." },
      { title: "Remind only who's left", body: "One tap sends your message by email and phone notification to families who haven't signed up." },
      { title: "Export the list", body: "Download a spreadsheet of who signed up, for which child, and their notes." },
    ],
    family: [
      { title: "See it on Home", body: "Open signups show in your Start here card on the web and in the app." },
      { title: "Pick what fits", body: "Choose a slot or role, pick which child it's for, and add a note." },
      { title: "No double-booking", body: "Full slots are marked Full, so you can't take a spot that's gone." },
      { title: "Change your mind", body: "Edit or withdraw your signup from the same page." },
      { title: "Your name stays private", body: "Other parents see how full a slot is, not who took it." },
    ],
  },
  useCases: [
    {
      title: "Field-trip chaperones",
      scenario: "A teacher uses the chaperone template: three seats for Thursday's museum trip, deadline Tuesday.",
      outcome: "The third seat fills Monday night and shows Full, so nobody turns up expecting to ride along.",
    },
    {
      title: "Class party snacks",
      scenario: "The teacher adds roles for fruit, drinks, plates and napkins, each with a number needed.",
      outcome: "Families pick what's left, plates get covered, and the teacher exports the list the day before.",
    },
    {
      title: "Weekly reading buddies",
      scenario: "Time slots every Wednesday for a month, sent to two classrooms.",
      outcome: "On Monday the teacher sends one reminder. It reaches only the families who haven't answered, by email and on their phone.",
    },
    {
      title: "The spring play crew",
      scenario: "Roles for sets, costumes and setup, with a note asking about skills.",
      outcome: "Parents who can sew say so in their note, and the teacher has the whole crew in one list.",
    },
  ],
  evidence: [
    { stat: "76%", claim: "of private elementary school parents volunteered at their child's school.", source: NCES },
    { stat: "54%", claim: "of PTO and PTA leaders have cancelled or scaled back events because too few volunteers signed up.", source: PTO_TODAY },
    { stat: "58%", claim: "of schools re-engaged volunteers with short, simple, flexible shifts.", source: PTO_TODAY },
  ],
  toolStack: { names: ["SignUpGenius", "Group texts", "Paper sheets"] },
  comparison: [
    {
      label: "Built-in signups",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "A separate tool and login", mark: "partial" },
      rivals: {
        brightwheel: { value: "Yes, Sign-ups", mark: "yes", source: BW_SIGNUPS },
        playground: { ...notListed, source: PG_INDEX },
        "transparent-classroom": { value: "Request declined; suggests embedding a Google Sheet", mark: "no", source: TC_VOICE },
      },
    },
    {
      label: "Slot types",
      mudkitchen: { value: "Time slots, roles with a number needed, open question", mark: "yes" },
      toolStack: { value: "Many, in SignUpGenius", mark: "yes" },
      rivals: {
        brightwheel: { value: "Item, time, recurring and time-series slots", mark: "yes", source: BW_SIGNUPS },
        playground: { ...notListed, source: PG_INDEX },
        "transparent-classroom": { value: "Not offered", mark: "no", source: TC_VOICE },
      },
    },
    {
      label: "Send to a classroom",
      mudkitchen: { value: "One or several classrooms", mark: "yes" },
      toolStack: { value: "Paste email lists", mark: "partial" },
      rivals: {
        brightwheel: { value: "Not described", mark: "unknown", source: BW_SIGNUPS },
        playground: { ...notListed, source: PG_INDEX },
        "transparent-classroom": { value: "Not offered", mark: "no", source: TC_VOICE },
      },
    },
    {
      label: "Remind only non-responders",
      mudkitchen: { value: "Email and phone notification", mark: "yes" },
      toolStack: { value: "Manual, or paid tiers", mark: "partial" },
      rivals: {
        brightwheel: { value: "Auto-reminders on marketing page; not in help article", mark: "unknown", source: BW_FORMS },
        playground: { ...notListed, source: PG_INDEX },
        "transparent-classroom": { value: "Not offered", mark: "no", source: TC_VOICE },
      },
    },
    {
      label: "Other families' names hidden",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Often visible", mark: "no" },
      rivals: {
        brightwheel: { value: "Yes", mark: "yes", source: BW_SIGNUPS },
        playground: { ...notListed, source: PG_INDEX },
        "transparent-classroom": { value: "Not offered", mark: "no", source: TC_VOICE },
      },
    },
    {
      label: "Export responses",
      mudkitchen: { value: "CSV", mark: "yes" },
      toolStack: { value: "Yes", mark: "yes" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_SIGNUPS },
        playground: { ...notListed, source: PG_INDEX },
        "transparent-classroom": { value: "Not offered", mark: "no", source: TC_VOICE },
      },
    },
  ],
  faq: [
    {
      question: "Who can see who signed up?",
      answer: "Teachers see every response. Families see how many spots are taken, but not other families' names.",
    },
    {
      question: "Can two families take the same slot?",
      answer: "No. Each time slot has a capacity and each role a number needed. When it's full, families see Full and can't pick it.",
    },
    {
      question: "How do reminders work?",
      answer:
        "From an open signup, choose Send reminder and edit the message. It goes by email and phone notification to families who haven't signed up yet, at most once an hour.",
    },
    {
      question: "Do families need another account?",
      answer: "No. They respond in the same MudKitchen parent portal and iPhone and Android app they use for messages, forms and billing.",
    },
    {
      question: "Where do teachers create signups?",
      answer: "In the staff portal on the web. Families respond on the web or in the app.",
    },
  ],
  related: ["committees", "forms-documents", "messages"],
};
