import { Megaphone } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/bulletin.md */

const SCHOOLSTATUS: Source = {
  label: "SchoolStatus 2024 School-Family Communications Report, via eSchool News",
  url: "https://www.eschoolnews.com/district-management/2024/04/10/school-home-communication-remains-challenge/",
  year: "2024",
};
const GREATSCHOOLS: Source = {
  label: "GreatSchools parent survey, via Education Week",
  url: "https://www.edweek.org/leadership/what-parents-want-most-from-schools-clear-honest-communication/2025/12",
  year: "2025",
};
const PARENTSQUARE: Source = {
  label: "ParentSquare & Hanover Research parent study, via K-12 Dive",
  url: "https://www.k12dive.com/press-release/20261020-new-parentsquare-and-hanover-research-study-school-communication-shapes-wh/",
  year: "2026",
};
const BW_MESSAGING: Source = {
  label: "Brightwheel help: start messaging",
  url: "https://help.mybrightwheel.com/en/articles/2098452-start-messaging-in-brightwheel",
};
const PG_FEED: Source = {
  label: "Playground help: manage the Feed on the web",
  url: "https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web",
};
const TC_ANNOUNCE: Source = {
  label: "Transparent Classroom help: sending announcements",
  url: "https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements",
};

export const bulletin: Feature = {
  slug: "bulletin",
  name: "Bulletin",
  icon: Megaphone,
  tint: "butter",
  oneLiner: "Announcements and flyers for the right families, with an end date.",
  roles: ["admin", "family", "staff"],
  roleLines: {
    admin: "Post once to the right audience, schedule it, and let it expire.",
    family: "See current school news on your home page, with email and app alerts.",
    staff: "Read school-wide and staff-only posts from your dashboard.",
  },
  platforms: { web: true, mobile: true },
  afterBell: true,
  seo: {
    title: "School announcements & bulletin board for microschools",
    description:
      "Post announcements and flyers to the whole school, parents, teachers or one program. Schedule posts, set an end date, and alert families by email and app.",
  },
  hero: {
    lead: "One place for school news,",
    accent: "gone when it's done.",
    body: "Post closures, flyers and reminders once. Pick who sees it, publish now or later, and set an end date. Families see it on their home page and get an email and app alert.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "Post once, reach everyone", body: "One post shows on family and staff home pages and goes out by email and app push." },
      { title: "Pick who sees it", body: "Whole school, parents only, teachers only, or one or more programs. Nobody gets news that isn't for them." },
      { title: "Schedule it for later", body: "Write Monday's reminder on Friday. The post goes live on its own at the time you choose." },
      { title: "Old news drops off", body: "Set an end date and the post hides from feeds after it. Or leave it up until you archive it." },
      { title: "Attach the flyer", body: "Add up to five files, 10 MB each, like a PDF flyer, a lunch menu or a packing list." },
      { title: "Post from your phone", body: "Write, schedule and publish from the MudKitchen app on iPhone and Android, or the web." },
    ],
    family: [
      { title: "On your home page", body: "Current school posts sit at the top of your home page, not buried in a group chat." },
      { title: "Alerts when it's for you", body: "Get an email and an app notification when the school posts something for your family." },
      { title: "Open the flyer", body: "Tap a post to read it in full and open any attached images or files." },
      { title: "Catch up later", body: "Missed something? New posts also wait in your notification bell." },
    ],
    staff: [
      { title: "Staff-only notes", body: "Admins can post just to teachers: schedule changes, training days and reminders." },
      { title: "One tap from your dashboard", body: "Open the School Bulletin from your dashboard on the web or in the app." },
      { title: "Know what families were told", body: "School-wide posts show up for you too, so you can answer family questions." },
    ],
  },
  useCases: [
    {
      title: "Snow-day closure",
      scenario: "At 6 am the founder decides to close for the day.",
      outcome: "A school-wide post with today as its end date goes out by email and push, sits at the top of every home page, then drops off on its own.",
    },
    {
      title: "One program's field trip",
      scenario: "Only the elementary program is going to the science museum.",
      outcome: "The post and the PDF flyer go to that program's families only. Preschool families never see it.",
    },
    {
      title: "Staff training day",
      scenario: "Teachers need the agenda for Friday's in-service day.",
      outcome: "The founder writes a teachers-only post with the agenda attached and schedules it for Monday morning.",
    },
    {
      title: "Reminders written ahead",
      scenario: "The founder has a quiet hour on Friday afternoon and a week of reminders to send.",
      outcome: "She writes them all at once and schedules each one for the right day, so none depend on her memory.",
    },
  ],
  evidence: [
    { stat: "53%", claim: "of families say information from their child's school isn't always easy to access and understand.", source: SCHOOLSTATUS },
    {
      stat: "74%",
      claim: "of parents likely to highly recommend their school say information is easy to find, against 20% of parents less likely to.",
      source: GREATSCHOOLS,
    },
    {
      stat: "86%",
      claim: "of parents rate easy-to-access school communication as important; only safety, teachers and academics rate higher.",
      source: PARENTSQUARE,
    },
  ],
  toolStack: { names: ["Email blasts", "Group chats", "Facebook groups"], logos: ["/images/competitors/Gmail.png"] },
  comparison: [
    {
      label: "Announcement feed on the home page",
      mudkitchen: { value: "Yes, on the web and in the app", mark: "yes" },
      toolStack: { value: "Lost in an inbox or chat", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed; announcements go out as messages", mark: "unknown", source: BW_MESSAGING },
        playground: { value: "Yes, the Feed", mark: "yes", source: PG_FEED },
        "transparent-classroom": { value: "Yes, Home page feed", mark: "yes", source: TC_ANNOUNCE },
      },
    },
    {
      label: "Choose the audience",
      mudkitchen: { value: "Whole school, parents, teachers or programs", mark: "yes" },
      toolStack: { value: "One list or group per channel", mark: "partial" },
      rivals: {
        brightwheel: { value: "A whole classroom", mark: "yes", source: BW_MESSAGING },
        playground: { value: "Selected recipients", mark: "yes", source: PG_FEED },
        "transparent-classroom": { value: "School-wide or one classroom", mark: "yes", source: TC_ANNOUNCE },
      },
    },
    {
      label: "Schedule for later",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Email schedule send only", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_MESSAGING },
        playground: { value: "Yes", mark: "yes", source: PG_FEED },
        "transparent-classroom": { value: "Not mentioned", mark: "unknown", source: TC_ANNOUNCE },
      },
    },
    {
      label: "End date or pin until a date",
      mudkitchen: { value: "Yes, posts hide after an end date", mark: "yes" },
      toolStack: { value: "Old posts stay up", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_MESSAGING },
        playground: { value: "Pin until a date", mark: "yes", source: PG_FEED },
        "transparent-classroom": { value: "Not mentioned", mark: "unknown", source: TC_ANNOUNCE },
      },
    },
    {
      label: "Attachments",
      mudkitchen: { value: "Up to 5 files, 10 MB each", mark: "yes" },
      toolStack: { value: "Yes, or a Drive link", mark: "yes" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_MESSAGING },
        playground: { value: "Photos and videos up to 30 MB", mark: "yes", source: PG_FEED },
        "transparent-classroom": { value: "Yes, 20 MB total", mark: "yes", source: TC_ANNOUNCE },
      },
    },
    {
      label: "Text message (SMS) delivery",
      mudkitchen: { value: "No; email and app push", mark: "no" },
      toolStack: { value: "Group texts", mark: "yes" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_MESSAGING },
        playground: { value: "Yes, plus app and email", mark: "yes", source: PG_FEED },
        "transparent-classroom": { value: "Not mentioned; email and Home feed", mark: "unknown", source: TC_ANNOUNCE },
      },
    },
    {
      label: "Acknowledgment or read tracking",
      mudkitchen: { value: "Not yet", mark: "no" },
      toolStack: { value: "Varies by app", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_MESSAGING },
        playground: { value: "Acknowledge button and recipient list", mark: "yes", source: PG_FEED },
        "transparent-classroom": { value: "Not mentioned", mark: "unknown", source: TC_ANNOUNCE },
      },
    },
  ],
  faq: [
    {
      question: "Who gets notified when I publish?",
      answer:
        "Everyone in the audience you picked. Families and staff get an email and a push notification in the MudKitchen app, and the post appears on their home page and in their notification bell.",
    },
    {
      question: "Can I post to just one program?",
      answer:
        "Yes. Choose the whole school, parents, teachers, or one or more programs. Families in a program portal only see posts meant for that program.",
    },
    {
      question: "What happens when a post expires?",
      answer: "It hides from family and staff feeds after the end date you set. If you don't set one, it stays up until you archive it.",
    },
    {
      question: "Can I see who has read a post, or send it by text?",
      answer:
        "Not today. Bulletin posts go out by email and app push, not text message, and MudKitchen doesn't show which families have read them.",
    },
    {
      question: "Is Bulletin on every plan?",
      answer:
        "Bulletin isn't part of the Free plan. On paid plans it starts switched off, and we turn it on for your school when you're ready. Only school admins write posts; teachers read them.",
    },
  ],
  related: ["messages", "newsletters", "calendar"],
};
