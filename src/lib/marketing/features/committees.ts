import { HandHeart } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/committees.md */

const NCES: Source = {
  label: "NCES, Digest of Education Statistics, Table 207.40",
  url: "https://nces.ed.gov/programs/digest/d22/tables/dt22_207.40.asp?current=yes",
  year: "2022",
};
const PTO_TODAY: Source = {
  label: "PTO Today, State of School Volunteering survey",
  url: "https://www.ptotoday.com/pto-today-articles/state-of-school-volunteering-pto-pta-leaders",
  year: "2026",
};
const BW_PRICING: Source = { label: "Brightwheel pricing page", url: "https://mybrightwheel.com/pricing" };
const BW_SIGNUPS: Source = {
  label: "Brightwheel help: sign-up sheets",
  url: "https://help.mybrightwheel.com/en/articles/11175244-create-sign-up-sheets-for-events-supplies-parent-teacher-conferences-more",
};
const PG_INDEX: Source = { label: "Playground feature index (llms.txt)", url: "https://www.tryplayground.com/llms.txt" };
const TC_HELP: Source = { label: "Transparent Classroom help center", url: "https://transparent-classroom.helpscoutdocs.com/" };
const TC_VOICE: Source = {
  label: "Transparent Classroom feature request (declined)",
  url: "https://transparentclassroom.uservoice.com/forums/145102-general/suggestions/18556135-online-parent-teacher-conference-sign-up-schedule",
};

export const committees: Feature = {
  slug: "committees",
  name: "Committees",
  icon: HandHeart,
  tint: "lav",
  oneLiner: "Workspaces for the parent volunteers who keep your school running.",
  roles: ["admin", "family", "staff"],
  roleLines: {
    admin: "Set up committees with named roles, tasks and files, and approve who joins.",
    family: "Find a way to help, ask to join, and see exactly what's yours.",
    staff: "Join committees as faculty liaison and work alongside parents.",
  },
  platforms: { web: true, mobile: true },
  afterBell: true,
  seo: {
    title: "Committees & volunteer workspaces for microschools",
    description:
      "Give each parent committee its own space for duty roles, tasks, files, dates and messages. Families ask to join from the app, you approve, and nothing lives in one chair's inbox.",
  },
  hero: {
    lead: "Parent committees that run",
    accent: "without the reply-all chain.",
    body: "Give each committee its own space for roles, tasks, files, dates and messages. Families ask to join from their portal, you approve, and everyone sees what's next, on web and phone.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "Start from a template", body: "Annual volunteer, event, long-term role or hybrid committees come with duty roles and task groups ready to edit." },
      { title: "Name the jobs", body: "Create duty roles like Booth Coordinator or Faculty Liaison so each volunteer knows exactly what they own." },
      { title: "Approve who joins", body: "Families and staff request to join with a preferred role and a note. You approve or decline in one tap." },
      { title: "Share files by role", body: "Keep the event binder, vendor list and checklists in Resources, and limit sensitive files to specific roles." },
      { title: "See progress at a glance", body: "Tasks, the committee calendar and the activity feed show what's done, what's claimed and what's due." },
      { title: "Archive at year end", body: "Close a committee when the term ends. Its history stays for next year's chair." },
    ],
    family: [
      { title: "Find a way to help", body: "Browse open committees, read what each role involves, and ask to join." },
      { title: "Know your part", body: "See the tasks assigned to you, their due dates and the files your role needs." },
      { title: "Talk in one thread", body: "Message the committee and attach files, without a group text." },
      { title: "Get nudged, not buried", body: "Get an email or phone alert when you're assigned a task, plus an optional daily summary." },
    ],
    staff: [
      { title: "Join as liaison", body: "Teachers request to join committees and work alongside parents in the same workspace." },
      { title: "Stay in the loop", body: "See committee tasks, dates and messages from the staff portal or the app." },
    ],
  },
  useCases: [
    {
      title: "The fall festival",
      scenario: "The founder creates an event committee, names a Booth Coordinator and a Logistics Lead, and adds the site map to Resources.",
      outcome: "Families claim booth tasks, and the founder checks progress in the activity feed instead of a 60-message thread.",
    },
    {
      title: "A new family wants to help",
      scenario: "A parent who joined in January opens Committees, reads the roles and asks to join the garden committee with a note about weekends.",
      outcome: "The lead approves it the same day, and the parent sees the next work date on the committee calendar.",
    },
    {
      title: "The chair steps down",
      scenario: "The auction chair moves on at the end of the year.",
      outcome: "The new chair opens last year's archived committee and finds the vendor list, checklist and messages. None of it lived in one person's inbox.",
    },
    {
      title: "A co-op project",
      scenario: "A co-op's science committee plans a spring project that needs supplies.",
      outcome: "Members see the project's supply list and who's on it, without a separate spreadsheet.",
    },
  ],
  evidence: [
    { stat: "72%", claim: "of private-school parents volunteered at their child's school, against 40% of public-school parents.", source: NCES },
    { stat: "97%", claim: "of PTO and PTA leaders say the same small group of volunteers does most of the work.", source: PTO_TODAY },
    { stat: "48%", claim: "of school volunteer leaders say committee chair and coordinator roles are among the hardest to fill.", source: PTO_TODAY },
  ],
  toolStack: { names: ["Email threads", "SignUpGenius", "Google Drive"], logos: ["/images/competitors/Gmail.png", "/images/competitors/GoogleDrive.png"] },
  comparison: [
    {
      label: "Committee workspaces",
      mudkitchen: { value: "Roles, tasks, files, calendar, messages and projects", mark: "yes" },
      toolStack: { value: "Spread across 3–4 tools", mark: "partial" },
      rivals: {
        brightwheel: { value: "Not listed", mark: "unknown", source: BW_PRICING },
        playground: { value: "Not listed", mark: "unknown", source: PG_INDEX },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HELP },
      },
    },
    {
      label: "Named duty roles",
      mudkitchen: { value: "Yes, from templates", mark: "yes" },
      toolStack: { value: "Written in an email", mark: "no" },
      rivals: {
        brightwheel: { value: "Not listed", mark: "unknown", source: BW_PRICING },
        playground: { value: "Not listed", mark: "unknown", source: PG_INDEX },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HELP },
      },
    },
    {
      label: "Families ask to join",
      mudkitchen: { value: "Yes, with a preferred role and a note", mark: "yes" },
      toolStack: { value: "Reply to an email", mark: "partial" },
      rivals: {
        brightwheel: { value: "Not listed", mark: "unknown", source: BW_PRICING },
        playground: { value: "Not listed", mark: "unknown", source: PG_INDEX },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HELP },
      },
    },
    {
      label: "Files limited by role",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Drive sharing, by hand", mark: "partial" },
      rivals: {
        brightwheel: { value: "Not listed", mark: "unknown", source: BW_PRICING },
        playground: { value: "Not listed", mark: "unknown", source: PG_INDEX },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HELP },
      },
    },
    {
      label: "Volunteer shift sign-ups",
      mudkitchen: { value: "Yes, with Classroom signups", mark: "yes" },
      toolStack: { value: "SignUpGenius", mark: "yes" },
      rivals: {
        brightwheel: { value: "Yes, Sign-ups", mark: "yes", source: BW_SIGNUPS },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_INDEX },
        "transparent-classroom": { value: "Request declined; suggests embedding a Google Sheet", mark: "no", source: TC_VOICE },
      },
    },
    {
      label: "Year-end archive with history",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Folder leaves with the chair", mark: "no" },
      rivals: {
        brightwheel: { value: "Not listed", mark: "unknown", source: BW_PRICING },
        playground: { value: "Not listed", mark: "unknown", source: PG_INDEX },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HELP },
      },
    },
  ],
  faq: [
    {
      question: "Can families join a committee on their own?",
      answer:
        "They can ask to join from their portal or the app, choosing a preferred role and adding a note. A school admin approves or declines each request. You can also invite people directly by name and email.",
    },
    {
      question: "Do families see Committees right away?",
      answer: "Committees is on for admins and staff from the start. We turn it on for families when you're ready.",
    },
    {
      question: "Does it track volunteer hours?",
      answer:
        "Not today. Committees organise roles, tasks, files, dates and messages. If your school requires a set number of family hours, keep the totals separately for now.",
    },
    {
      question: "Can teachers be on committees?",
      answer: "Yes. Staff browse and ask to join from the staff portal and the app, and can hold roles like faculty liaison.",
    },
    {
      question: "Who can see committee files?",
      answer: "Members see a committee's resources, and you can limit any file to specific duty roles. School admins always see everything.",
    },
  ],
  related: ["classroom-signups", "messages", "calendar"],
};
